---
layout:         post
title:          Electron (Atom Shell) - Enable copy and paste
keywords:       electron, atom shell, copy, paste, clipboard, osx, mac
description:    To enable copy and paste (clipboard) your should configure you app's menu, using Menu.setApplicationMenu()
date:           2015-06-13 17:00:00 GMT
---

If you're new to Electron (Atom Shell) you will notice that copy and paste (*CMD+C / CMD+V on Mac*) will not work, both in your app and DevTools. This is due to the lack of the application's menu with keybindings to the native clipboard.

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
        { label: "Undo", accelerator: "Command+Z", selector: "undo:" },
        { label: "Redo", accelerator: "Shift+Command+Z", selector: "redo:" },
        { type: "separator" },
        { label: "Cut", accelerator: "Command+X", selector: "cut:" },
        { label: "Copy", accelerator: "Command+C", selector: "copy:" },
        { label: "Paste", accelerator: "Command+V", selector: "paste:" },
        { label: "Select All", accelerator: "Command+A", selector: "selectAll:" }
    ]}
];

Menu.setApplicationMenu(Menu.buildFromTemplate(template));
{% endhighlight %}


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
            { label: "Undo", accelerator: "Command+Z", selector: "undo:" },
            { label: "Redo", accelerator: "Shift+Command+Z", selector: "redo:" },
            { type: "separator" },
            { label: "Cut", accelerator: "Command+X", selector: "cut:" },
            { label: "Copy", accelerator: "Command+C", selector: "copy:" },
            { label: "Paste", accelerator: "Command+V", selector: "paste:" },
            { label: "Select All", accelerator: "Command+A", selector: "selectAll:" }
        ]}
    ];

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
});

{% endhighlight %}
