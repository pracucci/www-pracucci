---
layout:         post
title:          "PHP on Kubernetes: application logging via unix pipe"
tags:           php
date:           2019-01-24 08:00:00 GMT
keywords:
---

The common way to log from a PHP application running on nginx + php-fpm in a Docker container is via the `catch_workers_output` php-fpm feature. Once enabled, the php-fpm master process will capture everything written by any worker to `php://stdout` and `php://stderr`, and will write it to the `error_log`.

You can configure php-fpm `error_log = /proc/self/fd/2` to write all captured logs to the master process stderr. If the php-fpm master process runs as PID 1, its stderr will be captured by the [Docker logging driver](https://docs.docker.com/config/containers/logging/configure/) and exposed outside the container (ie. on Kubernetes we run logstash as daemonset to capture all containers output and collect it for later analysis or querying). You can find a full working [example here](https://github.com/pracucci/php-on-kubernetes/tree/master/app-log-php-fpm-via-catch-workers-output).

{% image 2019-01-24-php-on-kubernetes-php-fpm-catch-workers-output.png %}

The main **pros** of this approach is that it's **easy to setup**, but it also carries some **drawbacks**:

- Application logs are wrapped by `php-fpm` and it makes parsing more complicated:
  ```
  [24-Jan-2019 08:30:14] WARNING: [pool www] child 6 said into stdout: "App log message to stdout"
  [24-Jan-2019 08:30:14] WARNING: [pool www] child 6 said into stderr: "App log message to stderr"
  ```

- Application logs are **truncated** to 1024 bytes and splitted into multiple messages. Long logs are not unusual if you use structured logging and you log contextual information on errors (ie. stack trace):
  ```
  [24-Jan-2019 08:35:34] WARNING: [pool www] child 7 said into stdout: "[...] TRUNCATED"
  [24-Jan-2019 08:35:34] WARNING: [pool www] child 7 said into stdout: "CONTINUE-PREVIOUS-MESSAGE"
  ```

- Application logs are **mixed** with `php-fpm` logs into the same stream:
   ```
   [24-Jan-2019 08:30:13] NOTICE: fpm is running, pid 1
   [24-Jan-2019 08:30:14] WARNING: [pool www] child 6 said into stdout: "App log message to stdout"
   ```

The three drawbacks described above are **not** configurable and the behaviour is hardcoded in the `fpm_stdio_child_said()` php-fpm function:

```
static void fpm_stdio_child_said(struct fpm_event_s *ev, short which, void *arg)
{
    static const int max_buf_size = 1024;

    [...]

    if (create_log_stream) {
            log_stream = child->log_stream = malloc(sizeof(struct zlog_stream));
            zlog_stream_init_ex(log_stream, ZLOG_WARNING, STDERR_FILENO);
            zlog_stream_set_decorating(log_stream, child->wp->config->decorate_workers_output);
            zlog_stream_set_wrapping(log_stream, ZLOG_TRUE);
            zlog_stream_set_msg_prefix(log_stream, "[pool %s] child %d said into %s: ",
                            child->wp->config->name, (int) child->pid, is_stdout ? "stdout" : "stderr");
            zlog_stream_set_msg_quoting(log_stream, ZLOG_TRUE);
    }

    [...]
}
```


## An alternative approach: log via unix pipe

An alternative approach we found out working well is logging from each worker to a shared unix pipe and tail from that pipe and forward it to stdout in the PID 1. This means that `php-fpm` master process will **not** run as PID 1, but a custom "supervisor" will run as PID 1.

{% image 2019-01-24-php-on-kubernetes-unix-pipe.png %}

You can find a full working [example here](https://github.com/pracucci/php-on-kubernetes/tree/master/app-log-php-fpm-via-unix-pipe) but in a nutshell it works as follows. The PHP application **writes logs to a unix pipe**:

```php
// In production you will surely do something more optimized and structured
// (ie. fopen() just once and then re-use the handle on each fwrite())
// but here it was simplified for clarity
file_put_contents("/var/log/pipe-from-app-to-stdout", "Log message\n");
```

A boostrapt script runs as PID 1 in the container and it takes care of starting `php-fpm` (daemonized) and a `tail` on `/var/log/pipe-from-app-to-stdout`.

The `php-fpm` process is configured to `error_log = /proc/self/fd/2` and the bootstrap script will redirect php-fpm stderr to the PID 1's stderr. A similar approach is taken with `tail`, where its stdout will be redirected to the PID 1's stdout.

The bootstrap script is something like this:

<script src="https://gist-it.appspot.com/https://github.com/pracucci/php-on-kubernetes/blob/master/app-log-php-fpm-via-unix-pipe/bootstrap-php-fpm.sh"></script>

This approach also presents pros and cons:

- **Pro**: application logs are not wrapped by `php-fpm`
- **Pro**: application logs are not limited by length (no splitting / truncating)
- **Pro**: application logs are forwarded to PID 1 stdout, while `php-fpm` error logs are forwarded to PID 1 stderr

- **Con**: the setup is more complicated
- **Con**: writing to a unix pipe blocks indefinitely if there's no process that opened it for reading (that's why we continuously check if `tail` is running). The **good news** is that it's not required the reading process is actively reading from the pipe to unblock the writer, so the writer performances (PHP) are not affected by the reader performances (`tail`)


### Atomic writes to a unix pipe

Last but not the least, since we have multiple processes concurrently writing the pipe, a note about **locking**.

Writing to a unix pipe without locking is safe (atomic) as far as each write is smaller than 4KB (see [this discussion](http://pubs.opengroup.org/onlinepubs/9699919799/functions/write.html) for more details). In case you support larger log messages at application level, you should use `flock($fd, LOCK_EX)` and `flock($fd, LOCK_UN)` to respectively lock and unlock a file descriptor.

Popular logging frameworks like Monolog already support locking (ie. see `useLocking` option of [`StreamHandler`](https://github.com/Seldaek/monolog/blob/master/src/Monolog/Handler/StreamHandler.php)).
