---
layout:         post
title:          "New Chrome security policy: powerful features will be removed on insecure origins"
keywords:       chrome, security, http, https, powerful features, secure origin, insecure origin
tags:           Chrome
date:           2015-09-15 18:00:00 GMT
---

Google recently announced a security policy change that will impact future versions of the Chrome browser. Chrome is already warning that support to [powerful features](https://w3c.github.io/webappsec/specs/powerfulfeatures/) on insecure origins (HTTP) is deprecated, and according to recent announcements **the removal will take place soon**.

The initial features that will be removed on insecure origins will be:

- Geolocation (`getCurrentPosition()` and `watchPosition()`)
- Fullscreen
- Device motion / orientation
- Encrypted Media Extensions (EME)
- `getUserMedia()`

If your web site or app is currently using any powerful feature above, please immediately consider switching all your traffic to HTTPS only.



## Links

- [Proposal: Deprecating Powerful Features on Insecure Origins](https://sites.google.com/a/chromium.org/dev/Home/chromium-security/deprecating-powerful-features-on-insecure-origins)
- [Issue: Deprecation and removal of powerful features on insecure origins](https://code.google.com/p/chromium/issues/detail?id=520765)
- [The impact of Google’s new Chrome security policy on WebRTC](http://www.tokbox.com/blog/the-impact-of-googles-new-chrome-security-policy-on-webrtc/)