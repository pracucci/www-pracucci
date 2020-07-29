---
layout:         post
title:          "Leveraging Open Source to Improve Cortex and Thanos"
tags:           prometheus cortex thanos
date:           2020-07-15 18:00:00 GMT
keywords:
---

[Cortex](https://cortexmetrics.io/) and [Thanos](https://thanos.io/) are two brilliant solutions to scale out [Prometheus](https://prometheus.io), and many companies are now running them in production at scale. These two projects initially started with different technical approaches and philosophies but, over time, the two projects started to learn from and even influence each other and these differences have been reduced.

Today [Bartek Plotka](https://twitter.com/bwplotka) and I gave a talk at [PromCon Online](https://promcon.io/2020-online/schedule/) about a stronger collaboration we're building between the [Cortex](https://cortexmetrics.io/) and [Thanos](https://thanos.io/) community, accelerated by the new [blocks storage](https://cortexmetrics.io/docs/blocks-storage/) engine we're building in Cortex which is based on some Thanos core components.

Curious to learn more? Check out the recording and slides!

<iframe width="100%" height="400" src="https://www.youtube.com/embed/2oTLouUvsac" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

<br /><br />

<iframe src="https://docs.google.com/presentation/d/e/2PACX-1vTG6mFwyAYr12XSX25zqeyzXUIGPU9NOdfkJIcjffV6zBJ0Rs71V4u5gpqiX5kJz-1S90rRS_xEATUq/embed?start=false&loop=false&delayms=3000" frameborder="0" width="100%" height="400" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>
