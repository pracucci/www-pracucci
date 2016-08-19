---
layout:         post
title:          "Graceful shutdown of pods with Kubernetes"
description:    "How to get a graceful shutdow of pods orchestrated with Kubernetes."
tags:           Kubernetes
date:           2016-08-19 12:00:00 GMT
---

Docker containers can be terminated any time, due to an auto-scaling policy, pod or deployment deletion or while rolling out an update. In most of such cases, you will probably want to graceful shutdown your application running inside the container.

In our case, _for example_, we do want to wait until all current requests (or jobs processing) have completed, but the actual reasons to graceful shutdown an application may be many, including releasing resources, distributed locks or opened connections.


## How it works

When a pod should be terminated:

1. A `SIGTERM` signal is sent to the main process (PID 1) in each container, and a "grace period" countdown starts (defaults to 30 seconds - _see below to change it_).
2. Upon the receival of the `SIGTERM`, each container should start a graceful shutdown of the running application and exit.
3. If a container doesn't terminate within the grace period, a `SIGKILL` signal will be sent and the container violently terminated.


For a detailed explaination, please see:

- [Kubernetes: Termination of pods](http://kubernetes.io/docs/user-guide/pods/#termination-of-pods)
- [Kubernetes: Pods lifecycle hooks and termination notice](http://kubernetes.io/docs/user-guide/production-pods/#lifecycle-hooks-and-termination-notice)
- [Kubernetes: Container lifecycle hooks](http://kubernetes.io/docs/user-guide/container-environment/)


## A common pitfall while handling the SIGTERM

Let's say your `Dockerfile` ends with a `CMD` in the shell form:

{% highlight bash %}
CMD myapp
{% endhighlight %}

The shell form runs the command with `/bin/sh -c myapp`, so the process that will get the `SIGTERM` is actually `/bin/sh` and not its child `myapp`. Depending on the actual shell you're running, it could or could not pass the signal to its children.

For example, the shell shipped by default with **Alpine Linux** does **not pass signals to children**, while Bash does it. If your shell doesn't pass signals to children, you've a couple of options to ensure the signal will be correctly delivered to the app.


### Option #1: run the CMD in the exec form

You can obviously use the `CMD` in the exec form. This will run `myapp` instead of `/bin/sh -c myapp`, but will not allow you to pass environment variables as arguments.

{% highlight bash %}
CMD [ "myapp" ]
{% endhighlight %}


### Option #2: run the command with Bash

You can ensure your container includes Bash and run your command through it, in order to support environment variables passed as arguments.

{% highlight bash %}
CMD [ "/bin/bash", "-c", "myapp --arg=$ENV_VAR" ]
{% endhighlight %}



## How to change the grace period

The default grace period is 30 seconds. As any default, it could fit or couldn't fit on your specific use cases. There are two way to change it:

1. In the deployment .yaml file
2. On the command line, when you run `kubectl delete`


### Deployment

You can customize the grace period setting `terminationGracePeriodSeconds` at the pod spec level. For example, the following .yaml shows a simple deployment config with a 60 seconds termination grace period.

{% highlight yaml %}
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
    name: test
spec:
    replicas: 1
    template:
        spec:
            containers:
              - name: test
                image: ...
            terminationGracePeriodSeconds: 60
{% endhighlight %}


### Command line

You can also change the default grace period when you manually delete a resource with `kubectl delete` command, adding the parameter `--grace-period=SECONDS`. For example:

{% highlight bash %}
kubectl delete deployment test --grace-period=60
{% endhighlight %}


## Alternatives

There're some circumstances where a `SIGTERM` violently kill the application, vanishing all your efforts to gracefully shutdown it. Nginx, for example, quickly exit on `SIGTERM`, while you should run `/usr/sbin/nginx -s quit` to gracefully terminate it.

In such cases, you can use the **preStop hook**. According to the Kubernetes doc, _PreStop_ works as follow:

    This hook is called immediately before a container is terminated. No parameters are passed to the handler. This event handler is blocking, and must complete before the call to delete the container is sent to the Docker daemon. The SIGTERM notification sent by Docker is also still sent. A more complete description of termination behavior can be found in Termination of Pods.

The _preStop_ hook is configured at container level and allows you to run a custom command before the `SIGTERM` will be sent (please note that the termination grace period countdown actually starts before invoking the _preStop_ hook and not once the `SIGTERM` signal will be sent).

The following example, taken from the Kubernetes doc, shows how to configure a _preStop_ command.

{% highlight yaml %}
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: nginx
spec:
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx
        ports:
        - containerPort: 80
        lifecycle:
          preStop:
            exec:
              # SIGTERM triggers a quick exit; gracefully terminate instead
              command: ["/usr/sbin/nginx","-s","quit"]
{% endhighlight %}


## Feedback

This blog post has been written according to my personal knowledge. If something is incorrect, don't esitate to drop a comment: will be my care to update the post and yet another occasion for me to learn something new. Thanks!