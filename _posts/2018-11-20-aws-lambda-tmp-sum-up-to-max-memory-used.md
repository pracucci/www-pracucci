---
layout:         post
title:          "AWS Lambda /tmp sum up to max memory used"
tags:           aws lambda
date:           2018-11-20 06:00:00 GMT
keywords:
---

Today, while debugging an apparently memory leak in our Node.JS lambda, I discovered that whatever you write to `/tmp` sums up to the "Max Memory Used" reported by the Lambda and accounts for the Lambda max memory limit.

As of today, I've not been able to find any specific reference in the official documentation, and the [AWS Lambda Limits](https://docs.aws.amazon.com/lambda/latest/dg/limits.html) just mentions the max `/tmp` size:

| Resource | Limit |
| -------- | ----- |
| `/tmp` directory storage | 512 MB |


To confirm my finding I've built a simple test lambda which, for each execution, appends 10MB to a temporary file `/tmp/test`. If you invoke the lambda adding a couple of seconds of delay between each invocation, the already existing context will be reused and the "Max Memory Used" report will increase by 10MB on each invocation:


```javascript
const fs = require("fs");

/**
 * Each execution of this lambda will append 10MB to
 * /tmp/test file and its size increase will be summed
 * up to "Max Memory Used" reported by Lambda in CloudWatch Logs.
 */
exports.test = function(event, context, callback) {
    const fd   = fs.openSync("/tmp/test", "a");
    const data = new Array(10240).join("0");

    for (var i = 0; i < 1024; i++) {
        fs.writeSync(fd, data);
    }

    fs.closeSync(fd);

    callback(null, "Done");
}
```


To sum it up, as of 20th Nov 2018, according to my experiments:
- `/tmp` max storage size is 512 MB
- `/tmp` is persisted across different lambda executions in the same context until the context itself will be recycled
- Whatever you write to `/tmp` will be summed up to the "Max Memory Used" lambda report and will be subject to the Lambda memory limit
- Cleanup `/tmp` at the end of each lambda execution if you're using it and you don't need its persistence (ie. for caching purposes)
