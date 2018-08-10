---
layout:         post
title:          "Kubernetes pods /etc/resolv.conf ndots:5 option and why it may negatively affect your application performances"
tags:           kubernetes dns
date:           2018-08-10 06:00:00 GMT
keywords:
---

We run Kubernetes 1.9 on AWS deployed with Kops. Yesterday I was progressivelly rolling out some new traffic to our largest Kubernetes cluster and - during this rollout - I started seeing spare DNS resolution failures logged by our application.

I've realized there's quite a [long discussion](https://github.com/kubernetes/kubernetes/issues/45976) about it on GitHub and thus I started investigating as well. It turned out that - in our case - it was caused by an increased load on `kube-dns` and `dnsmasq`, but the most interesting thing (new to me) was investigating why the DNS queries traffic increased significantly and how to reduce it. This post is a wrap up about my findings.

---

DNS resolution inside a container - like any Linux system - is driven by the `/etc/resolv.conf` config file. The default Kubernetes `dnsPolicy` is `ClusterFirst` which means any DNS query will be routed to `dnsmasq` running in the `kube-dns` pod inside the cluster which - in turn - will route the request to `kube-dns` application if the name ends with a cluster suffix or to the upstream DNS server otherwise.

The `/etc/resolv.conf` file inside each container will look like this by default:

```
nameserver 100.64.0.10
search namespace.svc.cluster.local svc.cluster.local cluster.local eu-west-1.compute.internal
options ndots:5
```

As you can see there are three directives:
1. The nameserver IP is the Kubernetes service IP of `kube-dns`
2. There are 4 local `search` domains specified
3. There's a `ndots:5` option

The interesting part of this configuration is how the local `search` domains and `ndots:5` settings play together. In order to understand it, we need to understand how the DNS resolution works for non fully qualified names.


**What is a fully qualified name?**

A fully qualified name is a name for which no local search will be executed and the name will be treated as an absolute one during the resolution. By convention, DNS software consider a name fully qualified if ends with a full stop (`.`) and non fully qualified otherwise. Ie. `google.com.` is fully qualified, `google.com` is not.


**How non fully qualified name resolution is performed?**

When an application connects to a remote host specified by name, a DNS resolution is performed typically via a syscall, like `getaddrinfo()`. If the name is not fully qualified (not ending with a `.`), will the syscall try to resolve the name as an absolute one first, or will go through the local search domains first? It depends on the `ndots` option.

From the `resolv.conf` man:

```
ndots:n

sets a threshold for the number of dots which must appear in a name before an initial absolute query will be made. The default for n is 1, meaning that if there are any dots in a name, the name will be tried first as an absolute name before any search list elements are appended to it.
```

This means that if `ndots` is set to `5` and the name contains less than 5 dots inside it, the syscall will try to resolve it sequentially going through all local search domains first and - in case none succeed - will resolve it as an absolute name only at last.


**Why `ndots:5` can negatively affect application performances?**

As you can understand, if your application does a lot of external traffic, for each TCP connection established (or more specifically, for each name resolved) it will issue 5 DNS queries before the name is correctly resolved, because it will go through the 4 local search domains first and will finally issue an absolute name resolution query.

The following chart shows the summed **traffic on our 3 `kube-dns` pods** before and after we switched few hostnames configured in our application to fully qualified.

{% image 2018-08-10-kube-dns-queries-traffic.png %}

The following chart shows the **application latency** before and after we switched few hostnames configured in our application to fully qualified (the vertical blue line is the deployment):

{% image 2018-08-10-before-and-after-fully-qualified-dns.png %}


## Solution #1 - use fully qualified names

If you have few static external names (ie. defined in the application config) to which you create a large number of connections, the easiest solution is probably switching them to fully qualified, just adding a `.` at the end.

It's not a definitive solution but can be a quick and dirty change to apply to improve the situation. This is the "hot patch" we applied to resolve the issue, whose results have been shown in the screenshots above.


## Solution #2 - customize `ndots` with `dnsConfig`

Kubernetes 1.9 introduces an alpha feature (beta in v1.10) that allows more control on the DNS settings for a pod via the `dnsConfig` pod property. Among the other things, it allows to customize the `ndots` value for a specific pod, ie.

```
apiVersion: v1
kind: Pod
metadata:
  namespace: default
  name: dns-example
spec:
  containers:
    - name: test
      image: nginx
  dnsConfig:
    options:
      - name: ndots
        value: "1"
```


## Resources

- [What DNS name qualification is](http://jdebp.eu./FGA/dns-name-qualification.html)
- [Kubernetes: DNS for Services and Pods](https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/)
