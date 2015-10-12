---
layout:         post
title:          Electron? It works for us, and makes desktop fun and fast
keywords:       spreaker, spreaker studio, desktop, app, electron, node.js, webkit
tags:           Electron
date:           2015-10-12 06:00:00 GMT
---

Last weekend there were a couple of great conferences in Italy. My colleague <a href="https://twitter.com/DrAL3X" target="_blank">Alessandro</a> was busy at the #Pragma Conference, while <a href="https://twitter.com/emanuele_r" target="_blank">Emanuele</a> took a great talk about the technologies we used to build <a href="https://www.spreaker.com/download">Spreaker Studio for Desktop</a> app at the Node.JS conf.

The app, _that will be officially launched next Wednesday (in just 2 days)_, has been built upon **Electron** + **React.js** + our proprietary **native audio processing library** we currently use on Android / Windows / OSX (iOS app has a different implementation).

The following slides give you a sneak peek of the foundation, how Electron works, why it works for us, pros and cons. It's a definitely suggested read, either you're planning to build a desktop app or just curios about the technology behind it.

<iframe src="//www.slideshare.net/slideshow/embed_code/key/mG0pnoSIxZI0fF" height="355" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" style="border: none; width: 100%;" allowfullscreen> </iframe>


### Slides Transcript

 - Build a desktop app playing with HTML, JS and CSS out of the sandbox
 - The two main technologies available: Electron and NW.js
 - “NW.js lets you call all Node.js modules directly from DOM and enables a new way of writing applications with all Web technologies. It was previously known as node-webkit project.“ - NW.js website
 - “Use HTML, CSS, and JavaScript with Chromium and Node.js to build your app.“ - Electron website
 - Our choice was Electron: `npm install -g electron`
 - Skeleton: `package.json`, `main_process`, `renderer_process`
 - Basically you are writing a client app: ReactJS, SystemJS, JSPM, Babel, other libs (moment, underscore, emojione, url, reconﬁg, analytics, ...). This is very interesting given the state of modern frontend tools.
 - You can debug with chromium tools
 - You can leverage desktop integration: Menu, Notiﬁcations, Shortcuts, Multiple displays
 - You can go down a bit RPC server to expose app API using raw sockets
 - You can get more from chromium via [command line switches](http://peter.sh/experiments/chromium-command-line-switches/)
 - You can start digging “into the rabbit hole” - Electron is moving faaaast, use NaN to write add-ons
 - You can [unit test inside the electron environment](https://github.com/lele85/karma-electron-launcher)
 - You have autoupdates out of the box (works only with signed app, works in a different way on windows) - single script on a server returning update zip uri and metadata
 - Crash reports are super easy to collect and test! Every native crash (out of memory, segmentation faults) electron send a POST to conﬁgured `submitUrl` with: platform informations memory dump in minidump at
 not so easy to decode :) For each version you deliver you need to get electron debug symbols from project release page. Generate symbols for your native libs with breakpad tool dump_syms.  Put them in a er (with a standard structure) and use minidump_stackwalk to symbolize them in a correct way. You can build these tools from break pad source tree
 - You can add branding and package your app for mac and windows in a breeze (see [electron installer](https://github.com/atom/grunt-electron-installer), [electron packager](https://github.com/maxogden/electron-packager))
 - You can distribute your code in a “safe way”. Inside electron you can treat your asar bundle as a normal directory. (you may want to uglify/obfuscate your code)
 - All these things makes me very happy!
 - Sadly electron has some downsides: you are bundling Chromium with every update, compressed app size is around 40MB, you can’t hit Mac App Store and Windows Marketplace, sometimes you have to dig into source code (this can be fun) and spend time on github project issue tracker
 - but... it works for us... makes desktop development fun... makes desktop development fast.
