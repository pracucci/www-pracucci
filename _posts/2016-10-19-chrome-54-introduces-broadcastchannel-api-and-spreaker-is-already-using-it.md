---
layout:         post
title:          "Chrome 54 introduces BroadcastChannel API and Spreaker is already using it"
tags:           Chrome
date:           2016-10-19 14:00:00 GMT
keywords:       broadcastchannel, api, spreaker, chrome, javascript, same origin, embedded player
---

Chrome 54 is rolling out today. Among the other features, it introduces the [BroadcastChannel API](https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API) - an easier way to **send messages between open windows, tabs or iframes on the same origin**.

BroadcastChannel API isn't actually new, since it was already supported on Firefox 38+, but it definitely amplifies the number of people accessing it, thanks to the wide adoption of Chrome.


## How it works

A BroadcastChannel is, well, a channel where you can broadcast and listen to messages, sent and received on same origin contexts. A channel is identified by a unique name and you can instance it with:

{% highlight js %}
var channel = new BroadcastChannel("bus");
{% endhighlight %}

Once created, you can send messages via `postMessage()` or listen to the `message` events on the channel itself. Messages sent from a context are not dispatched to the context itself, so you will not receive your own messages, but you will receive messages other contexts send on the same channel (identified by the unique name - `bus` in the example).

{% highlight js %}
// Send a message
channel.postMessage("Hello world");

// Listen for messages
channel.onmessage = function(e) {
    console.log("Received message: %o", e.data);
};
{% endhighlight %}

To leave a channel, you can `close()` it. This will disconnect the link and release the resources allocated by the BroadcastChannel.

{% highlight js %}
channel.close();
{% endhighlight %}



## BroadcastChannel and the Spreaker Embedded Player

We currently use the BroadcastChannel API in the **Spreaker Embedded Player**, to ensure that there aren't two players playing audio at the same time (either they're in the same page or different pages).

The following example shows how it works (_requires Chrome 54+, Firefox 38+ or Opera 41+_). **Try to click play** on the first player, and then play on the second one: once you play the second one, the first one will pause, giving you a much better experience than getting two audios playing at the same time.

<a class="spreaker-player" href="https://www.spreaker.com/show/jamie-lees-show" data-resource="show_id=1928929" data-theme="light" data-autoplay="false" data-playlist="false" data-cover="https://d3wo5wojvuv7l.cloudfront.net/images.spreaker.com/original/b6bee332d0d2fbda5f5791ab0388c6cc.jpg" data-width="100%" data-height="400px">Listen to "Jamie Lee&#039;s Best of the Worst" on Spreaker.</a>

<a class="spreaker-player" href="https://www.spreaker.com/user/nojokepodcast/episode-39-ceremonies" data-resource="episode_id=9219041" data-theme="light" data-autoplay="false" data-playlist="false" data-cover="https://d3wo5wojvuv7l.cloudfront.net/images.spreaker.com/original/22307918019f6608a83d9ce0511904f7.jpg" data-width="100%" data-height="400px">Listen to "Episode 39: CEREMONIES" on Spreaker.</a>

<script async src="https://widget.spreaker.com/widgets.js"></script>


## Feature detection

Checking the `BroadcastChannel` existence is not enough to ensure the feature is available. When your app runs in a sandboxed iframe, `new BroadcastChannel()` will throw an exception whenever you try to instance it.

{% highlight js %}
function isBroadcastChannelSupported() {
    if (!("BroadcastChannel" in self)) {
        return false;
    }

    // When running in a sandboxed iframe, the BroadcastChannel API
    // is not actually available and throws an exception
    try {
        const channel = new BroadcastChannel("feature_test");
        channel.close();
        return true;
    } catch(err) {
        return false;
    }
}
{% endhighlight %}


## Links

- [BroadcastChannel API](https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API)
- [BroadcastChannel API: A Message Bus for the Web](https://developers.google.com/web/updates/2016/09/broadcastchannel)
- [Can I use BroadcastChannel API?](http://caniuse.com/#search=broadcastchannel)
