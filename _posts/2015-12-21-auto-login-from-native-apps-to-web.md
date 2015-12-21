---
layout:         post
title:          "Auto-Login from Native apps to Web"
keywords:       api, login, auth, oauth
date:           2015-12-21 10:00:00 GMT
---

Last friday we had to introduce an auto-login mechanism in the [Spreaker's Android app](https://play.google.com/store/apps/details?id=com.spreaker.android). The use-case was pretty simple: an user, logged into the Android app, needs to perform an authenticated action on web. The Android app should open the standard browser and ensure the user is already logged into the browser with the same account he/she has in the Android app.

After digging an hour on Google, I didn't find any open standard to do it, so we had to re-invent the wheel yet another time. The adopted solution has been partially inspired by [How does the Slack mobile sign-in link work](https://www.quora.com/How-does-the-Slack-mobile-sign-in-link-work) answer on Quora.


### The Problem

The user is logged in a native app (mobile or desktop) and needs to perform some authenticated operations on web, in a standard web browser (ie. using some features not supported by native apps yet). The native app should open the browser and make sure the user is logged into the browser with the same account he/she has in the native app.

The auto-login should be:

- **Automatic**: no manual operation required
- **Secure**: encrypted over an HTTPS connection
- **Not replicable**: it should be used at most once (ie. it should not cause any security issue if the auto-login URL is stored in the browser history)


### Prerequisites

- The user is logged in a native app (mobile or desktop) and has an OAuth2 access token.


### The Solution

1. The native app calls an API, authenticated via OAuth2 access token, to get a secure (HTTPS), short-lived (expiring in 5 minutes), one-time (not reusable) SSO Token
2. The native app opens the browser at the URL `https://www.spreaker.com/login/sso?token=<token>&redirect=<url>`: the web application checks the token validity (not expired, not already used), logins the user with the same account that generated the token (at step #1) and redirects the user to the internal `<url>`
