---
layout:         post
title:          "Display the current kubectl context in the Bash prompt"
description:    "A simple yet effective way to display the current Kubernetes context in the Bash shell prompt."
tags:           kubernetes
date:           2016-08-18 12:00:00 GMT
---

It's an hot day at [Spreaker](https://www.spreaker.com): we're finally rolling out to production the very first piece of our next-generation infrastructure, based upon Docker and Kubernetes. Now that we've two environments running Kubernetes (`staging` and `prod`) it's vital we don't mess up with `kubectl`, manually running on production commands that were supposed to run in our staging environment.

The easy way to reduce such risk that came out to my mind is to **display the current kubectl context in the shell prompt**. Basically, something like this:

{% image 2016-08-18-kubernetes-context-in-the-shell-prompt.png %}

After a quick Google search, I didn't find anything similar (please correct me if I'm wrong), so here is how I did it.


## 1. Create `~/kube-prompt.sh`

Create a script `kube-prompt.sh` in your home with the following content. It just defines a function `__kube_ps1()` that prints the current kubectl context (if any):

{% highlight bash %}
#!/bin/bash

__kube_ps1()
{
    # Get current context
    CONTEXT=$(cat ~/.kube/config | grep "current-context:" | sed "s/current-context: //")

    if [ -n "$CONTEXT" ]; then
        echo "(k8s: ${CONTEXT})"
    fi
}
{% endhighlight %}


## 2. Edit your Bash prompt in `~/.bash_profile`

Edit the file `.bash_profile` in your home, loading `~/kube-prompt.sh` and injecting `__kube_ps1()` in your prompt. For example, my prompt is:

{% highlight bash %}
NORMAL="\[\033[00m\]"
BLUE="\[\033[01;34m\]"
YELLOW="\[\e[1;33m\]"
GREEN="\[\e[1;32m\]"

source ~/kube-prompt.sh

export PS1="${BLUE}\W ${GREEN}\u${YELLOW}\$(__kube_ps1)${NORMAL} \$ "
{% endhighlight %}
