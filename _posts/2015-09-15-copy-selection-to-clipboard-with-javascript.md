---
layout:         post
title:          "Copy the text selection to Clipboard, using Javascript"
keywords:       javascript, js, copy, clipboard
tags:           Chrome Firefox
date:           2015-09-15 18:00:00 GMT
---

Few days ago, [Firefox announced](https://hacks.mozilla.org/2015/09/flash-free-clipboard-for-the-web/) the support to `document.execCommand("copy")` in the upcoming version 41.0 (currently in Beta). This change makes a step forward towards a Flash-free world (fallbacks are Flash based). Copying text selection to Clipboard is now available on all modern browsers, *except Safari*.


## How it works

The `execCommand("copy")` API is only available during a user-triggered callback (ie. a click). When triggered, it copies the current selection to the clipboard. Using is is very straightforward and just requires a couple of lines of code.


{% highlight html %}
<textarea id="input">Some text to copy.</textarea>
<button id="copy-button">Copy</button>

<script>
    var input  = document.getElementById("input");
    var button = document.getElementById("copy-button");

    button.addEventListener("click", function (event) {
        event.preventDefault();
        input.select();
        document.execCommand("copy");
    });
</script>
{% endhighlight %}


## Browsers support

To keep it simple, most modern browers are supported, except Safari. It's actually an huge lack, we hope will get fixed soon.

| **Chrome**  | > 43.0.2356 |
| **Firefox** | >= 41.0 |
| **Opera**   | >= 30 ([release notes](https://dev.opera.com/blog/opera-30/)) |
| **IE**      | >= 9 (allows it to be called at any time, but prompts a confirmation dialog) |
| **Safari**  | Not supported |

For more details, please check out [caniuse.com](http://caniuse.com/#feat=clipboard).
