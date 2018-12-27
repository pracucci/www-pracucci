---
layout:         post
title:          "My take on the future of applications development and operability"
tags:           future kubernetes
date:           2018-12-27 10:00:00 GMT
keywords:
hidden:         true
---

I work as infrastructure engineer at [Voxnest](https://www.voxnest.com). We offer services in the podcasting space, including [Spreaker](https://www.spreaker.com) and [Dynamo](https://www.voxnest.com/dynamo/). We don't write code for the sake of doing it. What we really care is building a great product that gives value to our customers, significantly improving their podcasting experience from newbies to professionals.

Infrastructure is the underlying layer providing support to the wide range of applications and services we build and operate within our products. **We run Kubernetes in production since a couple of years**, we have multiple clusters running in multiple AWS regions as well as we also manage several services running outside Kubernetes, like PostgreSQL.

We run and manage an infrastructure because we have applications running on top of it. Our job is not running the infrastructure itself. Our job is offering a digital product to our customers and doing business on it. Everything else is just a consequence: we build applications implementing the features, and we operate an infrastructure to run these applications. If there would be no applications to run, we would have no infrastructure to manage. Quite obvious.

**We also run few components based on serverless**, more specifically on AWS Lambda, Lambda@Edge and other services like Kinesis Firehose or Athena. We have got more experience on containers than Lambda so far, but we're running it in production since enough time to be able to do some retrospective.

<br />

When you approach **serverless** for the first time it's usually explained in three key points:

- Don't have to manage servers
- Don't worry about scalability
- Pay per request model

These three key points perfectly match our experience.

Not having servers to manage means you can mostly fully focus on the business logic. Not having scalability issues to worry about means you can spend more time focusing on building new features instead re-architecting for scalability. And the pay per request model means you don't have to do any capacity planning and pre-provision of computing resources to scale up.

From the business perspective the most important thing is our **velocity**.

We want and need to beat the competition at a faster innovation speed. The time to market is extremely important to keep up the pace in a growing industry like the podcasting one. From this perspective and for the sake of this retrospective, if I look back I realize that **solutions we built on serverless allowed us to hit the market and innovate faster than anything else**.

<br />

> Today's serverless solutions are far from being perfect

<br />

**Serverless is not cheaper**. The pay per request model - that usually implies not paying for idle resources - doesn't necessarily mean cheaper. Yes, it's generally cheaper for low traffic endpoints but in my experience there's always a threshold above which managing the infrastructure on your own will be cheaper than going serverless.

But that's not the point.

The trade-off you're picking when you go serverless is not saving costs, but actually throwing more money to delegate a class of problems to someone else, keeping the focus on your business.

If we look back 10 years ago, and the **advent of cloud computing**, this same exact story already happened. We have been early adopters of the cloud and we're basically running Spreaker fully on AWS since the day zero. I still remember very very clear in my mind the voices of many people laughting at us because we were throwing a bunch of money to AWS instead of going bare metal. We were paying for the CPU and the memory on EC2 way more than buying the hardware on the market and putting it in a data center.

But that was not the point.

Being early adopters on the cloud gave us a technological competitive advantage for a long time, because we were able to build, deploy and scale up faster than our competitors. We were able to spin up new servers in a matter of minutes not days. We had infinite storage capacity on S3. We had infinite network bandwidth on EC2. And the more AWS was evolving and more services launched, the more we quickly adopted them and built even more amazing things in our product.

When we adopted cloud computing we had no doubts it was the way to go. We were building a new company and a new product based on the future of computing. Given we all understand the opportunities we may open running a cheaper infrastructure, we should never forget that it will be useless if - at the end of the day - we will not be able to innovate faster than our competitors. How does it sound saying "we optimized everything for lower costs" but at the same time we run out of business because our competitors moved faster?

<br />

> Running a cheaper infrastructure will be useless, if we won't be able to innovate faster than our competitors

<br />

**Serverless is not even easier at first** and it still has many rough edges to smooth. You have to stop thinking in terms of applications or services and start thinking in terms of functions as your deployable unit. This imposes to change mindset, to un-learn how we built software in the last decade and learn a new paradigm.

**Monitoring on serverless** is still a mess. If you're used to Prometheus and Grafana, and you switch to CloudWatch for metrics it looks like jumping back years. But it's also extensible. You can asynchronously push logs to your ELK stack and metrics to Prometheus. And yes, for some functions monitoring may cost more than running the monitored function itself (_the same may happen with API Gateway or ALB in front of Lambda_).

**Debugging on serverless** is complicated. You need distributed tracing to be able to follow the execution path of a request across multiple functions. The volatility of the execution contexts and the limitations imposed by design contribute to make it more complex to debug a live application in production.

The way we're used to **test** our applications becomes extremely fragile on serverless. When you go serverless, your application runs in a environment you can't reproduce locally. Yes, you can partially reproduce it for the single function unit tests - which still make much sense - but the real value on serverless is provided by the large catalog of services you can attach together, and you can't reproduce those services locally. You need to write integration tests directly running on the cloud. And no, they won't take few seconds neither few minutes to complete like it happens in local.

From my perspective latency is not biggest pain point of Lambda. We all complain about **cold starts**, which delay some requests by few seconds, but let's be honest: it takes minutes to add more nodes to our Kubernetes clusters using the node autoscaler and tens of seconds to add more pod replicas with the horizontal pod autoscaler. Sometimes we have traffic peaks in the order of 10x our daily peak that last for few minutes and we're not able to fully serve such traffic: scaling up the pods take a couple of minutes between when the peak start, the telemetry collect the data, the pod autoscaler reacts on the updated telemetry data, the Docker image is downloaded on new nodes, the application is up and running, the first health check succeed and the first request is routed to the new replica.

<br />

And you know what?

In the last year, **Spreaker exploded in terms of digital audio advertisement business** and today we run something like 20x the audio AD traffic we were running 12 months ago. We had to re-architect almost everything to scale up, we moved part of the tracking system to Kinesis Firehose, we had to do changes in our Kubernetes clusters, we moved data between different databases and **the only components we didn't touch at all were the one already running on Lambda**.

<br />

> The apps we have today are hard<br />
> if not impossible<br />
> to be ported to Serverless

<br />

Now.

The majority of the applications we run today in production have been built years ago and it's very hard - if not impossible - to port them to serverless.

**Containers and Kubernetes did a great job filling this gap** and gave us the opportunity to pick all such applications, and package and operate them in a better way, doing minimal changes to the applications itself. These applications will very likely continue to run on containers and Kubernetes for a long time, because the way we designed and built them years ago doesn't fit with the emerging paradigms on serverless.

But we also have to look forward and **look at the next generation of products and services** we'll build. The more I look forward, the more gets clear that serverless will allow us to focus more on our business, scale faster and innovate faster.

There will still be room for optimizations, there will still be good use cases for self-managing part of the infrastructure, but looking at the vast amount of companies like us - operating a large scale product with a moderately small team - serverless will be more and more appealing.

My **prediction** is that in 5 years from now we will not ask anymore the question "should we go serverless or self-managed?" like we're not asking anymore the question "should we go cloud or bare metal?". The problems facing serverless today will be solved with micro-optimizations, but the technological disruption that serverless is bringing is a macro-optimization that will reshape the way we will build and operate software in the next years.


<br />

That being said, **my take is**:

> Focus on innovation speed,<br />
> embrace the future,<br />
> go serverless first,<br />
> go containers when serverless doesn't fit

