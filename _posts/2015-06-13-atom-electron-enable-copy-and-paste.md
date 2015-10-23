---
layout:         post
title:          Electron - Enable copy and paste
keywords:       electron, atom shell, copy, paste, clipboard, osx, mac
description:    To enable copy and paste (clipboard) you should configure you app's menu, using Menu.setApplicationMenu() - See an example
tags:           Electron
date:           2015-06-13 17:00:00 GMT
---

If you're new to Electron (formerly known as Atom Shell) you will notice that copy and paste (*CMD+C / CMD+V on Mac*) will not work, both in your app and DevTools. This is due to the lack of the application's menu with keybindings to the native clipboard.

To enable the clipboard features and copy/paste shortcuts you should configure your app's menu, using `Menu.setApplicationMenu()` from Electron's [menu module](https://github.com/atom/electron/blob/master/docs/api/menu.md).

{% highlight javascript %}
var Menu = require("menu");

var template = [{
    label: "Application",
    submenu: [
        { label: "About Application", selector: "orderFrontStandardAboutPanel:" },
        { type: "separator" },
        { label: "Quit", accelerator: "Command+Q", click: function() { app.quit(); }}
    ]}, {
    label: "Edit",
    submenu: [
        { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
        { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
        { type: "separator" },
        { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
        { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
        { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
        { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
    ]}
];

Menu.setApplicationMenu(Menu.buildFromTemplate(template));
{% endhighlight %}


## Cross-platform support

**UPDATE**: as currectly suggested by Raghu in the comments below, you can use the special accelerator modifier `CmdOrCtrl` to get a cross-platform behavior. `CmdOrCtrl` will use `Command` on OSX and `Ctrl` on Windows and Linux.


## Working example

To get the big picture, please see the following fully working example.

#### main-electron.js

{% highlight javascript %}
var app = require("app");
var BrowserWindow = require("browser-window");
var Menu = require("menu");
var mainWindow = null;

app.on("window-all-closed", function(){
    app.quit();
});

app.on("ready", function () {
    mainWindow = new BrowserWindow({
        width: 980,
        height: 650,
        "min-width": 980,
        "min-height": 650
    });
    mainWindow.openDevTools();
    mainWindow.loadUrl("file://" + __dirname + "/index.html");
    mainWindow.on("closed", function () {
        mainWindow =  null;
    });

    // Create the Application's main menu
    var template = [{
        label: "Application",
        submenu: [
            { label: "About Application", selector: "orderFrontStandardAboutPanel:" },
            { type: "separator" },
            { label: "Quit", accelerator: "Command+Q", click: function() { app.quit(); }}
        ]}, {
        label: "Edit",
        submenu: [
            { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
            { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
            { type: "separator" },
            { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
            { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
            { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
            { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
        ]}
    ];

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
});

{% endhighlight %}
