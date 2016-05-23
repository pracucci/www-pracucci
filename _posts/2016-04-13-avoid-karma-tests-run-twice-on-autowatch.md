---
layout:         post
title:          "Avoid karma tests running twice on autoWatch"
description:    "A short write-up on how you can avoid karma tests running twice when autoWatch is enabled."
tags:
date:           2016-04-13 05:00:00 GMT
---

I'm working on a new application since few weeks, whose tests run with [karma](https://karma-runner.github.io). Karma is configured with `autoWatch: true`, so tests automatically run each time any file changes.

Unfortunately, **tests did run twice each time I changed any file**. It was quite annoying but I've always been too lazy to investigate it, until today.

After digging a bit on Google, I've found a [GitHub issue](https://github.com/davezuko/react-redux-starter-kit/pull/246) with a PR fixing the same issue. The fix is actually straightforward: you should define `files` using the extended syntax and set `watched: false` for your tests / specs (they will still kept watched by `autoWatch: true`).

{% highlight javascript %}
const karmaConfig = {
    autoWatch: true,
    files: [
        { pattern: "app/**/*_spec.js", watched: false, served: true, included: true }
    ]
};
{% endhighlight %}
