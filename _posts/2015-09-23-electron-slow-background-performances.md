---
layout:         post
title:          Electron - Slow performances in background
keywords:       electron, background, minimized, performances, speed, slow
tags:           Electron
date:           2015-09-23 18:00:00 GMT
---

Chromium recently became more aggressive on power saving when the **browser window is in background or minimized**. This is usually not a problem, but in some specific applications built with Electron this could lead to **performance issues**.

For example, we're building [Spreaker Studio for Desktop](https://www.spreaker.com/download), an audio broadcasting tool for Mac and Windows, and performances should never degrade while broadcasting, either the app is in foreground or background.

To avoid such issue, you can add the Chromium switch `--disable-renderer-backgrounding`: it basically tells Chromium to not reduce performances (and save CPU cycles) when the window is in background.


{% highlight javascript %}
var app = require("app");

app.commandLine.appendSwitch("disable-renderer-backgrounding");
app.on("ready", function () {
    // ...
});
{% endhighlight %}


### About `page-visibility` BrowserWindow option

When you spawn a `new BrowserWindow()` you can specify a set of options. Electron supports many options, including `{ "web-preferences": { "page-visibility": true }}` that forces the page to be always in the visible state, instead of reflecting current window's visibility.

Unfortunately, **it doesn't fix our performances issue**, so in case it doesn't help you too please give a try to `--disable-renderer-backgrounding` switch.


### Related links

- [GitHub issue](https://github.com/atom/electron/issues/2822) where [@zcbenz](https://twitter.com/zcbenz) helped us to figure out the solution
- [List of Chromium Command Line Switches](http://peter.sh/experiments/chromium-command-line-switches/)
- [Electron `app` module documentation](https://github.com/atom/electron/blob/master/docs/api/app.md)