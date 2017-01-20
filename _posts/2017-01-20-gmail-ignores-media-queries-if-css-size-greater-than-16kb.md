---
layout:         post
title:          "Gmail ignores media queries if the CSS size is greater than 16KB"
tags:
date:           2017-01-20 10:00:00 GMT
keywords:       email, css, responsive, gmail, mobile, limitation
---

Gmail is rolling out support for media queries in its apps, including the iOS and Android app (you can find [updates here](https://litmus.com/blog/gmail-to-support-responsive-email-design)). However, today I was investigating on why Gmail was ignoring the media queries on our newsletter, and I've apparently found a limitation.

When the size of `<style></style>` exceed 16KB (including whitespaces, comments and newlines), it looks that media queries are ignored on Gmail. If you split the CSS in multiple `<style>` blocks, it counts the total size of the CSS (so it's not a workaround). On the contrary, minifying the CSS to keep it smaller can be a solution, if the minified version of the CSS is less than 16KB.

_This is just my preliminary conclusion, without spending more time on that. Please advise if you find any other limitation, or your tests don't match my finding. Thanks!_