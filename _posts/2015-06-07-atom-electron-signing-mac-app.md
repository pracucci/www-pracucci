---
layout: post
title:  Atom Electron: Signing a Mac Application
date:   2015-06-07 16:00:00 GMT
---

If you're building a Mac app with Atom Electron, you will have to sign it before releasing it to your users. Code signature is actually a straightforward process, but it's very hard to debug in case you run into any error, due to the lack of detailed error messages. In this post I will share my experience.


## TL;DR

1. Get a [Developer ID certificate][https://developer.apple.com/account/mac/certificate/certificateList.action] from Apple and install it into your Mac's Keychain
2. Sign your application bundle `codesign --deep --force --verbose --sign "<identity>" Application.app`
3. Verify the signature `codesign --verify -vvvv Application.app` and `spctl -a -vvvv Application.app`


## The code signature workflow

At the time of writing it's not allowed to publish an Atom Electron application to the Mac App Store, so you have to sign it with a [Developer ID certificate][https://developer.apple.com/account/mac/certificate/certificateList.action] and ask your users to download and install it manually. This is actually a strong limitation and I hope things will change in the next future.


### 1. Get and install a Developer ID Certificate

Once you got your Developer ID Certificate, you should install it into your Mac's Keychain: a double click on the certificate file should be enough. The image below shows your what you should see once the certification has been successfully installed into your Keychain. The text between parenthesis is the *identity* and will be used in the next step.

[](/images/2015-06-07-certificate.jpg)


### 2. Code signature

Now it's time to sign the app. Create your application bundle (`.app` directory with the well-known Mac apps structure) and run the following command:

```bash
$codesign --deep --force --verbose --sign "<identity>" Application.app
Application.app: signed bundle with Mach-O thin (x86_64) [com.application]
```


### 3. Verify signature

There are a couple of commands that you should run to verify the signature: `codesign` and `spctl`. The first checks if the signature is valid but doesn't check if the certificate has been successfully released from Apply, while the latter checks if the certificate used for signing is approved.

```bash
$codesign --verify -vvvv Application.app
Spreaker Studio.app/: valid on disk
Spreaker Studio.app/: satisfies its Designated Requirement
```

```bash
$spctl -a -vvvv Application.app
Application.app: accepted
source=Developer ID
origin=Developer ID Application: Spreaker Inc (xxx)
```
