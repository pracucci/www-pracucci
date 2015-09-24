---
layout:         post
title:          Facebook Open Graph - Query image by username no longer available
keywords:       facebook, open graph
description:    Get a Facebook user's image by username is no longer available. Switch to query by id to fix it.
tags:           Facebook
date:           2015-06-13 17:00:00 GMT
---

Until yesterday you were able to query Facebook Open Graph to get an user's image by username. Starting today it's no longer available, but **you can still query it by ID**.


### Doesn't work anymore

[https://graph.facebook.com/marco.pracucci/picture](https://graph.facebook.com/marco.pracucci/picture)

{% highlight json %}
{
    "error": {
        "message": "(#803) Cannot query users by their username (marco.pracucci)",
        "type": "OAuthException",
        "code": 803
    }
}
{% endhighlight %}


### Does work

[https://graph.facebook.com/1376887081/picture](https://graph.facebook.com/1376887081/picture)


### Tip: how to get the biggest image available

**Bonus**: if you're wondering how to fetch to biggest image available, you can simply add `width` and `height` parameters. Facebook will return the biggest image available, honoring input max width and height.

[https://graph.facebook.com/1376887081/picture?width=2000&height=2000](https://graph.facebook.com/1376887081/picture?width=2000&height=2000)
