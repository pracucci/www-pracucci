---
layout:         post
title:          "EC2 instances service discovery with AWS Cloud Map"
tags:           aws
date:           2019-04-12 05:00:00 GMT
keywords:
---


At [Voxnest](https://www.voxnest.com) - the company behind [Spreaker](https://www.spreaker.com), [Dynamo](https://www.voxnest.com/dynamo/) and [BlogTalkRadio](http://www.blogtalkradio.com/) - we're doing an extensive usage of Kubernetes and Serverless solutions.

These technologies mostly cover all our needs, but we still have few specific use cases where self-managed clusters of EC2 instances are the best trade-off.


## Failure scenario: an unhealthy instance is registered to Cloud Map

At the beginning of our experience with Cloud Map, we were assuming that when you add an instance to a Cloud Map service, the instance is added to the pool of healthy instances as soon as the first health check succeed. However, before going to production, we decided to run an extensive test to verify this assumption and we found out we were wrong.

Cloud Map supports two different types of health checks:

1. Route 53 health check
2. Custom health check

A **Route 53 health check** requires the service to be publicly exposed via HTTP(S) or TCP protocol. It's fully managed and straightforward to use, and it's usually a no-brainer choice for publicly exposed services.

A **custom health check**, on the contrary, is self-managed: it's your responsability to run health checks against the instances registered to the service discovery and keep their status updated calling the [`UpdateInstanceCustomHealthStatus`](https://docs.aws.amazon.com/cloud-map/latest/api/API_UpdateInstanceCustomHealthStatus.html) API. This allows you to monitor instances on private networks or to run the health check on a custom protocol.

An health check status can be `HEALTHY` or `UNHEALTHY`. As you can guess, an instance is removed from the pool of healthy instances when its status is `UNHEALTHY` and readded to the pool once it switches back to `HEALTHY`.

| Health Check Status | Route 53 | Custom |
| ------------------- | -------- | ------ |
| `HEALTHY`           | ✅       | ✅    |
| `UNHEALTHY`         | ✅       | ✅    |
| `UNKNOWN`           | ✅       | -     |

However, a Route 53 health check may also have a third state `UNKNOWN`. The unknown state is the initial state of an health check before the first check runs. Contrary to our initial assumption, our experiments showed that when a Route 53 health check is in the `UNKNOWN` state, its instance is added to the pool of healthy instances. This opens to following failure scenario:

1. An application is started on a new instance, but it's not ready to serve traffic yet
2. The instance is added to the service discovery and its Route 53 health check status is `UNKNOWN`
3. Production traffic begins routing to the new instance, but requests fail because not ready
4. The instance health check fails and the instance is removed from the pool of healthy instances
5. The instance is now ready
6. The instance health check succeeds and the instance is added to the pool of healthy instances
