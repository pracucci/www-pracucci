---
layout:         post
title:          "Lessons learned running AWS Cloud Map service discovery for EC2 instances"
tags:           aws
date:           2019-06-28 12:00:00 GMT
keywords:
---


At [Voxnest](https://www.voxnest.com) - the company behind [Spreaker](https://www.spreaker.com), [Dynamo](https://www.voxnest.com/dynamo/) and [BlogTalkRadio](http://www.blogtalkradio.com/) - we're doing an extensive usage of Kubernetes and Serverless solutions.

These technologies cover most of our needs, but we still have few specific use cases where self-managed clusters of EC2 instances are the best trade-off.


## Introducing Cloud Map for service discovery

We recently had the need to expose an application running on a self-managed cluster of EC2 instances through a service discovery, and we started using Cloud Map.

Cloud Map allows you to define a logical entity called "service" which keeps a pool of healthy endpoints called "instances". Multiple services are organized in "namespaces".

The naming "instance" - in relation to a Cloud Map service - may you erroneously think you can just register EC2 instances to a service, but you can actually register any IP:PORT endpoint wherever it runs, whether it's an EC2 instance, an ECS task, a server outside AWS or whatever.

Cloud Map offers an API to register and deregister an instance from a service, supports health checking, and allows to query the service instances via DNS or API.

We found Cloud Map simple yet effective for non complex setups, but at the same time we've learned a couple of failure scenarios you should be aware of:

- [An unhealthy instance is registered to Cloud Map](#failure-scenario-an-unhealthy-instance-is-registered-to-cloud-map)
- [A terminated EC2 instance is not deregistered from Cloud Map](#failure-scenario-a-terminated-ec2-instance-is-not-deregistered-from-cloud-map)


## Failure scenario: an unhealthy instance is registered to Cloud Map

At the beginning of our experience with Cloud Map, we were assuming that when you register an instance to a Cloud Map service, the instance is added to the pool of healthy instances as soon as the first health check succeed. However, before going to production, we decided to run an extensive test to verify this assumption and we found out we were wrong.

Cloud Map supports two different types of health checks:

1. Route 53 health check
2. Custom health check

A **Route 53 health check** requires the service to be publicly exposed via HTTP(S) or TCP protocol. It's fully managed and straightforward to use, and it's usually a no-brainer choice for publicly exposed services.

A **custom health check**, on the contrary, is self-managed: it's your responsability to run health checks against the instances registered to the service discovery and keep their status updated calling the [`UpdateInstanceCustomHealthStatus`](https://docs.aws.amazon.com/cloud-map/latest/api/API_UpdateInstanceCustomHealthStatus.html) API. This allows you to monitor instances on private networks or to run the health check on a custom protocol.

An health check status can be `HEALTHY` or `UNHEALTHY`. As you can guess, an instance is removed from the pool of healthy instances when its status is `UNHEALTHY` and added back to the pool once `HEALTHY`.

However, a **Route 53 health check** may also have a third state `UNKNOWN`. The unknown state is the initial state of an health check before the first check runs. Contrary to our initial assumption, our experiments showed that when a Route 53 health check is in the `UNKNOWN` state, its instance is added to the pool of healthy instances.

| Health Check Status | Route 53 | Custom |
| ------------------- | -------- | ------ |
| `HEALTHY`           | ✅       | ✅    |
| `UNHEALTHY`         | ✅       | ✅    |
| `UNKNOWN`           | ✅       | -     |

This opens to following failure scenario:

1. An application is started on a new instance, but it's not ready to serve traffic yet
2. The instance is added to the service discovery and its Route 53 health check status is `UNKNOWN`
3. Production traffic starts getting routed to the new instance, but requests fail because not ready
4. The instance health check fails and the instance is removed from the pool of healthy instances
5. The application startup completes and the instance is now ready to serve traffic
6. The instance health check succeeds and the instance is added to the pool of healthy instances

{% image 2019-06-28-aws-cloud-map-initial-unknown-health-check-status %}


**How to protect from this failure scenario**

To protect from this failure scenario, you should register an instance to the Cloud Map service with Route 53 health check only once the instance is ready to serve traffic.

If you're using custom health checks, the [`RegisterInstance` API](https://docs.aws.amazon.com/cloud-map/latest/api/API_RegisterInstance.html) supports `AWS_INIT_HEALTH_STATUS` attribute to specify the initial status of the custom health check, `HEALTHY` or `UNHEALTHY` (defaults to `HEALTHY`), but unfortunately this attribute has no effect if you're using Route 53 health checks.


## Failure scenario: a terminated EC2 instance is not deregistered from Cloud Map

Looking at examples of integration between Cloud Map and EC2 instances, we've seen that a common practice is to have the EC2 instance itself registering to the Cloud Map service (via API) once the application is ready to serve traffic and deregister it at application / instance shutdown.

This approach works as far as the shutdown hook is reliable and guaranteed to be executed in any condition. However, if it's the responsability of the EC2 instance to deregister itself, you may miss to deregister it in case of EC2 instance failure, or any temporary error (ie. networking issue) that may occur at shutdown, or a bug in your shutdown script.

At first, we thought the health check would have protected us from this failure scenario. In the unlikely event the EC2 instance fail and the shutdown script is not called, the Cloud Map service health check will fail and will remove the instance from the pool of healthy endpoints.

Despite this is true, we experienced a way worse failure scenario following up the condition we've just described. The public IP address of the terminated EC2 instance - which is still erroneously registered to the Cloud Map service - is recycled by AWS and assigned to a new EC2 instance not belonging to our AWS account.

Unlikely, the new third party EC2 instance - with the recycled IP assigned - was running an HTTP server on the standard port, the Route 53 health check began succeeding and this "spurious" EC2 instance IP has been added back to the pool of healthy endpoints, despite was not running our own application.

{% image 2019-06-28-aws-cloud-map-a-terminated-instance-is-not-deregistered.png %}


**How to protect from this failure scenario**

This was not a Cloud Map failure. This was a failure in how we initially integrated with Cloud Map.

There are multiple ways to better integrate without hitting this issue. One of them is to deregister the EC2 instance in a Lambda triggered by an EC2 event (you may want to introduce SQS + a deadletter queue to protect from temporary failures while deregistering).

Another may be implementing an external controller to register and deregister the instance, without having to run it from the EC2 instance itself. In this case you may also need to run health checks before registering the instance, to avoid to fall in the case [an unhealthy instance is registered](#failure-scenario-an-unhealthy-instance-is-registered-to-cloud-map).

The solution we came up with is to keep the register and deregister in the instance itself, but to also run an external controller to remove terminated EC2 instances from the Cloud Map service, with a tiny application we released open source:

- [`aws-cloud-unmap` on GitHub](https://github.com/spreaker/aws-cloud-unmap)
- [`aws-cloud-unmap` Python package](https://pypi.org/project/aws-cloud-unmap/)
- [`aws-cloud-unmap` Docker image](https://hub.docker.com/r/spreaker/aws-cloud-unmap/)
