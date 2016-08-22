---
layout:         post
title:          "IP-based GeoLocation with AWS Lambda and API Gateway"
date:           2016-08-22 14:00:00 GMT
---

Let's say you have a web service or web app running on top of AWS Lambda and API Gateway. Let's say you need to geo-locate each incoming request and you just need to know the **client country**. Then you will feel very lucky thanks to **CloudFront's viewer country header**.


## How it works

Each AWS API Gateway deployment has a CloudFront distribution in front of it. This means that any incoming request to API Gateway will have all the additional HTTP request headers added by CloudFront, including `CloudFront-Viewer-Country`.

The `CloudFront-Viewer-Country` header contains the **country code of the client that originated the request** and can be easily passed to your AWS Lambda, giving you an IP-based country detection with no extra efforts.

Finally, to forward the country code to AWS Lambda you've just to add the header value as parameter in your integration's request template. For example, the following `application/json` request template configures a parameter called `autodetected_country` whose value is the client country code read from the CloudFront's header:

{% highlight json %}
{
    "autodetected_country": "$input.params('CloudFront-Viewer-Country')"
}
{% endhighlight %}



**Advertisement**: if you're tired to do tens of clicks in the AWS API Gateway console to change the configuration, you could give a try to the [`grunt-aws-apigateway` plugin](https://github.com/spreaker/grunt-aws-apigateway): you will get a replicable and automated way to configure your API Gateway deployments.
