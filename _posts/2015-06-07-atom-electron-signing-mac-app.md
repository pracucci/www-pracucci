---
layout:         post
title:          Electron - Signing a Mac Application
keywords:       electron, atom shell, mac, osx, application, signature, code sign
description:    Sign your application bundle with codesign --deep --force --verbose --sign identity Application.app
tags:           Electron
date:           2015-06-07 16:00:00 GMT
---

If you're building a Mac app with Electron (formerly known as Atom Shell), you will have to sign it before releasing. Code signature is actually a straightforward process, but it's very hard to debug in case you run into any error, due to the lack of detailed error messages. In this post I will share my experience.


## TL;DR

1. Get a [Developer ID certificate](https://developer.apple.com/account/mac/certificate/certificateList.action) from Apple and install it into your Mac's Keychain
2. Sign your application bundle `codesign --deep --force --verbose --sign "<identity>" Application.app`
3. Verify the signature `codesign --verify -vvvv Application.app` and `spctl -a -vvvv Application.app`


## The code signature workflow

At the time of writing it's not allowed to publish an Electron application to the Mac App Store, so you have to sign it with a [Developer ID certificate](https://developer.apple.com/account/mac/certificate/certificateList.action) and ask your users to download and install it manually. This is actually a strong limitation and I hope things will change in the next future.

**UPDATE on Dec 2nd, 2015:** since Electron 0.34.0, apps can be submitted to Mac App Store. You can get all information in the [Mac App Store Submission Guide](https://github.com/atom/electron/blob/master/docs/tutorial/mac-app-store-submission-guide.md).


### 1. Get and install a Developer ID Certificate

Once you got your [Developer ID certificate](https://developer.apple.com/account/mac/certificate/certificateList.action), you should install it into your Mac's Keychain: a double click on the certificate file should be enough. The image below shows your what you should see once the certification has been successfully installed into your Keychain. The text between parenthesis is the *identity* and will be used in the next step.

![](/images/2015-06-07-certificate.jpg)


### 2. Code signature

Now it's time to sign the app. Create your application bundle (`.app` directory with the well-known Mac apps structure) and run the following command:

{% highlight bash %}
$ codesign --deep --force --verbose --sign "<identity>" Application.app
{% endhighlight %}

You should get an output similar to the following. **Make sure the detected architecture is not `generic`**, otherwise Squiller auto-update will give you an error while verifying the update package.

{% highlight bash %}
Application.app: signed bundle with Mach-O thin (x86_64) [com.application]
{% endhighlight %}


### 3. Verify signature

There are a couple of commands that you should run to verify the signature: `codesign` and `spctl`. The first checks if the signature is valid but doesn't run any certificate assessment, while the latter checks if the certificate used for signing is approved.

{% highlight bash %}
$ codesign --verify -vvvv Application.app

Application.app: valid on disk
Application.app: satisfies its Designated Requirement
{% endhighlight %}

{% highlight bash %}
$ spctl -a -vvvv Application.app

Application.app: accepted
source=Developer ID
origin=Developer ID Application: Spreaker Inc (xxx)
{% endhighlight %}
