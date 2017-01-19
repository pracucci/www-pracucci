---
layout:         post
title:          "X-XSS-Protection in the wild"
tags:
date:           2017-01-18 18:00:00 GMT
keywords:       http, header, security, x-xss-protection
---

Today I was reading "[Everything you need to know about HTTP security headers](https://blog.appcanary.com/2017/http-security-headers.html)". The article gives a good overview on HTTP headers you can use to improve your web app security, including `X-XSS-Protection`.

I was wondering how many websites set the `X-XSS-Protection` header (and to which value) given the fact there are some known issues around it, as explained [here](http://blog.innerht.ml/the-misunderstood-x-xss-protection/). Thus I've scripted a quick and dirty bash script to analyze the [Alexa top 1000 domains](https://gist.github.com/chilts/7229605) landing pages and here is the result.


### How many websites set the header?

The **23%** of the Alexa top 1000 domains set the `X-XSS-Protection` header in their landing pages. This sounds a pretty respectable number: there's still much room for improvement, but 1 out of 4 websites use it.

{% image 2017-01-18-x-xss-protection-set-vs-not-set.png %}


### What value is it set to?

As expected, the vast majority is setting it to `X-XSS-Protection: 1; mode=block`, but there are a couple of big names - Facebook and Slack - explicitely disabling it, probably to overcome the issues explained [here](http://blog.innerht.ml/the-misunderstood-x-xss-protection/). Few websites - including YouTube, Netflix and Etsy - add the `report` attribute as well (see [MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-XSS-Protection) for more information).

{% image 2017-01-18-x-xss-protection-header-value.png %}


### The raw data

If you're interested in the raw data, please [download this file]({{ site.base_url }}/2017-01-18-x-xss-protection-results.txt).
