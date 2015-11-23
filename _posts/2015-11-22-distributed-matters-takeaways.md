---
layout:         post
title:          "Distributed Matters Conf: Takeaways"
keywords:       scalability, distributed matters, docker, containers, microservices
date:           2015-11-22 14:00:00 GMT
---


While travelling back home, it's time to sit down and think about the two busy days spent at **Distributed Matters**. The conference was so so, few talks have been pretty good, some others pretty bad, the rest lies in the middle, but **people was quite good** and I had great chats with few of them.

The conference topic was around the current trends in the industry, **containers** and **microservices**, thus my takeaways are mostly focused on them.

*I've no production experience either with containers or microservices, thus the following rant is a mix of feedback I collected and personal thoughts.*


## Docker and containers

**Docker is amazing**. It makes building and running applications in containers, easy and funny. The following rant is not against Docker or containers, but the feeling of a lack of consciousness about it.

Containers fit pretty well to deploy **stateless services**. Since it has no persistent state, or its state is stored on another service, a stateless container is easy to deploy, replicate, upgrade or replace. Running a single service per container helps guarantee a separation of concerns, fits well with microservices architectures, is much easier to maintain, and lead to **fast and reliable (hopefully atomic) deploys**. Amazing!

However, your application at some point needs to store some persistent data, like databases, and here feedback diverges. Some people, like [DEIS](http://deis.io/) developers, suggests to run databases in the old fashion way, so far. Others, like Kelsey from Google, say it's perfectly fine to run in a container. Some others, like [ClusterHQ](https://clusterhq.com/), built a data volume manager ([Flokker](https://github.com/ClusterHQ/flocker)) to run Dockerized databases in production and so on.

Looking at how many different, sometime opposite, approaches are emerging, it makes me feel there's still much experimentation around it, thinner benefits migrating stateful services to containers and definitely not a long-time proved production experience.

> Running a reliable stateful service is pain. Someone saying differently, is selling something.

**Running a stateful service is a pain, inside or outside containers**. Usually my approach in such case is to get stuck to old-fashioned proved solutions, lying in a *known unknowns* world: I known there's much I don't know, that someone else known. This is my very personal opinion, and I would be happy to get contradicted: *leave a comment below, I'm glad to hear your feedback*.

Moreover, there's an huge amount of tools and solutions out there, to manage a lot of different aspects of an infrastructure built on containers. It's out of the scope of this quick summary talking about it, and I definitely haven't enough knowledge, but let me mention I've been pretty impressed by [Kubernetes](http://kubernetes.io/), a containers cluster manager with an evoluted (and customizable) scheduler. The **scheduler** is actually where you can get most benefits, cause it enables intelligent deployments, self-healing systems and resources utilization optimizations.

Note: *CoreOS + Docker + Kubernetes was the most common stack I've seen there*.


## Microservices

When you talk about microservices with someone, you feel like the person you're talking to has a completely different vision in his mind. Everyone agrees that decoupling services, make them scale separately, self-healing, individually tested, is a good principle to scale both your infrastructure and team, but then visions diverge once you discuss how to build it.

Microservices is like applying object oriented design and testing principles to services. It makes sense, but if deploying a single reliable service takes time and effort, deploying tens risks to lead to a serious pain to small teams.

> There's no one solution fits all. There's whatever works for you.

Microservices design was born in big companies with huge products where multiple teams work together, and it definitely makes sense to split the product into logically separated services, each one with its well-defined API, individually tested, self scalable.

I'm not that sure that this approach works fine on small companies with few developers working on small or medium-sized products. You will probably run into an over-engineered architecture that you can't handle, and the old-fashioned monolith at the end was not that bad.


## Spilo: PostgreSQL cluster auto-failover

A special mention should go to the talk about [Spilo](https://github.com/zalando/spilo), the **Zalando's open-source solution to manage PostgreSQL databases on EC2** that, once configured, allows you to easily setup an HA database cluster based upon streaming replication with auto-failover.

The **live demo** was pretty impressive. In few minutes, he turned on 3 new EC2 instances, deployed 1 master database and 2 slaves, configured an AWS ELB routing the traffic to master, killed the master instance and in less than 10 seconds a slave has been automatically elected to master and ELB traffic re-routed to the new master.

> Setup is tough and requires knowledge, but the live demo was pretty impressive.

Spilo tries to ease the initial cluster setup and management, providing a command line interface smoothly integrated with EC2, and an **auto-failover** system that relies on ELB to route traffic to the master.

What it actually doesn't solve is **split brain**: when a master goes down (or is unreachable due to a network failure), some transactions running on the *dead* master could have not been replicated to other slaves yet, so when a slave is elected as *new* master it could be some transactions behind. Depending on your business, this could be an issue or not. For many businesses out there, eventually consistency is just enough.

The cost of this nice solution, is that **the setup is not that easy and requires much knowledge**. Spilo relies on [Patroni](https://github.com/zalando/patroni), a boilerplate used to build PostgreSQL HA clusters. Patroni relies on ZooKeeper or etcd, thus you need one of them in a HA setup. You got what I mean by "much knowledge", right?

Finally, a note about a common question: **why not using AWS RDS**, that provides most of such features out of the box? Zalando has three good reasons:

- **Vendor lock**: migrating away from RDS is possible, but pretty hard to do (expecially if you aim at no downtime)
- **No superuser access**: no superuser access to database, but a limited `rds_superuser` role
- **No untrusted languages support**



## Performance Testing Crash Course

Another nice talk was about measuring server and client-side performances, in a web application. It's nothing new, but I learned few more tools that could be used from time to time. Here is a quick summary.

### Server-side

- [siege](https://github.com/JoeDog/siege): an `ab` alternative
- [beeswithmachineguns](https://github.com/newsapps/beeswithmachineguns): creates a set of bees (EC2 instances) to attack (load test) a target (web site)
- [locust.io](http://locust.io/): script the user behaviour with Python code, and run a distributed load test that simulates user interaction

### Client-side

- `npm install psi`: Page Speed Insights on your command line
- `npm install -g sitespeed.io`: nice open-source tool to analyze web performances
- [WBench](https://github.com/desktoppr/wbench): a tool that uses the HTML5 performance timing API to benchmark end user load times for websites
- [webpagetest.org](http://www.webpagetest.org): check page load time from any browser / any location
- [Apica](https://www.apicasystem.com): load testing as a service



## Takeaways

> Listen everyone, collect feedback and experiences, think with your mind, take decisions that make sense to your business.

**Docker** is fascinating and solve many problems. The community is very active, there're some open points but the technology is evolving fast, and new tools born every day. **Takeaway: it's something really worth to seriously start playing with**.

**Microservices** principles make much sense, but it looks an *unknown unknown* world to me. Some companies got it right, others don't, many developers are experimenting. **Takeaway: don't put it to production, if you don't need it**.

