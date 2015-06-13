---
layout:         post
title:          5 features you didn't know about Chrome DevTools
keywords:       chome, devtools, tips
description:    Daily newsletter with Chrome DevTools tips, in the form of an animated .gif.
date:           2015-06-10 20:00:00 GMT
---

Umar Hansa is doing an amazing job these days: he created a [daily newsletter](https://umaar.com/dev-tips/) with DevTools tips, in the form of an animated gif. Here is the my very personal top 5.


## #5 Set a breakpoint based on a certain condition

When you set a breakpoint, you can make it conditional based on the result of an expression. Right click on the line gutter and select Add Conditional Breakpoint and enter your expression.

<img src="https://umaar.com/assets/images/dev-tips/conditional-breakpoint.gif" width="500" height="375" />


## #4 Shortcut to get the currently selected DOM node

When you have a node selected in the Elements panel, use `$0` to access it in the Console panel. On this subject, you can also use `$_` to access the value of the most recently evaluated expression.﻿

<img src="https://umaar.com/assets/images/dev-tips/dollar-zero.gif" width="500" height="375" />


## #3 Quickly monitor events from the Console Panel

You can log all the events dispatched to an object using the Command Line API method `monitorEvents(object [, events])`. The event objects are then logged to the Console. Useful when you need a reminder of the available properties on the event object.﻿

<img src="https://umaar.com/assets/images/dev-tips/monitor-events.gif" width="500" height="375" />


## #2 DOM tree search by CSS selector

When browsing the DOM with the Elements panel, try searching (CMD+F) for nodes by their CSS selectors.

<img src="https://umaar.com/assets/images/dev-tips/dom-search-by-selector.gif" width="500" height="375" />


## #1 Multiple cursors in the Sources Panel

You can **command + click** to add multiple cursors in the Sources Panel. You can also undo your last selection with **command + u**.

<img src="https://umaar.com/assets/images/dev-tips/multiple-cursors.gif" width="500" height="375" />


## Wanna get more?

[Signup to the newsletter!](https://umaar.com/dev-tips/)
