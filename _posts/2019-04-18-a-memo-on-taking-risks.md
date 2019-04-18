---
layout:         post
title:          "Keeping risk under control while experimenting"
tags:
date:           2019-04-18 09:00:00 GMT
keywords:
---

More than an year ago we had an interesting discussion at [@voxnest](https://www.voxnest.com) about risk, and the balance between pushing harder on experimentations vs being conservative. The following is an internal memo I shared with my perspective on the topic.

At the beginning I didn't receive much feedback but - over the time - I found out this memo triggered further thinking and discussions among people. I read it again today and I found out it still reflects my perspective.


## Memo: keeping risk under control while experimenting

I agree when people says we should be willing to take more risks and experiment more. I also agree when other people tries to keep risk under control. How should we balance it?


**The risk**

According to Wikipedia:

> Risk is the possibility of losing something of value. [...] Risk can also be defined as the intentional interaction with uncertainty.

And for the Oxford dictionary it's also:

> The probability of something happening multiplied by the resulting cost or benefit if it does.

In experimentation, preemptively evaluating the probability of a good or bad result may be impossible or so expensive to estimate which invalidates the reason why you're conducting the experimentation itself. All in all, experimentation is:

> The procedure carried out to support, refute, or validate a hypothesis.

However, there's a strong distinction between estimating the probability of the experimentation results and estimating the impact in case of a failure. The first one is the goal of the experimentation itself and it's out of our control, while the second one should be the metric used for the balance and it's mostly (yet not fully because of complexity) under our control.


**The experimentation**

There are three possible outcomes of an experimentation:
- Success
- Failure
- Blast Failure

In case of success, everything was good. In case of failure, your hypothesis have not been validated, which is still totally fine because having this data point was the reason of the experimentation itself. However, in case of a blast failure the experimentation significantly negatively affected areas of the product / team / company which were not directly targetted by the experimentation itself.

This last failure mode is what we should try to avoid or - at least - keep under control. A part from this, we should be never worried about conducting experiments and taking risks while doing it. Experimentation, learning, failure are all ingredients of evolution, especially in a high pace industry like the one we work into.
