---
layout: post
title:  Statsd Client for Node.js
date:   2015-06-09 17:00:00 GMT
---

Few years ago I released a very simple yet working [Statsd client for Node.js](https://github.com/spreaker/nodejs-statsd-client) and I recently realized that it's actually pretty used (*2,989 downloads in the last month*). We, at [Spreaker](https://www.spreaker.com), use it since few years in production and never got an issue.

Do you wanna give it a try?<br />
`npm install node-statsd-client`


## How it works

{% highlight js %}
var Client = require('node-statsd-client').Client;

var client = new Client("localhost", 8192);

// Count stat
client.count("num_logged_users", 1);
client.increment("num_logged_users");
client.decrement("num_logged_users");

// Timing stat
client.timing("request_ms", 250);

// Gauge stat
client.gauge("gauge_stats", 4);
{% endhighlight %}
