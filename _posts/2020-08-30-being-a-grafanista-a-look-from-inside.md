---
layout:         post
title:          "Being a Grafanista: a look from inside"
tags:           engineering
date:           2020-08-30 12:00:00 GMT
keywords:
---

Saturday, 2pm. Kids are sleeping. Wife is sleeping. Had to stop preparing for the upcoming travel to make sure the rest of the family can rest in absolute silence. Looks the right time to take a break and sit down to write a piece. I have a short time and lot to say, so forgive me if the form is not perfect and let's focus on content!

I recently heard the same question over and over: "**How it working at Grafana Labs?**". My inner reaction is always the same: "**Oh, I would have so much to say**", but I always lack the time to properly answer it and I limit my answer to a simple: "**It's amazing!**". But it's more than that. There's so much to say and in this article I would like to share a little bit of Grafana Labs from inside. Are you ready? Let's go!

## Let's start from the beginning

I joined Grafana 10 months ago, in October 2019. It was a difficult choice at that time. After 10 years, I was leaving a company I co-founded ([Spreaker](https://spreaker.com) which later became [Voxnest](https://voxnest.com)) to get back to an individual contributor role. I was excited to exit my comfort zone and do something new, but at the same time **I was scared**.

Many questions were running through my head: I know products are great, but how will people be? The company is growing fast, how much organizational chaos there will be? What if I don't like it? What's the stress level? And the work-life balance? Is people burning out? And so on. All legit questions. Whenever you change your job, either you're leaving a terribly bad situation and you've nothing to loose (but was not my case) or stakes are high.

At the same time, I really wanted to exit my comfort zone, I really wanted Spreaker to not be my only significative working experience, and I wanted so badly that... I took my leap.

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Announcement time!<br><br>I&#39;m super excited to announce I will join <a href="https://twitter.com/grafana?ref_src=twsrc%5Etfw">@grafana</a> in less than two weeks! Can&#39;t wait to work on all things observability and the LGTM stack!<br><br>Stay tuned for more news! <a href="https://t.co/DM9W1mce1B">pic.twitter.com/DM9W1mce1B</a></p>&mdash; Marco Pracucci 🇮🇹🇪🇺 (@pracucci) <a href="https://twitter.com/pracucci/status/1178933608771440640?ref_src=twsrc%5Etfw">October 1, 2019</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

## The leap

I spent my first week in Stockholm where, coincidence, the bootcamp was happening. We were something around 50 people. It's not something happening every month (and now, with an on-going pandemic, it's a virtual event) and I felt super lucky to start my career at Grafana meeting people, sharing ideas, getting a feel of what's being a Grafanista. A couple of days were structured in a conference-like fashion and has been one of the best "conferences" I ever attended.

**One day to forget my fears**. Only one day. All my fears went away as soon as I've met the people. People is fantasic. Really. I know none will publicly say "my colleagues are dumbs" but, really, the quality level of people at Grafana is incredibly high.

At Grafana I found a concentrate of the **smartest and kindest persons I've ever worked with**. 

## So, how is working at Grafana Labs?

If it's true I have many things to mention when people asks me that question, this is the right time to share it! And this moves the conversation to **what I love about working at Grafana**.

### The people

Yes, I'm cheating a bit because I already mentioned it. However, I wanna be cristal clear. People is fantastic. It's not just that their smart and skilled, but it's also **a pleasure to work with**.

The friction level is extremely low, nearly zero. It's very unfrequent seeing people heating up. Even in stressful situations, people is calm, down to the earth and never pointing fingers.

My perspective is not a global view of the company. I daily closely interact with about 15 people, there are probably another 25-30 people with which I have unfrequent contacts, and then there's the rest I've never met, excluding random chats on Slack or during calls.

Even if my view is not a global view, whatever I'm sharing has been confirmed every time I meet a new person in the company, so I have no reason to believe the "dark side of Grafana" to be completely different then what I've seen so far. 

### Fast growing company, controlled chaos

Grafana is growing **fast**. The company announced a [$24M Series A funding](https://grafana.com/about/press/2019-10-24-grafana-closes-series-a/) in October 2019 and subsequent [$50M Series B](https://grafana.com/about/press/2020-08-17-series-b-announcement/) a couple of weeks ago. When I joined, 10 months ago, we were about 110 headcounts. Today we're 180+ and keep counting. I think it's fair to call it a fast-growing company.

Whenever I think to a fast-growing company, I have an image in my mind: chaos. How can you grow a company unorganically, without introducing chaos? I don't know, but didn't happen. Chaos is under control, the company went through few re-orgs including a recent large one already [covered very well by my colleague Goutham](https://gouthamve.dev/my-first-re-org/).

Big shout out to how they managed the re-org: privately announcing to everyone during 1:1s before having an all-hands, being clear no layoffs were involved, the transparency while answering questions, are all important details that make you feel Grafana cares about people. A lot.

### The culture

Grafana has an incredibly **open culture**.

Since day zero you can access to a lot of business critical information and the level of trust is very high. There are obviously decisions taken behind closed doors (as it should be) and there are surely information not circulating to the whole company until the right time (as it should be), but some days I've the feeling I access to more critical information now than when I was a co-founder. Really.

I don't know how long it will last. As the company will continue to grow it's likely to be difficult to keep this level of transparency and openness (and if so, I will totally understand it), but so far the level of transparency is admirable.

### Great managers

I changed two managers so far, Tom and David. They're both great. Managers can make an huge difference in the company. The most valuable 30 minutes slot of my week, is the 1:1 I'm having with my manager.

When I met David for the first time a couple of months ago, I asked him: "What should I expect from our 1:1?". And he told me: "I don't want to talk about projects". And so we did.

The weekly 1:1 I'm having with my manager is **focused on me**. I'm receiving invaluable feedback during our 1:1s, from how to grow on my career path to how to structure a good tech talk. We talk and share ideas about productivity, mentoring, open-source, but everything we talk about is focused on me, how to improve and how to make Grafana a better place for me.

David now, and Tom before, showed me that great manager can make an huge difference in your career path ❤️.

### Teams and squads, not silos

But how is Grafana organized internally?

To keep it simple. We're grouped into teams (I'm in the Cloud team), which are broad groups of people working on a specific business area, in my case the [hosted solutions offering](https://grafana.com/products/cloud/) like Hosted metrics or Hosted logs.

Each team can have multiple squads, which is a smaller group of people (5-10) working on a specific project, in my case [Cortex](https://cortexmetrics.io) which is the system powering Hosted metrics. Each squad usually have a tech lead. Managers are usually assigned to people based on timezone, cross squad boundaries, but usually don't cross team boundaries.

On a daily basis, we have an high interaction within the squad, a moderate iteraction within the team and a lower one with the rest of the company.

**Squads are not silos**. We're encouraged to interact with the rest of the company (and we do it) and I've never heard someone saying "oh, I don't care, it's not my job".

**We all care about making the whole company successful**, we do pair with sales and solutions engineers to on-board customers, we share feedback to areas outside the one of our competence, but it's inevitable (and also desiderable) that we spend most of our time within the squad.

### No micro management

Oh, I love this thing. There's no micro management at Grafana Labs.

None will tell you what you have to do on a daily basis. You're expected to diligently organize yourself. I autonomously plan my week and my day, as I recently shared in the talk "[The path to being an effective engineer](./the-path-to-being-an-effective-engineer.html)".

So, how we align to the company goals? The management shares company-wide OKRs on a quarter basis. They're very high level. Based on that, each team leader defines the team-level OKRs aligned with the company ones. And then, each individual contributor works, along with their manager, to define their own OKRs for the quarter.

Finally, execution time! We're expected to organize ourself to execute our OKRs. None plans the month, week or day for you. We obviosuly frequently sync with the team, squad and manager, we raise flags if anything is going unexpected, we change our plans when priorities change, but we're given an high degree of freedom and responsability at the same time.

### Strong opinions, loosely held

Yes, there're strong opinions here. Stronger than what I was used before. And you know what? I like it.

People has strong opinions. You're encouraged to have strong opinions, but loosely held. I've been involved in conversations during which people with strong opinions changed their mind in a heartbeat once new data points were brought to the table.

Whatever are your strong opinions, the goal is not to be right, but to take the right decision. And in case of stall, we disagree and commit. There's nothing worth than a stall, in a decisional process. A suboptimal decision is better than no decision at all.

## Oh wow, so all rainbows and unicorns?

Nah, it's not all rainbows and unicorns. The perfect working place doesn't even exist and, I believe, it's not even desiderable. Some days are really enjoyable, others are tougher. Sometimes I end the day mentally exhausted, others the pager doesn't stop ringing, but **I don't feel stressed**. I'm hard working, but not burning out.

I start the day with a smile and I end the day with the same smile, whatever happened in between. And this, to me, is the best signal to know I'm in the right place, at the right time.

---

_This is not a marketing article and is based on my personal experience. Opinions are obviously mine. However, if some or all of this sounds appealing to you, take a look at the long list of [open positions at Grafana Labs](https://grafana.com/about/careers/)!_