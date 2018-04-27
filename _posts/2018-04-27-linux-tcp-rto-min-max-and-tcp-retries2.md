---
layout:         post
title:          "Linux TCP_RTO_MIN, TCP_RTO_MAX and the tcp_retries2 sysctl"
tags:           linux
date:           2018-04-27 09:00:00 GMT
keywords:
---

Every now and then I find myself tuning `tcp_retries2` on our systems, and - since it's not a frequent tuning - I always forget something about it. This post is a brief summary of how it works for myself in the future, and maybe for some of you too.

The TCP protocol is a connection-oriented stateful network protocol. For each packet sent, the TCP stack consider it successfully delivered once it gets an `ACK` back for that specific packet.

**TCP retransmits an unacknowledged packet up to `tcp_retries2` sysctl setting times** (defaults to `15`) using an exponential backoff timeout for which each retransmission timeout is between `TCP_RTO_MIN` (_200 ms_) and `TCP_RTO_MAX` (_120 seconds_). Once the 15th retry expires (by default), the TCP stack will notify the layers above (ie. app) of a broken connection.

The value of `TCP_RTO_MIN` and `TCP_RTO_MAX` is hardcoded in the Linux kernel and defined by the following constants:

```
#define TCP_RTO_MAX ((unsigned)(120*HZ))
#define TCP_RTO_MIN ((unsigned)(HZ/5))
```

Linux 2.6+ uses HZ of 1000ms, so `TCP_RTO_MIN` is ~200 ms and `TCP_RTO_MAX` is ~120 seconds. Given a default value of `tcp_retries` set to `15`, it means that **it takes 924.6 seconds** before a broken network link is notified to the upper layer (ie. application), since the connection is detected as broken when the last (15th) retry expires.

{% image 2018-04-27-linux-tcp-rto-retries2.png %}

The `tcp_retries2` sysctl can be **tuned** via `/proc/sys/net/ipv4/tcp_retries2` or the sysctl `net.ipv4.tcp_retries2`.


### From the Linux kernel doc

```
tcp_retries2 - INTEGER
    This value influences the timeout of an alive TCP connection,
    when RTO retransmissions remain unacknowledged.
    Given a value of N, a hypothetical TCP connection following
    exponential backoff with an initial RTO of TCP_RTO_MIN would
    retransmit N times before killing the connection at the (N+1)th RTO.

    The default value of 15 yields a hypothetical timeout of 924.6
    seconds and is a lower bound for the effective timeout.
    TCP will effectively time out at the first RTO which exceeds the
    hypothetical timeout.

    RFC 1122 recommends at least 100 seconds for the timeout,
    which corresponds to a value of at least 8.
```

Source: _[ip-sysctl.txt](https://www.kernel.org/doc/Documentation/networking/ip-sysctl.txt)_
