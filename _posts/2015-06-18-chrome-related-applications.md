---
layout:         post
title:          Chrome Android 44+ introduces a new "related apps" banner
keywords:       chrome, android, related applications, appmanifest
description:    Native App install banners in Chrome for Android. Quickly learn how it works.
tags:           Chrome
date:           2015-06-18 17:00:00 GMT
---

Native App install banners landed in [Chrome 44 Beta for Android](https://play.google.com/store/apps/details?id=com.chrome.beta) and will be soon available in the stable version. Native App banners are a new powerful feature that let users to install and switch to your native app, **without leaving the browser**.

{% image 2015-06-18-chrome-related-applications.jpg %}


### Criteria for activation

The criteria for Native App banner activation are:

1. You have a [web app manifest file](http://www.w3.org/TR/appmanifest/)
2. Your site is served over **HTTPS**
3. The user has **visited your site twice** over two separate days during the course of two weeks
4. The app has not been **installed yet**

To **test** the banner, without waiting the next day (due to the criteria #3), you can enable *chrome://flags/#bypass-app-banner-engagement-checks* .


### Manifest

The manifest should defines at least a `short_name`, a `144x144` png icon, `prefer_related_applications` and `related_applications`. Check out [the manifest we use at Spreaker](https://www.spreaker.com/manifest.webmanifest) or the following example:

{% highlight json %}
{
    "display": "browser",
    "name": "Spreaker",
    "short_name": "Spreaker",
    "icons": [ ... ],
    "prefer_related_applications": true,
    "related_applications": [{
        "platform": "play",
        "id": "com.spreaker.android"
    }]
}
{% endhighlight %}


The manifest file must be linked in your web pages using the `<link>` tag. Ie:

{% highlight html %}
<link rel="manifest" href="/manifest.webmanifest" />
{% endhighlight %}