---
layout:         post
title:          Rename multiple files on Mac
keywords:       mac, osx, bask, rename, files
date:           2015-06-23 09:00:00 GMT
---

I love semplicity and I love tools that do one job, yet well. Today I had to rename multiple files on Mac, and `rename` saved me a lot of time.

### How it works

{% highlight bash %}
brew install rename
rename -s "from" "to" *.*
{% endhighlight %}

Ie. to replace "Filter" with "DataFilter" on all `Filter*.php` files inside a directory, you've just to run:

{% highlight bash %}
rename -s "Filter" "DataFilter" Filter*.php
{% endhighlight %}
