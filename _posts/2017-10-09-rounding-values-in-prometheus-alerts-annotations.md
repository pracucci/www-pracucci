---
layout:         post
title:          "Rounding values in Prometheus alerts annotations"
tags:           prometheus
date:           2017-10-09 05:00:00 GMT
keywords:
---

If you're a Prometheus experienced user you already know you can pipe GO default templating functions in `ANNOTATIONS`.

We're used to write human readable alerting messages as annotations, that frequently contain the current `$value` of the monitored metric. Today I started rounding `$value` using `printf` to avoid displaying floating point numbers with a long tail of decimals.

For example, the expression `$value | printf "%.2f"` will round it to two decimals. Feel free to adjust it with any number of desired decimals (ie. `"%.1f"` for a single decimal). The following alert configuration snippet shows a nearly real use case.


```
ALERT WORKER_AUDIO_ENCODING_TIME_AVG_PERC
  IF a_metric_to_alert_on > 12345
  LABELS {
    severity="error", team="frontend"
  }
  ANNOTATIONS {
    firing   = 'The current value of metric is {% assign function = '{{ $value | printf "%.2f" }}' %}{{ function }}.'
  }
```
