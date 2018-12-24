---
layout:         post
title:          "PHP realpath cache and Kubernetes secrets / configmap updates"
tags:           kubernetes php
date:           2018-12-24 11:00:00 GMT
keywords:
---

PHP has a feature to cache the realpath resolutions to speed up frequent accesses to the filesystem. This cache is widely used in any PHP function accessing the filesystem, so whether you call it directly with `realpath($filepath)` or indirectly with `file_get_contents($filepath)` you will end up hitting it.

Considering the deployment unit (ie. the container image) is usually immutable the realpath cache is generally not a problem, unless you read files mounted as secrets or configmap from PHP. This is due to how secrets and configmaps are mounted into the running container.

When you mount a secret or configmap as volume, the path at which Kubernetes will mount it will contain the root level items symlinking the same names into a `..data` directory, which is symlink to real mountpoint.

For example, let's consider a secret containing one file `your-secret-file.txt` mounted as volume:

```
$ ls -al /path/to/secret-volume-mount

..2018_12_03_13_58_49.123456789
..data -> ..2018_12_03_13_58_49.123456789
your-secret-file.txt -> ..data/your-secret-file.txt
```

The real mountpoint (`..2018_12_03_13_58_49.123456789` in the example above) will change each time the secret or configmap is updated, so the realpath of your `your-secret-file.txt` will change after each update, but PHP will continue to resolve the path to `your-secret-file.txt` with the cached version that does not exist anymore on the filesystem (until the realpath cache TTL expires).

To my knowledge, there's no one-size-fit-all solution to this problem, so below you can find few options to solve the problem.


## Option #1: disable the realpath cache (not recommended)

The realpath cache is [enabled by default](http://php.net/manual/en/ini.list.php) and can be controlled by the following `php.ini` settings:

- `realpath_cache_size`
- `realpath_cache_ttl`

The realpath cache cannot be enabled only for specific paths, but can be fully disabled setting `realpath_cache_size = 0`. Disabling it you will implicitly solve the issue, but it's not recommented because you may incour in a significant performance penalty depending on your application.


## Option #2: mount single files via `subPath`

By design, a container using secrets and configmaps as a [`subPath` volume mount](https://kubernetes.io/docs/concepts/storage/volumes/#using-subpath) will not receive updates. You can leverage on this feature to singularly mount files. You will need to change the pod spec each time you add/remove any file to/from the secret / configmap, and a deployment rollout will be required to apply changes after each secret / configmap update.


## Option #3: leverage on PHP OPCache

If - and only if - your secret or configmap contains only PHP files and you've configured the OPcache to indefinitely cache your immutable PHP files (setting `opcache.validate_timestamps=0` and `opcache.revalidate_freq=0`), you can leverage on it to basically ignore the problem.

After the first time the PHP files - mounted as secrets or configmaps - will be read, PHP will never hit the filesystem again for these files (unless your OPcache gets full) and you will end up never noticing the issue. A deployment rollout will be required to apply changes after each secret / configmap update.


## Option #4: wrap access to secret and configmap files to lazily invalidate the cache

If you have control over the piece of code reading the secret / configmap files, you can wrap it to call `clearstatcache(true, $filepath)` to invalidate the realpath cache for that specific file if it's unreadable. Keep in mind that functions like `file_exists($filepath)` are subjected to the realpath cache as well, so it may return `true` even if a subquent file read will fail because of the volume mount update.

For this reason, the solution you should adopt may look like something like this:

```
function readSecretFile($filepath) {
    $content = @file_get_contents($filepath);
    if ($content !== false) {
        return $content;
    }

    // Try invalidating the realpath cache
    clearstatcache(true, $filepath);

    return @file_get_contents($filepath);
}
```
