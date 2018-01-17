---
layout:         post
title:          "How to set connection timeout on PostgreSQL connection via PHP PDO pgsql driver"
tags:           php postgresql
date:           2018-01-17 17:00:00 GMT
keywords:
---

I recently struggled with the poor PHP documentation about how to set a connection timeout in the PHP PDO pgsql driver. After digging a bit in the PHP and `libpq` sources, I understood how it works under the hood and in this post I'm sharing my findings.


## TL;DR

You can set the connection timeout using the `PDO::ATTR_TIMEOUT` options:

```
$dbh = new PDO($dsn, $username, $password, array(PDO::ATTR_TIMEOUT => $connect_timeout_in_seconds));
```

Please note that:

1. The timeout applies only and exclusively to the TCP connect, and it's **not an idle timeout** on the socket. Ie. if you set a value of `3` seconds, `new PDO()` will raise an exception if unable to connect to PostgreSQL within 3 seconds, while the execution of any subsequent query can take even a longer time.
2. If unset, the **default** is 30 seconds (defined in the PDO `pgsql` driver).
3. The **minimum value** is `2` seconds. If you set a lower value, `libpq` will internally force it to `2` seconds.


## How it works

PHP PDO `pgsql` driver uses `libpq`, the official PostgreSQL client library, to connect to PostgreSQL. Since `libpq` supports `connect_timeout` in the DSN, I would expect to be able to do something like the following:

```
// Be aware - doesn't work
new PDO("pgsql:host=localhost;port=5432;connect_timeout=5");
```

Unfortunately it doesn't work, because PDO `pgsql` driver blindly appends `connect_timeout=30` at the end of the DSN, and so - after some manipulation - `libpq` will receive the following connection string:

```
host=localhost port=5432 connect_timeout=5 connect_timeout=30
```

Due to how `libpq` works internally, the last option win, and the `connect_timeout` will be always set to `30` seconds. Likely, PDO `pgsql` driver supports `PDO::ATTR_TIMEOUT` to override the default `30` seconds connection timeout. The previous PDO connection can be correctly created with the following:

```
new PDO(
    "pgsql:host=localhost;port=5432",
    null,
    null,
    array(PDO::ATTR_TIMEOUT => 5)
);
```

Please note that `libpq` force the `connect_timeout` to be at least `2` seconds, so if you try to set a lower value it will be forced to `2` seconds instead.
