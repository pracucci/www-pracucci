---
layout:         post
title:          Electron - Open DevTools in a popup
keywords:       electron, atom shell, devtools, popup
tags:           Electron
date:           2015-07-02 16:00:00 GMT
---

When you open a new window with `window.open()` in Electron, DevTools are closed by default and there's no key binding to open it. However, you can run the following code in the main window to get the reference to the popup's `BrowserWindow` and `openDevTools()`.


{% highlight javascript %}
var remote = require("remote");
var BrowserWindow = remote.require("browser-window");
var windows = BrowserWindow.getAllWindows();

// Look for the popup window and then...
windows[1].openDevTools();
{% endhighlight %}


{% image 2015-07-02-electron-popup-devtools.gif width="681" height="583" %}
