---
layout:         post
title:          "KubeCon 2017 - Kubernetes Takeaways"
tags:           CNCF kubernetes
date:           2017-03-31 08:00:00 GMT
keywords:       kubecon, kubernetes, k8s, docker, containers
---

This is the first of two posts I've published with some notes and takeaways from two amazing days at the KubeCon Europe 2017 (the [second post]({{ site.base_url }}/kubecon-2017-prometheus-takeaways.html) is focused on Prometheus).

These notes have been primarely taken for myself, thus they could be incomplete, inexact, or no more true at the time you will read it, so don't give anything written here as the absolute source of truth. That said, enjoy reading!


## CNCF

The KubeCon was organized by the [Cloud Native Computing Foundation](https://www.cncf.io) (CNCF), a no-profit organization founded in late 2015 that provide supports for several open source projects, including Kubernetes and Prometheus. Recently two more projects have been added:

- containerd: the Docker runtime recently donated by Docker Inc.
- rkt (pronounced _rocket_): a pod native container runtime alternative to Docker

A couple of notes worth to mention about **rkt**:
- rkt has not a new image format, but supports Docker images
- rkt is currently 84/89 conformace with K8S

And about **containerd**:
- containerd 1.0 (mid 2017) will export a metrics API in the Prometheus format


## Kubernetes 1.6

Kubernetes 1.6 has been announced few hours before the begin of the conference, and it was the main protagonist. Kubernetes 1.6 is a major release that introduce some game changer features:

- Support up to 5K nodes (150K pods)
- RBAC (Role Based Access Control)
- Controlled Scheduling (node/pod affinity/anti-affinity and taints)
- Dynamic Storage Provisioning
- Improved stability (10 features moved from beta to stable)


## Role Based Access Control (RBAC)

[RBAC](https://kubernetes.io/docs/admin/authorization/rbac/) gives you the ability to define fine-grained permissions to users. It can be used to restrict API (and thus `kubectl`) privileges to a user (or group of users), and it comes very handy when you've multiple persons (or teams) deploying on the Kubernetes cluster, but you don't want to give cluster-wise privileges to everyone.

1. Define a role. A role can be defined within a **namespace** (to control pod authorization) or **cluster-wise** (to control cluster resources, like nodes). A role defines what can be done if you've that role binded.
2. Bind the role to an user or a group of users.
3. Configure `kubectl` to use a specific user credentials

Roadmap:

- RBAC will be moved to be default


## Kubernetes Scheduler

The [scheduler](https://github.com/kubernetes/community/blob/master/contributors/devel/scheduler.md) is one of the three main components of Kubernetes, and is responsible to select the node(s) where a given pod should run. Simplifying things a bit, the scheduler gets in input the intention to run a pod and returns in output the node where the pod should run.

The scheduler is a **pipeline** that goes through three stages:

1. List all nodes
2. Filter nodes by **Predicates**
3. Order (filtered) nodes by **Priorities**


### Scheduler Predicates

The scheduler predicates are functions that filter out nodes not eligible to run the given pod. There are many predicates, and many reasons why a pod can't run on a given node (including the node affinity predicates introduced in 1.6), but the main are:

- Prevent overcommit (honour resources requests)
- Prevent co-scheduling (node anti-affinity)
- Force co-scheduling (node affinity)
- Dedicated nodes (taints and tolerations)

To **prevent overcommit** each container declares its resources requests (CPU and memory). The **scheduler ignores the resources limits**, but honours the resources requests, filtering out nodes that have not enough resources left to run the given pod (the resources requests of a pod are the sum of the CPU and memory requests of each container composing it).


### Scheduler Priorities

The [scheduler priorities](https://github.com/kubernetes/kubernetes/tree/HEAD/plugin/pkg/scheduler/algorithm/priorities/) are functions that calculate a score for each node. Then nodes are sorted by score and the node(s) with the highest score will be selected to run the pod.

There are many priorities in Kubernetes, and each one will calculate its own score, so the priorities will run through three stages:

1. For each priority, calculate the node score
2. Combine the node scores into a single value
3. Sort nodes by combined score and pick the one with the highest value

Kubernetes run with a set of [default priorities](https://github.com/kubernetes/kubernetes/blob/master/plugin/pkg/scheduler/algorithmprovider/defaults/defaults.go) that can be overridden by passing the command-line flag `--policy-config-file` to the scheduler, pointing to a JSON file specifying which scheduling policies to use.

Some of the available priority functions are:
  - Most Requested: best fit algorithm, that favors nodes with most requested resources
  - Least Requested: worst fit algorithm, that favors nodes with fewer requested resources
  - Selector Spreading: when zone information is included on the nodes, it favors nodes in zones with fewer existing matching pods
  - Node Affinity
  - Pod Affinity
  - Pod Anti-Affinity
  - _and [few others](https://github.com/kubernetes/kubernetes/tree/master/plugin/pkg/scheduler/algorithm/priorities)_

The way scores are combined has not been covered extensively during the talk. Looking at the source code, it seems by default it's a weighted sum of all scores, where each score is weighted based upon a weight related to the priority itself.

The problem with the way Priorities work right now is that it's hard to predict where a pod will be scheduled. In Google, **Borg** uses a different strategy based on a decision tree: priorities are sorted by importance and the next priority will be evaluated only to sort nodes for which the previous priority has returned the same score. This way is much easier to predict where a pod will be scheduled, because scores are never combined together.


### Node Affinity

Node affinity allows you to constrain which nodes your pod is eligible to schedule on, based on labels on the node.

For example, the following node affinity rule says that the pod can be scheduled onto a node only if that node has a label whose key is `failure-domain.beta.kubernetes.io/zone` and whose value is either `az1` or `az2`:

```
nodeAffinity:
  requiredDuringSchedulingIgnoredDuringExecution:
    nodeSelectorTerms:
    - matchExpressions:
      - key: failure-domain.beta.kubernetes.io/
        operator: In
        values:
        - az1
        - az2
```

You can specify `nodeAffinity` and `nodeAntiAffinity`, `requiredDuringSchedulingIgnoredDuringExecution` (hard constrain) and `preferredDuringSchedulingIgnoredDuringExecution` (soft constrain).


### Pod Affinity

Pod affinity allows you to constrain which nodes your pod is eligible to schedule on based on labels on pods that are already running on the node rather than based on labels on nodes (ie. do not schedule a pod on a node that's already running the same pod).

For example, the following pod affinity rule says that the pod can be scheduled onto a node only if that node zone contains at least one already-running pod with label key "security" and value "S1" (can be on the same node or a different node in the same zone):

```
podAffinity:
  requiredDuringSchedulingIgnoredDuringExecution:
  - topologyKey: failure-domain.beta.kubernetes.io/zone
    labelSelector:
      matchExpressions:
      - key: security
        operator: In
        values:
        - S1
```

The `topologyKey` is the node label that the system uses to "group" nodes together, and restrict the affinity only to nodes matching the same topology key.

You can specify `podAffinity` and `podAntiAffinity`, `requiredDuringSchedulingIgnoredDuringExecution` (hard constrain) and `preferredDuringSchedulingIgnoredDuringExecution` (soft constrain).


### Taints and Tolerations

Taints can be used to ensure that pods are not scheduled onto inappropriate nodes. Once you apply a taint to a node, this taint applies to all pods, except the pods matching a toleration. Taints are applied to nodes, tolerations are applied to pods.

Add a taint to a node (taints have a key, a value and an effect):

```
kubectl taint nodes node1 key=value:NoSchedule
```

Then you can specify a toleration in the pod spec:

```
tolerations:
- key: "key"
  operator: "Exists"
  effect: "NoSchedule"
```

The taint / toleration above says:

1. Do not schedule any pod to `node1`, unless a pod has a toleration for `key` and for the effect `NoSchedule`
2. The pod specifies a toleration for the key `key` and effect `NoSchedule`, and it just requires the taint has a `value` (the operator is `Exists` but it could also check the value with `Equal`).

You can also specify an optional `tolerationSeconds` field that dictates how long the pod will stay bound to the node after the taint is added to the node when the pod is running.


### Future plans

- Priorities & preemptions
- Rescheduler
- Automatic resources estimation called "Vertical Pod Autoscaling" (long term plan)


### Further resources

- [Everything You Ever Wanted To Know About Resource Scheduling... Almost](https://speakerdeck.com/thockin/everything-you-ever-wanted-to-know-about-resource-scheduling-dot-dot-dot-almost)


## Kubernetes Autoscaling

There are two things you can (and should) autoscale on Kubernetes: Nodes and Pods. There are solutions provided by Kubernetes itself (Cluster Autoscaler and Horizontal Pod Autoscaler), 3rd party projects and other users are building their own autoscaling policies due to the limitations of the available ones.


### Cluster Autoscaler

The [cluster autoscaler](https://github.com/kubernetes/contrib/tree/master/cluster-autoscaler) is a **nodes autoscaler** provided by Kubernetes. It's a separate pod running on a master node, taking care of:

- Adding nodes when needed
- ~~Merging pods on under-utilized nodes~~ (_was mentioned during the talk, but I can't find any reference in the doc_)
- Removing nodes when unneeded

The cluster autoscaler has a main loop that:

1. Look for unschedulable pods (pods for which the scheduler has not been able to find a node to deploy them to)
2. Calculate which of the node groups can ben expanded to accomodate these pods and expands one of them
3. Check unneeded nodes, and remove them

A **node is unneeded when** all the following conditions are met:

1. Node utilization < 50%
2. All the pods running on the node can be moved elsewhere
3. There are no kube-system pods running on it (ie. kube-dns)
4. There are no pods with local storage

An unneeded **node is removed when** all the following conditions are met:

1. The node was unneeded for 10+ minutes
2. There was no scale up in the last 10+ minutes

The node removing / killing process has been designed to avoid (or at least limit to the minimum) service disruptions:

- Checks and honors the [`PodDisruptionBudget`](https://kubernetes.io/docs/tasks/configure-pod-container/configure-pod-disruption-budget/)
- Honor pod graceful termination up to 1 min
- Empty nodes are killed in bulk (up to 10 nodes)
- Non-empty nodes are killed 1 per time
- VM running the node is terminated by the cloud provider

Best practices:

- The cluster autoscaler assumes all nodes in the same group (ie. ASG) are identical: same cpu, same memory, same software running on the instance. So, do not manually edit nodes, otherwise you could break up the autoscaler.
- Use Pod Disruption Budgets (to tell that you don't want some pods to be interrupted)
- Get the status of the autoscaler with `kubectl describe configmap cluster-autoscaler-status --namespace=kube-system` and `kubectl get events`

Alternatives:

- OpenAI built an [internal node autoscaler based on EC2 ASG](https://github.com/openai/kubernetes-ec2-autoscaler), specifically designed for batch jobs
- Zalando uses [kube-aws-autoscaler](https://github.com/hjacobs/kube-aws-autoscaler) to autoscale nodes with AWS ASG. This project, even if much experimental, was born due to frustration with the "official" [cluster-autoscaler](https://github.com/kubernetes/contrib/tree/master/cluster-autoscaler).


### Horizontal Pod Autoscaler

The [Horizontal Pod Autoscaler](https://kubernetes.io/docs/user-guide/horizontal-pod-autoscaling/) is a Kubernetes controller that automatically scales pods up and down, based on observed CPU utilization. It also support custom metrics, but they're alpha and very limited, reason why many people is building custom pod autoscalers tailored to their needs.

The Pod Autoscaler is configured via `kubectl` specifying:

- `--min=` the minimum number of pods
- `--max=` the maximum number of pods
- `--cpu-percent=` the target CPU utilization (ie. 80%)

You can monitor the autoscaler activity with:

- `kubectl top`
- `kubectl describe hpa`


### Custom Pod Autoscalers

Due to the current strong limitations of the Horizontal Pod Autoscaler, many people is building their own autoscaler. Simplifying a bit, a pod autoscaler is not super complicated and should basically have a main loop with three stages:

1. Monitor a specific metric
2. Calculate the desired number of pods based upon the monitored metric
3. Call the K8S API to scale the pod to the desired number


## Kubernetes Security

What we have, where we're going:

![](https://pbs.twimg.com/media/C8Ej05qW4AElaGZ.jpg:large)

Some key points:

- Configure [`PodSecurityPolicy`](https://kubernetes.io/docs/user-guide/pod-security-policy/) and `MustRunAsNonRoot`
- Secure connections to etcd
- Setup an automatic pipeline to audit/scan images
- Enforce limits per namespace with [K8S limitrange](https://lukemarsden.github.io/docs/admin/limitrange/)
- Restrict networking with a `NetworkPolicy`

Some insights about what you can use to audit images:

- [Docker security scanning](https://docs.docker.com/docker-cloud/builds/image-scan/) (by Docker Inc.)
- Aquasec
- Twistloc
- Clair
- Neu Vector

NetworkPolicy:

- With a `NetworkPolicy` you can specify: pods subject to this policy, pods allowed to connect to the subjects, port(s) allowed
- You cap selected pods matching by label (ie: role: frontend)
- Once you've a `NetworkPolicy` on a namespace, configure `DefaultDeny` to deny intra-pod networking by default
- Recommendation: don't put it on a production system for the first time. It's very easy to get it wrong
- More info at [Zero Trust Networking](https://github.com/bvandewalle/kubecon-zerotrust)


## Overlay networks

Overlay networks, why?
- Can't get enough IP space (ie. AWS limitation of 50 subnets)
- Network can't handle extra routes
- Want management features

Overlay networks, why not?
- Latency overhead in some cloud providers
- Complexity overhead
- Often not required

**Use it only when you need it!**


## Kubernetes Cluster Federation

The cluster federation is an API Server (Federated Cluster) on top of single clusters API Servers. Right now, the federation has been designed to cover a single use case: when you've applications that span multiple clusters (ie. multiple AWS regions).

The federation is in a very early stage and it's not production ready. Just to give you an example, the `kubectl get pods` doesn't even support it, and you've to call it for each cluster with `--context=CLUSTER-NAME`. Despite this, cluster federation is definitely promising to run a cluster spanning across multiple regions or cloud providers, and in the next major versions we'll see many improvements on that.


## Custom Kubernetes Controller

A controller is an active reconciliation process:

1. Watch desired state and actual state
2. Make the changes to reach the desired state

Kubernetes allows you to build a custom controller, to extend the features and add custom logic. Before writing your first controller check out the following resources:

- [https://github.com/kubernetes/community](https://github.com/kubernetes/community) in particular [https://github.com/kubernetes/community/blob/master/contributors/devel/controllers.md](https://github.com/kubernetes/community/blob/master/contributors/devel/controllers.md)
- [https://github.com/aaaronlevy/kube-controller-demo](https://github.com/aaaronlevy/kube-controller-demo)
- source code of other controllers

The controller can be built in any language, but realistically it's written in GO since it's the only language with a full featured K8S SDK. Some helpful tools `client-go` has (or will have):

- During the talk has been given a demo of how to build a custom controller, with few good tips. Ie. Building a client that monitor a node continuously polling it is an option, but it's not very performant. A better solution is just getting notified when the node object changes, using an `Informer`
- Leader Election, could be used to have multiple controller replicas (but not yet in the client-go library)
- Work Queues, help to parallelize processing (will be introduced in client-go v.3)
- ThirdPartyResources, dynamically create new objects in the API


## Users insights

- Zalando runs 30+ clusters in production on AWS ([slides](https://www.slideshare.net/try_except_/kubernetes-on-aws-at-europes-leading-online-fashion-platform))
- OpenAI runs a large cluster in production
- Hauwei runs a 4K+ nodes cluster
- Buffer runs few micro services on Kubernetes
- [Philips Hue Lights backend](https://schd.ws/hosted_files/cloudnativeeu2017/82/KubeCon%202017%20-%20Your%20Philips%20Hue%20Lights%20are%20turned%20on%20by%20Kubernetes.pdf) fully runs on Kubernetes

Zalando:

- Uses [kube2iam](https://github.com/jtblin/kube2iam) to provide different IAM roles to different pods
- Uses [kube-job-cleaner](https://github.com/hjacobs/kube-job-cleaner) to cleanup completed / failed jobs
- Publishes some doc about how they [run K8S on AWS](https://kubernetes-on-aws.readthedocs.io)

Buffer:

- Use [loader.io](http://loader.io/) to run load benchmarks on pods, and then define the required resources (CPU and mem)


## Kubernetes Roadmap

- RBAC will be moved to be default
- Stateful upgrades
- Multi-workload scheduling
- More cloud providers support
- Service catalog


## Q&A with some people at the conf

**Q**: What's the best way to collect containers logs via Logstash?<br />
**A**: Run a DeamonSet with logstash client, mounting containers logs directory as a volume.

**Q**: When should an overlay network (ie. flannel, calico) be used?<br />
**A**: Only when you need it. They add complexity, more (potential) issues to debug, and have a network performance impact.

**Q**: How are kubernetes versions picked up for the the stable channel in kops?<br />
**A**: Maintainers pick up the "stable" version of K8S, based upon their considerations on stability, security and "other" factors. For minor versions, it's not a matter of the kops integration with K8S, but just K8S. It's different for major versions, since changes to kops may be required.

**Q**: Upgrade to K8S 1.6 with kops?<br />
**A**: See [1.6.0-alpha.1 release notes](https://github.com/kubernetes/kops/blob/master/docs/releases/1.6.0-alpha.1.md#160-alpha1).

**Q**: How to backup etcd EBS volumes?<br />
**A**: You can do EBS snapshots without the need to freeze the FS to get consistent snapshots (_source: CoreOS CTO_).

**Q**: Why can't work with 1 single etcd node (3 nodes, with 2 works, with 1 does not)?<br />
**A**: Because of [etcd quorum](https://coreos.com/etcd/docs/latest/faq.html).


## Next events

- KubeCon 2018 - May 2-4 - Copenhagen, Denmark
