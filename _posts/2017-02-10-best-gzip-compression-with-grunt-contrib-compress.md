---
layout:         post
title:          "Best gzip compression with grunt-contrib-compress"
tags:
date:           2017-02-10 08:00:00 GMT
keywords:       webperf, gzip, compression, grunt
---

Today I just noticed that [grunt-contrib-compress](https://github.com/gruntjs/grunt-contrib-compress) gzip's default compression level has not been set to `BEST_COMPRESSION`, causing some assets not getting compressed to their optimal size. Changing this setting we've gained a 20% increased compression ratio on SVG icons.

I highly recommend you to import zlib in your `Gruntfile.js`:

```
var zlib = require("zlib");
```

and then add the `level` option to your `grunt-contrib-compress` task:

```
options: {
    mode: 'gzip',
    level: zlib.Z_BEST_COMPRESSION
}
```

Please note that the zlib constant has changed with Node 7.x. It's `zlib.Z_BEST_COMPRESSION` on Node 6.x, while `zlib.constants.Z_BEST_COMPRESSION` on Node 7.x.
