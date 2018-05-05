---
layout:         post
title:          "KubeCon Europe 2018 - Memo and Takeaways"
tags:           linux
date:           2018-05-05 07:00:00 GMT
keywords:
---

The [KubeCon and CloudNativeConf Europe 2018](https://events.linuxfoundation.org/events/kubecon-cloudnativecon-europe-2018/) is just over and it was really a blast! I had the opportunity to meet and talk with a lot of talented and smart people, share ideas and learn, learn a lot.

Despite the conference and the city are quite expensive for people - like me - coming from the south of Europe, it was really worth the money and my feeling at the end of the conference was more or less this:

<blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">A deep sense of sadness hit me tonight. I enjoyed this <a href="https://twitter.com/hashtag/KubeCon?src=hash&amp;ref_src=twsrc%5Etfw">#KubeCon</a> more than any other conf. Really, it was a blast! I will miss the amazing talented people I&#39;ve met. From the deep of my hearth, I would like to work with all of you. Kudos, great community.</p>&mdash; Marco 🇪🇺 (@pracucci) <a href="https://twitter.com/pracucci/status/992485766092787713?ref_src=twsrc%5Etfw">May 4, 2018</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

I'm used to take notes at each conference I attend and KubeCon was not an exception. In this post I will **share random notes and takeaways from the conf**, in the form of a **publicly-shared internal memo**. They're opinionated random notes about talks and people. It doesn't pretend to be neither discursive, complete or fully accurate. They're just my notes, as a starting point from which I will deep dive into the next weeks and months.


---


In this memo:

- [Notes on autoscaling](#notes-on-autoscaling)
- [Notes on networking](#notes-on-networking)
- [Notes on AWS EKS](#Notes on-aws-eks)
- [Notes on security](#notes-on-security)
- [Notes on tools](#notes-on-tools)


---


## Notes on autoscaling

Kubernetes support three types of autoscaling:
- [Horizontal Pod Autoscaler](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/) (HPA)
- [Vertical Pod Autoscaler](https://github.com/kubernetes/autoscaler/tree/master/vertical-pod-autoscaler) (VPA)
- [Cluster Autoscaler](https://github.com/kubernetes/autoscaler/tree/master/cluster-autoscaler) (CA)

**Horizontal Pod Autoscaler** (HPA)
- Scales up/down the number of replicas of a pod.
- Requires gauge metrics.
- Built-in support for CPU and memory pod metrics.
- Works best with stateless applications.

**Vertical Pod Autoscaler** (VPA)
- Adjust resource **requests** (CPU and Mem requests) for the containers in a pod, based on usage. Since currently it's not possible to change container resources without restarting the pod, Kubernetes will **restart the pod** each time the resources change.
- Can operate in three modes:
  1. `Auto`: VPA assigns resource requests on pod creation as well as updates them on running pods (default).
  2. `Initial`: VPA only assigns resource requests on pod creation and never changes them later.
  3. `Off`: VPA just calculate the recommended resources - not applying them to the pod - and allow the human operator to inspect them via the VPA object and eventually manually apply them on the pod.
- Controlled by a Custom Resource Definition object called [`VerticalPodAutoscaler`](https://github.com/kubernetes/autoscaler/blob/master/vertical-pod-autoscaler/pkg/apis/poc.autoscaling.k8s.io/v1alpha1/types.go) which allow to select the pod to autoscale by labels, set the operating mode and min/max allowed resources.
- VPA should be used when HPA is not an option or not appropriate (ie. StatefulSets).
- It's strongly suggested to not mix VPA and HPA. They both try to solve the same exact problem in a different way, and they conflict if run together on the same pod - unless very special care is taken.

**Cluster Autoscaler** (CA)
- Adjust the number of nodes in the cluster.
- It's quite complex since it runs a "simulation" of the pods scheduler in order to determine which nodes pool should be scaled up/down and allows you to set some "extra buffer" to always have some spare resources on the cluster.
- An alternative (simpler) cluster autoscaler for AWS ([kube-aws-autoscaler](https://github.com/hjacobs/kube-aws-autoscaler)) has been built at Zalando and run it in production for quite a long time, while they now moved to the Kubernetes CA.

**What's about the future?**
- In Kubernetes 1.1 the HPA autoscaler will be able to autoscale based on CRDs, so that it can be used to scale not just pods but custom resources too
- Prediction by [Frederic Branczyk](https://twitter.com/fredbrancz): cluster autoscaler will not to be a special case at some point in the future


### Horizontal Pod Autoscaling with custom metrics (Prometheus)

Kubernetes 1.8 introduced **Resource and Custom Metrics API**, as an attempt to decouple the HPA from Heapstep/cAdvisor metrics and allow to autoscale based on custom metrics (ie. Prometheus) or external metrics (outside the cluster).

Resource and Custom Metrics API is not an implementation, but an API specification implemented and maintaned by vendors. The contract of such APIs is that each metric should **return a single value** upon which the HPA will scale the workload.

**Resource Metrics API**

- Collects resource metrics (currently CPU and memory).
- [`metrics-server`](https://github.com/kubernetes-incubator/metrics-server) is the canonical implementation, which collects metrics from the `kubelet` stats API every minute and holds the state - all values on Pods and Nodes - in memory.

**Custom Metrics API**

- Allows requesting arbitrary metrics.
- It's a [specification](https://github.com/kubernetes/community/blob/master/contributors/design-proposals/instrumentation/custom-metrics-api.md) and no canonical implementation is provided.  Implementations are specific to the respective backing monitoring system.
- The first monitoring system supported was Prometheus by [k8s-prometheus-adapter](https://github.com/DirectXMan12/k8s-prometheus-adapter) (an "adapter" is the implementation of the custom metrics API for a specific backing monitoring system).
- Supported Kubernetes objects are `Pod`, `Service` or `Deployment`.

**External Metrics API**

- Introduced in Kubernetes 1.10 (alpha).
- Allow to autoscale based on metrics not related to any Kubernetes object and coming from outside the Kubernetes cluster (ie. number of jobs in a queue).
- The design is similar to _Custom Metrics API_ and external metrics are ingested via an adapter as well.


---


## Notes on networking

Networking is hard and Kubernetes networking is harder. However, the overall outcome of this KubeCon is that we should stop getting scared about Kubernetes networking and better understand how it works. It's complicated, but there's no magic behind it and - with some study and practice - it's approachable.

### Debugging networking issues

In case of a networking issue, the first thing to do is to collect information. Two suggested starting points (in case no overlay network is used):
1. Dump the iptables rules with `iptables-save`, in order to get a snapshot of the current rules for later analysis (before they change and maybe the issue vanish).
2. Use `conntrack -L` to list all connections tracked by the Connection Tracking System, which is the module that provides stateful packet inspection for iptables and has a primary role in packets routing.

Slides: [Blackholes &amp; Wormholes: Understand and Troubleshoot the "Magic" of k8s Networking](https://schd.ws/hosted_files/kccnceu18/e7/Blackholes%20%26%20Wormholes%20-%20KubeCon%202018%20%281%29.pdf)

### CNI

The [CNI](https://github.com/containernetworking/cni) (Container Network Interface) is a both a specification document and a set of "base" (common) plugins aiming to abstract the way applications (ie. Kubernetes) add and remove network interfaces on the host. CNI specification is not Kubernetes-specific, while being supported by Kubernetes.

The goal is to provide an interface layer between the application and the host, and a set of interchangeable community/vendor driven plugins that do the real work to attach/detach/configure network interfaces.

The specification is very simple and currently support `ADD` and `REMOVE` operations, while a `GET` is going to be introduced soon. The specification is still a draft, but close to be finalized in the `1.0` version (should be released by the end of 2018) after which the specification will be considered feature freeze, and the whole effort will be put in adding and/or improving plugins.

**AWS** has developed two CNI plugins:
- [CNI plugin for AWS ECS](https://github.com/aws/amazon-ecs-cni-plugins)
- [CNI plugin for Kubernetes Pods using ENIs](https://github.com/aws/amazon-vpc-cni-k8s)

### Pods networking in Kubernetes using AWS Elastic Network Interfaces

The [amazon-vpc-cni-k8s](https://github.com/aws/amazon-vpc-cni-k8s) plugin is very interesting because it allows to setup a Kubernetes cluster where pods networking is based on the VPC native networking using multiple ENIs attached to the EC2 instance. Using this plugin, all pods and all nodes will be addressable in the same VPC network space.

Since the number of ENIs that can be attached to an EC2 instance is [limited](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-eni.html), the plugin leverage on the ability to add multiple secondary IPs to each ENI in order to increase the number of Pods addressable on each node (the number depends on the instance type).

The plugin reserves 1 IP per ENI for its own purposes, while the remaining ones can be used for Pods networking. For example, a `c4.large` instance can attach up to 3 interfaces, each can have up to 10 addresses and so the total number of pods schedulable on a `c4.large` instance using ENI networking is `3 * (10 - 1) = 27` that sounds quite reasonable unless you've a bunch of micro pods.

The `amazon-vpc-cni-k8s` plugin is used in EKS as well. According to [Anirudh Aithal](https://github.com/aaithal) (AWS Engineer) it can already be used for production workload despite the official status is still alpha (will be switched to stable once EKS enters GA). I've also talked to few people at the conference already using it in production (with no issues).

Slides:
- [Cloud native container networking in AWS using CNI plugins](https://schd.ws/hosted_files/kccnceu18/6f/KC_CNC_EU_2018_CNI_AWS.pdf)
- [Introducing Amazon EKS (`.pptx`)](https://schd.ws/hosted_files/kccnceu18/d2/Intro%20to%20EKS%20Kubecon%202018.pptx)


---


## Notes on AWS EKS

I didn't met anyone having access to EKS (I wasn't much lucky on this), despite most of the people I've met run Kubernetes on AWS. People running multi cloud states GKE is a step above and works really well. There's consensus on this.

**Key Points:**
- EKS is a certified distribution of Kubernetes and will run Kubernetes upstream (no forked / reduced version).
- EKS manage Kubernetes masters (HA) and etcd (HA, 3 AZs, encrypted, does backups), while workers must be provisioned and managed by customers.
- Allow to specify the major version (ie. `1.9`) while EKS will keep all masters automatically updated to the latest minor (ie. to patch security issues).
- Allow to setup manual or automatic major version upgrades.
- Masters and etcd are not directly accessible.
- Masters are automatically vertically scaled (EC2 instance type) based on the number of pods running on the cluster (_very cool_).
- No customer-provided pods can be scheduled on masters.
- EKS pods scheduling is aware of the maximum number of pods schedulable on each worker node (due to ENI limitation).

**Networking:**
- EKS setup a public load balancer in front of the API servers (ie. `mycluster.eks.amazonaws.com`). Support for internal load balancer is on the roadmap, but will be likely introduced after GA.
- Pods networking uses the [VPC native networking](#pods-networking-in-kubernetes-using-aws-elastic-network-interfaces).

**Authentication:**
- Takes care of certificates management, supporting certificates rotation.
- There's no AWS-maintained plugin to assign IAM roles to pods. The community driven [`kube2iam`](https://github.com/jtblin/kube2iam) is the best option available so far, even if not much recommended by AWS (at some point they might work on a solution based on [spiffe](https://github.com/spiffe/spiffe)).
- `kubectl` authentication is based on IAM, using [heptio-authenticator-aws](https://github.com/heptio/authenticator). The AWS Identity is only used for the `kubect` authentication and - once authenticated - Kubernetes native RBAC is used for the authorization. It requires `kubectl` 1.10+ since support for pluggable authentication providers has been added in this version.

IAM authentication works like this:
  1. `kubectl` passes the AWS Identity to K8S API server
  2. The K8S API Server verifies the AWS Identity with the AWS Auth API
  3. On success, it authorize the AWS Identity with RBAC

{% image 2018-05-05-eks-iam-auth.png %}

_Source_: [Introducing Amazon EKS](https://schd.ws/hosted_files/kccnceu18/d2/Intro%20to%20EKS%20Kubecon%202018.pptx)

**Preview vs GA:**
- EKS preview is not production ready, do not run production workload.
- EKS preview requires a custom version of `kubectl` for the cluster authentication, while EKS GA will support the streamline `kubectl`.
- EKS preview requires a pre-configured AMI provided by AWS and created with a Packer script. AWS will opensource the Packer script once EKS will reach GA, so that customers can build their own workers AMI based on the AWS Packer script.
- EKS GA will "destroy" all clusters created in preview, so another good reason to not run production workload.
- EKS GA will be ready by the end of the year (hopefully before).

**What's about the future?**
- Fargate for EKS might be introduced (similar to the currently available Fargate for ECS).

Slides: [Introducing Amazon EKS (`.pptx`)](https://schd.ws/hosted_files/kccnceu18/d2/Intro%20to%20EKS%20Kubecon%202018.pptx)


---


## Notes on security

I'm the engineer most far from being a security expert you may find, so here is an attempt to sum up some of things I've heard around the topic.

Kubernetes is a complex system with many layers of attack surfaces exposed to internal threats. What we mean by internal threats is any attack driven from inside the container, like when you run untrusted containers on your cluster or an attacker gets access to one of your containers via an external threat.

**Internal threats attack surfaces:**
- Kernel (attacks via syscalls)
- Storage (ie. `CVE-2017-1002101` host-resolved symlinks)
- Network (ie. `kubelet` API server or AWS metadata service at `169.254.169.254`)
- Daemons (ie. logging)
- Hardware (ie. Spectre v2)

{% image 2018-05-05-all-code-is-vulnerable.png %}


### Attacks via kernel syscalls

**Run as non root**

Configure pods to run as non root:

```
spec:
 securityContext:
 runAsUser: 1234
 runAsNonRoot: true
```

And prevent `setuid` binaries from changing the effective user ID, setting the [`no_new_privs`](https://www.kernel.org/doc/Documentation/prctl/no_new_privs.txt) flag on the container process:

``` 
containers:
 - name: untrusted-container
   securityContext:
     allowPrivilegeEscalation: false
```


**Drop capabilities**

Historyically Linux had two categories of processes: privileged (run by root) and unprivileged (run by non-root). Privileged processed bypass all kernel permission checks, while unprivileged processed are subject to permission checking based on the process's credentials (UID, GID).

Starting from Kernel 2.2, Linux introduced **capabilities** which is a way to split privileges - traditionally associated with root user - into distinct units which can ben independently enabled and disabled on non-root processes (technically they are a per-thread attribute).

By default, Docker has a default list of capabilities that are kept and should be dropped when unnecessary. Default capabilities include but are not limited to:

- `CAP_SET_UID`: Change UID
- `CAP_NET_BIND_SERVICE`: Listen on privileged ports
- `CAP_KILL`: Send signals to any process
- `CAP_CHOWN`: Change owner of any file

See:
- [Docker runtime privilege and default Linux capabilities](https://docs.docker.com/engine/reference/run/#runtime-privilege-and-linux-capabilities)
- [Set capabilities for a Container on Kubernetes](https://kubernetes.io/docs/tasks/configure-pod-container/security-context/#set-capabilities-for-a-container)


**Seccomp**

Seccomp limits the system calls a process (container) can make. Vulnerabilites in syscalls that are not allowed won't hurt anymore. Seccomp profiles in pods can be controlled via annotations on the `PodSecurityPolicy` (alpha feature).

See: [Seccomp on Kubernetes doc](https://kubernetes.io/docs/concepts/policy/pod-security-policy/#seccomp)


**AppArmor**

AppArmor is a Linux kernel security module that supplements the standard Linux user and group based permissions to confine programs to a limited set of resources. It basically allows you to define a mandatory access control through profiles tuned to whitelist the access needed by a specific container, such as Linux capabilities, network access, file permissions, etc.

See: [AppArmor on Kubernetes doc](https://kubernetes.io/docs/tutorials/clusters/apparmor/)


**Rootless containers**

Even if we don't run containers as root, the system used to run containers (ie. the Docker daemon) still run as root. The talk "[The route to rootless containers](https://schd.ws/hosted_files/kccnceu18/08/route_to_rootless_slides.pdf)" illustrates issues found to run rootless containers and current solutions to circumvent it.


**Sandboxed pods**

Google has a policy that there should be two distinct defence layers for pods running untrusted code. Given syscalls get directly executed on the host's kernel, adding a second layer of defence in front of syscalls means running each container on its own (lightweight) kernel, on top of the host's kernel.

There are two main projects to run sandboxed pods:
- [katacontainers](https://katacontainers.io/)
- [gVisor](https://github.com/google/gvisor)

[**gVisor**](https://github.com/google/gvisor) is a user-space kernel - recently opensourced by Google - that implements a substantial portion of the Linux system surface. It includes an OCI runtime called `runsc` that provides an isolation boundary between the application and the host kernel. The `runsc` runtime integrates with Docker and Kubernetes, making it simple to run sandboxed containers.

gVisor introduces some performance penalties (working on it), it's not 100% compatible with `runc` (ie. some features are not supported due to security reasons) and some work has been left to have a full hardening (ie. networking).

{% image 2018-05-05-gvisor.png %}

Kubernetes `1.12` will introduce Container Runtime Interface (CRI) API support (alpha) and basic Katacontainers and gVisor implementations - leveraging on CRI - should be expected.

In the **future**, running sandboxed pods may be as much simple as enabling `sandbox` in a pod's security context (API still under discussion):

```
spec:
 securityContext:
   sandboxed: true
```

Slides: [Secure Pods](https://schd.ws/hosted_files/kccnceu18/96/Secure%20Pods%20-%20KubeCon%20EU%202018.pdf)


### Attacks via system logs

Each container logs to `/dev/stdout` and `/dev/stderr`. Such logs are collected by the `kubelet` and usually processed / parsed by a logging agent (ie. fluentd or logstash) running on the host. Vulnerabilities in logging agents or their dependencies are not uncommon, and they should be protected as well.

Running the logging agent in a pod (instead of directly on the host), as well as keeping such software updated, and applying the other security best practices is a good starting point to protect from attacks via system logs.


### Building Docker images without Docker

The topic is not strictly related to security but is somewhat related when it comes to building Docker images in a secure way from a container running on top of Kubernetes (_use cases not limited to this_).

The goal around the work people is doing on building Docker images without Docker is to ideally split images building, push/pull and run into different tools.

There are two main approaches:
- Daemon-less
- Runtime-less

**Daemon-less**

Tools available to build Docker images without running the Docker daemon:
- [projectatomic/buildah](https://github.com/projectatomic/buildah)
  - No docker daemon involved
  - Can build from `Dockerfile`
- [genuinetools/img](https://github.com/genuinetools/img)
  - No docker daemon involved
  - Can build from `Dockerfile`
  - The CLI commands UX are the same as docker build/push/pull/login, so it's easy to replace existing `docker` integrations
  - Uses runc rootless containers (unprivileged on host but not in a container)

**Runtime-less**

The idea is to get more portable tools not depending on Linux namespaces or cgroups, so that they're easier to nest inside existing containerized environments:
- [GoogleContainerTools/distroless](https://github.com/GoogleContainerTools/distroless)
  - No `Dockerfile` support
  - Images not based on a distro, but it just packages your application and runtime dependencies (no shell, no package manager), that's both a pro and a con depending on the use case (but it's a security best practice)
  - It uses `libc` instead of `musl libc` causing larger final images compared to alpine on some circumstances
- [GoogleContainerTools/kaniko](https://github.com/GoogleContainerTools/kaniko)
  - The new kid on the block
  - Can build from `Dockerfile`
  - Meant exclusively for running inside containerized environments (ie. Kubernetes)
  - Snapshots layer "naively" without union FS (slower)
  - No runtime or nested containers
  - [gVisor](https://github.com/google/gvisor) (uses a runtime called `runsc` that provides an isolation boundary between the application and the host kernel) + [kaniko](https://github.com/GoogleContainerTools/kaniko)] should be considered the secure way to build untrusted images on a Kubernetes cluster

Slides: [Building Docker Images without Docker](https://schd.ws/hosted_files/kccnceu18/c9/Building%20Docker%20Images%20without%20Docker.pdf)



---


## Notes on tools

### kops

The overall feeling about `kops` is that it's still the best tool to provision a Kubernetes cluster on AWS. Every people I talked to use `kops` in our exact same way (Terraform, no `kops` cli operations, custom solution to manage rolling updates). Didn't met anyone using `kops` rolling updates in production.

The ability to [decouple `etcd` nodes from K8S masters](https://github.com/kubernetes/kops/issues/2216) is a feature currently under discussion, but no progress has been made yet. Some people recommend not running etcd on the same masters node, other doesn't see much issues doing so (I personally see a stronger setup doing the decoupling).

People in favor of splitting etcd from masters, recommends 3+ `etcd` nodes and 2+ Kubernetes master nodes (scale above two masters only if need to scale up API servers). Moreover the way `kops` setup the masters is having each API server connecting to the **local** `etcd` node (for low latency reasons), that makes this setup potentially more fragile than having a balancer in front of an HA pool of `etcd` nodes.


### k8s-spot-termination-handler by Pusher

DeamonSet deployed on nodes running on AWS Spot instances, that continously watch the AWS metadata service and gracefully drain the node itself when the spot instance receives a termination notice (precisely 2 minutes before it's termination).

Source: [k8s-spot-termination-handler](https://github.com/pusher/k8s-spot-termination-handler)


### microscanner by Aqua Security

Free-to-use tool for scanning your container images for package vulnerabilities, based on the same vulnerabilities database of Aqua's commercial solution. MicroScanner is a binary running during the build steps in a `Dockerfile` and returns a non-zero exit code (plus a JSON report) if any vulnerability has been found:

```
ADD https://get.aquasec.com/microscanner /
RUN chmod +x microscanner
RUN microscanner <TOKEN>
```

A part from adding it directly to the `Dockerfile` (that's questionable in my opinion), I personally see it very easy to integrate in a CI/CD pipeline, where on-the-fly Docker images are built `FROM` the to-be-tested image in a dedicated CI/CD step, `microscanner` gets executed and its output parsed.

Source: [Aqua’s New MicroScanner: Free Image Vulnerability Scanner for Developers](https://blog.aquasec.com/microscanner-free-image-vulnerability-scanner-for-developers)


### heptio-authenticator-aws by Heptio

A tool for using AWS IAM credentials to authenticate `kubectl` to a Kubernetes cluster. Requires `kubectl` 1.10+.

Source:
- [Deploying the Heptio Authenticator to kops](https://aws.amazon.com/blogs/opensource/deploying-heptio-authenticator-kops/)
- [Heptio Authenticator for AWS](https://github.com/heptio/authenticator)


### Kubervisor by AmadeusITGroup

Kubervisor is an operator that control **which pods should receive ingress traffic or not based on anomaly detection**.

The anomaly detection is based on an analysis done on custom metrics (supports Prometheus) and decisions are taken at the controller level (not on each single pod independently) so that the controller can avoid major distruptions in case the majority of pods are detected as unhealthy (this controller removes traffic from pods only if a minority of them are unhealthy). The query and threshold configuration is up to the user, and can be driven by technical and/or business requirements.

It's worth to note that the only "write" action done by kubevisor is relabelling pods so that an opportunely configured Service won't match the unhealthy pod labels and thus will remove traffic from it.

Ie. by default each pod has `kubervisor/traffic=yes` label and this label matching is added to the `Service`; unhealthy pods will be relabeled to `kubervisor/traffic=no`, causing the `Service` to unmatch the unhealthy pods and get them removed from the pool of available pods.

It's **not** used in production yet.

Source:
- [Kubervisor](https://github.com/AmadeusITGroup/kubervisor)
- Slides: [Kubervisor: Pod Anomaly Detection](https://schd.ws/hosted_files/kccnceu18/e8/%5Bkubecon%5D%5BKopenhagen-2018%5D%20Kubervisor.pdf)


### Operator Framework

CoreOs (now RedHat) has [recently announced](https://coreos.com/blog/introducing-operator-framework) the [`operator-framework`](https://github.com/operator-framework), a Go lang framework to ease building operators (or controllers - they're the same thing, just a different naming).


---


## Keynotes really worth to watch

Most keynotes have been very interesting, but here I've shared my top three that - in some way - have inspired me. You can watch all KubeCon / CloudNativeCon videos (keynotes and talks) in this [YouTube playlist](https://www.youtube.com/playlist?list=PLj6h78yzYM2N8GdbjmhVU65KYm_68qBmo).


### Switching Horses Midstream: The Challenges of Migrating 150+ Microservices to Kubernetes

<iframe width="100%" height="315" src="https://www.youtube.com/embed/H06qrNmGqyE?showinfo=0" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>


### Anatomy of a Production Kubernetes Outage

<iframe width="100%" height="315" src="https://www.youtube.com/embed/OUYTNywPk-s?showinfo=0" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>




---

TODO review from here

---






## TODO

- notes about the organization
- tweets shared on email
- https://schd.ws/hosted_files/kccnceu18/b2/%E2%80%9CBreak%20and%20Recover%E2%80%9D%20Kubernetes%20Cluster%20and%20Application.pdf
- watch keynote I missed: https://www.youtube.com/playlist?list=PLj6h78yzYM2N8GdbjmhVU65KYm_68qBmo
- add another keynote to the top three
- operator framework



## Continuous delivery with your Kubernetes cluster

Slides: https://schd.ws/hosted_files/kccnceu18/18/2018-05-02%20Continuously%20Deliver%20your%20Kubernetes%20Infrastructure%20-%20KubeCon%202018%20Copenhagen.pdf

### Principles

- Hands-off approach. Developers have only read-only privileges on Kubernetes cluster. Any update/write is managed via CI/CD solution.
- Always provide the latest stable K8S version
- Continuous and non-disruptive cluster updates (no maintenance windows)
- Fully automated operations (opertors should only need to manually merge PRs)

### Cluster Lifecycle Manager

Cluster registry: a configuration file containing the list of clusters and some metadata about them (ie. API Server URL, environment, AWS region, ...)

The CLM (Cluster Lifecycle Manager) has two sources of config: git repository and the cluster registry (stored on PostgreSQL).

Upgrade workflow:

1. Create a new feature branch and do the changes
2. Submit a PR, add `ready-to-test` label, CI/CD runs E2E tests, if they pass apply `ready-to-deploy` label
3. Merge to `dev` branch
4. Merge to `alpha` branch
5. Merge to `beta` branch
6. Merge to `stable` branch


E2E tests are:

- Conformance tests: run via Upstream Kubernetes e2e conformance tests
- StatefulSet tests: Rolling update of stateful sets including volume mounting (pick up 2 randomly)
- Custom tests: custom tests for ingress, external-dns, ...
- See: https://github.com/mikkeloscar/kubernetes-e2e

Tests workflow (~40 minutes):

- Create a cluster from the `alpha` (~20 minutes)
- Update a cluster from `dev` with the code in the PR
- Run E2E tests on both clusters
- If everything works, delete cluster, otherwise keep it running for a while to manually inspect it

Hints:

- Run with `-flakeAttempts=2`
- Update e2e image for every **major** release of Kubernetes
- Disable broken e2e tests in the Kubernetes release with `-skip`
- Remove **Completed** pods from `kube-system`

Upgrade workflow is interesting:
- Add 1 node each AZ given a specific node pool and then set `PreferNoSchedule` on the nodes to drain







## Following the data from the darkest corners of K8S

- cAdvisor will be soon deprecated and sig-instrumentation is working on drafting a speficiation to replace it with something that is more pluggable


## Prometheus mixins

- Dashboards and alerts should not be opinionated about labels - this should be configuration.
- People should distribute dashboards and alerts along with code

jsonnet
- Data templating language based on JSON (simple extension of JSON)
- Use can use the merge operator `{} + {}` to build composition

jsonnet-bundler
- A package manager for jsonnet

ksonnet
- https://github.com/kausalco/public/tree/master/prometheus-ksonnet

https://github.com/kubernetes-monitoring/kubernetes-mixin
- A set of Grafana dashboards and Prometheus alerts for Kubernetes






## Kubernetes Resource Management (QoS)

A pod can be:
- Rejected (ResourceQuota)
  - Set per-namespace limits
- Modified (LimitRanger)

After creation, the pod mught:
- Not get enough resources (starvation)
- Can be negatively affected by neightboors

Sheduling:
- TODO: see slide 29

- Memory request map to OOM Score Adj

- CPU: compressable resource
- Memory and storage: uncompressable resoures
 - Evict (kuelet) or OOM_kill (Kernel)
 - Kubelet eviction threshold can be specified

 Before 1.9: largest consumer relative to request starting from Qos best effort -> burstable -> Guaranteed
 In 1.9: usage > requests ? .> Pod priority -> Usage - Requests
 Even guaranteed pods can be evicted
 Make sure for DaemonSets you apply guaranteed resources

TODD: see slide 36 as a reference guide


QoS Tips:
- If in doubt, start with guaranteed
- Enable quotas and enforce sane defaults (ReousrceQuota, LimitRanger)
- Protect critical (System) pods: apply QoS burstable or guaranteed with sufficient memory requests, reserve node resources with labels/selectors, prorityclassses will significantly help
- Embed QoS in your CI/CD process
- TODO complete with content of slide 39
- Go and .NET have no or limited cgroup awareness (slide 41)
- Java 10 made big improvements for container support
- Tune kubelet
- Tune --eviction-hard/soft in the kubelet (and related values, like grace periods)
 - Enable --fail-swap-on (default in recent versions)
 - --kube-reserved (TODO slide 44)

Slides: [](https://schd.ws/hosted_files/kccnceu18/33/Inside%20Kubernetes%20QoS%20M.%20Gasch%20KubeCon%20EU%20FINAL.pdf)
