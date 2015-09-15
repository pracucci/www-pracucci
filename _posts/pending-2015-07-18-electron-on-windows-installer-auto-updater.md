---
layout:         post
title:          "Electron on Windows: Installer and Auto Updater"
keywords:       electron, atom shell, windows, installer, setup, auto update
date:           2015-07-18 16:00:00 GMT
---

Distributing an Electron app to Windows requires putting together at least two essential pieces: the **installer** and **auto-updater**.

Most of the hard-work is done by the amazing [Squirrel.Windows](https://github.com/Squirrel/Squirrel.Windows), expecially the *one-click wizard-free installer* and *easy to deploy auto-updater* but, as today, there's still a lack of documentation and to put pieces together you will have to dig into sources. In this article I will do my best to give you the essentials information you need to package and distribute your Electron-based application on Windows.


## Pre-requisites

 - You've an Electron app running on Windows
 - You've [packaged your code and assets into an .asar](https://github.com/atom/electron/blob/master/docs/tutorial/application-packaging.md)
 - You've a Code Signing Certificate for Windows (optional, yet higly suggested)


## Workflow

To distribute your app for Windows you will need to:

 1. Package the application
 2. Create the Windows installer and auto-updater
 3. Release installer and auto-updater




## Creating the Installer

Squirrel takes care of building the `setup.exe`, a single file installer without any wizard or AUC dialog (except installing the .NET framework if not already installed in the system). To create the Windows installer you can use [grunt-electron-installer](https://github.com/atom/grunt-electron-installer) plugin.

{% highlight js %}
"create-windows-installer": {
    appDirectory: ".\\path-to-app-folder",
    outputDirectory: ".\\path-to-release-folder",
    exe: "app.exe",
    iconUrl: "http://www.domain.com/path/to/app.ico",
    loadingGif: ".\\path-to-loading.gif",
    certificateFile: ".\\path-to-certificate.pfx",
    certificatePassword: "secret"
}
{% endhighlight %}

The grunt task `create-windows-installer` will create 3 files in the `outputDirectory`:

| `.exe`      | The installer executable. |
| `.nupkg`    | The package file that will be downloaded by the auto-updater, to upgrade old versions to the latest one. |
| `RELEASES`  | A file, containing the latest version number and the related .nupkg file + checksum. This file will be periodically checked by the auto-updater to test if there's a new version available for download. |


To release your app, you should distribute the `.exe` file for new installations, while `.nupkg` and `RELEASES` files will be fetched by Squirrel. Ie. one of the easiest solution to release the update is to upload the three files to AWS S3 at the root level:

```
download.domain.com
|-- app-1.0.0-setup.exe
|-- app-1.0.0-full.nupkg
|-- RELEASES
```


## Auto-updater

Electron comes with the [auto-updater module](https://github.com/atom/electron/blob/master/docs/api/auto-updater.md) that implements the glue required to make the auto-updater working. Unfortunately, at the time of writing, **this module supports OSX only**. The good news is that there's a [pull request open](https://github.com/atom/electron/pull/1984) and an on-going work to support Windows too.

In the meantime, you will have to get your hands dirty and write some code. Before moving on, it's important you understand how Squirrel.Windows works.


### How auto-updater works

Squirrel.Windows is a set of tools that completely manage app installation and updating. The most important tool for our purposes is `Update.exe` (packaged into your app by `grunt-electron-installer`). `Update.exe` will both take care of checking for new releases, and download and install the update once a new release is available.




### Auto-updater module for Windows
