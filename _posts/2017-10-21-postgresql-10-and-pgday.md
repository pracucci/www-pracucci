---
layout:         post
title:          "PostgreSQL 10 and PGDay.IT"
tags:           postgresql
date:           2017-10-23 03:00:00 GMT
keywords:
---

Last week I attended [PGDay.IT](http://2017.pgday.it/it/), the italian PostgreSQL conference organized by ITPUG and [2ndQuadrant](https://www.2ndquadrant.com/it/). It was a great opportunity to learn more about PostgreSQL in general, PostgreSQL 10 and to meet some people I just knew virtually.

As already done in the past for other conferences, this is **the first of a series of posts** to sum up what I've learned and my thoughts about the conference. The following posts will be published in the next few days.

Feel free to leave **any** feedback at the bottom of the page. Enjoy reading!


## PostgreSQL 10

PostgreSQL 10 is probably one of the most exciting major releases since years. The main new feature is the blazoned **[logical replication](#logical-replication)**, in addition to a long list of new features, optimizations and improvements. The following summary is not intended to be complete, but just to sum up the main topics covered during the conference. To learn more, I strongly encourage you to read the exaustive list of [new features in PostgreSQL 10](https://wiki.postgresql.org/wiki/New_in_postgres_10).


### Logical Replication

Logical replication is the second and new form of replication introduced to PostgreSQL. It's **not intended to replace streaming replication**, but to augment the scenarios in which you can replicate data using a natively supported solution.

To understand the differences between the two types of replication and when you should use what, we need to do a quick recap of streaming replication first. **Streaming replication** is based on a continuous stream of bytes added to the WAL of the master to the connected replicas. It both support asynchronous and synchronous replication (quorum based), and cascading replicas where a slave gets the stream from another slave instead of the master.

Since streaming replication is WAL based, any data is replicated: tables data, schema changes, indexes, sequences and so on. For this reason, **streaming replication is mainly used for high-availability** with hot standby replicas and for read replicas.

The downside of streaming replication is that any data is replicated. You can't partially replicate your database, like a single schema or a group of tables. Moreover, since it's WAL based, the replicas must run the same exact major version of Postgres (data format changes every major version).

PostgreSQL 10 - after a very long and hard work started in version 9.3 - introduces **logical replication**. As the name suggests, logical replication continuously streams a logical representation of the changes instead of the bytes changed in the WAL. Under the hood, logical replication is still based on the WAL, but it "decodes" the bytes changed in the WAL back into the logical change before streaming it to other nodes. It's the inception of replication.

Logical replication is based on a **publish/subscribe model**. You create one or more publications on the master, and subscriptions on other nodes. I'm not talking specifically about slaves, because logical replication allows to replicate data to other masters as well.

Each publication is related to a set of tables, making possible to **replicate just a subset of your database**. You can also `CREATE PUBLICATION name FOR ALL TABLES` and the whole database - not cluster - will be replicated.

Logical replication has been designed to satify the need of data integration and opens to a new wide range of usages. Since logical replication is not binded to the WAL format, you can replicate data between different versions of PostgreSQL. As you already guessed, you can use logical replication to migrate data to a new major version, making possible the impossible: **major version upgrades with nearly zero downtime**.

Logical replication has **limitations** as well. The biggest limitation is that it's able to **replicate table data only**. This means that schema changes, indexes or sequences are not replicated (not yet). It's likely to happen in the future, but it's apparently more complex than it may sound.

A part from this, logical replication looks a great step forward in the PostgreSQL ecosystem and having the ability to do major version upgrades while keeping your system up reliefs a real and big pain suffered by many people for many years. Honestly, I'm really excited about it!

So, should you use **streaming or logical replication?** It depends!

- **Streaming replication**: high-availability and read replicas
- **Logical replication**: partial replication, online upgrades, multi-master (it's not [bi-directional](https://www.2ndquadrant.com/en/resources/bdr/) replication)


### Parallelization in index scans

Query execution parallelization is not brand new. PostgreSQL 9.6 introduced parallel queries, while index scans parallelization has been added in version 10. At the current stage, not every index scan is parallelizable: it just supports **B-tree scans** and **bitmap heap scans**. Getting the basics is important to understand when parallelization gets into the game and improves performances.

Parallelization is basically a **map reduce**. During the execution of a query that - according to the query planner - can benefit parallelization, the main process spawns a set of workers each of which will inspect a portion of the index and report the result back to the main process that will merge results. The job done by workers is limited in scope:

- **B-tree**: workers inspect left pages in parallel
- **Bitmap heap scan**: workers inspect heap chunks in parallel

Parallelism has a cost, that's spawing workers and moving data back and forth. For this reason, the query planner will choose to use or not parallelization based upon an **heuristic** that takes in account the **index size** and a set of customizable parameters specifying the **setup and tuple data transfer cost**. Be also aware that each worker is a backend using 1 connection slot: if you configure Postgres to aggressively use parallelization you could quickly saturate connection slots.

Parallelism is therefore efficient when there's an huge amount of data and its overhead is way lower than the performance benefit you get.


### Hash indexes logged on WAL

The hash index is a key-value map, who can only handle **simple equality comparisons** very efficiently, with access in `O(1)`. Like anything, it comes with some **limitations**:

- Can only handle searches by identity `=` 
- Its size grows `O(N)` with the dataset

Before PostgreSQL 10 hash indexes were not logged on WAL, so they were not crash safe and were not replicated to read replicas. They were basically just living in shared buffers. These limitations reduced a lot the usage of such indexes in many cases. PostgreSQL 10 solves such limitations, making them **crash safe** and **replicated**. Yup!


### SP-GiST support for inet data

PostgreSQL 10 extends SP-GiST indexes adding support for inet data (IPv4 and IPv6 addresses), defining an operator class to run **range queries on indexed IP addresses**. It's likely not an feature you will use everyday, but in my experience it's quite useful for IP-based geo-location databases or to optimize tracing of events generated by clients in specific CIDRs.


### BRIN summarization for new INSERTs

BRINs (Block Range INdexes) have been introduced in PG 9.5 and are designed for handling very large tables in which certain columns have some natural correlation with their physical location within the table. It basically expects that **data logically adjacent is stored in adjacent blocks on disk**.

The process of indexing data in a BRIN is called summarization. When a new disk page is created, it's not automatically added to index but remains unsummarized until a summarization run is invoked later. Before PostgreSQL 10 new `INSERT` tuples were summarized on `VACUMM` or calling `brin_summarize_new_value()`.

PostgreSQL 10 introduces **autosummarization**: when enabled at index creation `WITH (autosummarize=on)`, autovacuum will summarize new data. It's still possible to manually summarize / desummarize single blocks, but unfortunately BRINs are not able to shrink summarized data on `UPDATE` or `DELETE`. The only workaround is to rebuild the index with `REINDEX`. For this reason BRINs are practicle only in cases when your data is not frequently updated or deleted.


### SCRAM Authentication

PostgreSQL 10 introduces SCRAM as new authentication method that will replace MD5. Clients need to be updated as well in order to authenticate on PostgreSQL 10 with SCRAM. The MD5 algorithm will continue to be supported for backward compatibility for a while, yet you're strongly encouraged to move to the more secure SCRAM.



## Slides

<iframe src="//www.slideshare.net/slideshow/embed_code/key/1c8RwEVjiaRosW?startSlide=5" width="595" height="485" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" style="border:1px solid #CCC; border-width:1px; margin-bottom:5px; max-width: 100%;" allowfullscreen> </iframe>



## A feedback to conference organizers

Organizing a conference is hard. I know it. You know it. You did a good job, and the conference organization was quite above the average of an italian IT conference. I also believe you aim to do it better - year after year - and this is only reason why I'm going to give you my **personal, subjective and hopefully constructive feedback**.

A conference where there's at least a non-italian speaking attendee or speaker should be **english only**. To me it's a matter of respect. You invite foreign people to your conference, but then the conference introduction, spoken information and half of the talks are in italian. Sounds weird.

We're used to read and communicate in english during our daily job, from documentation to mailing lists, from foreign colleagues to customers. I can understand some people doesn't feel very comfortable to speak english, but I also believe everyone can understand it and we should overtake a bit this limitation. If you learned how PostgreSQL works, you can learn english too.

The conference ticket was **too cheap**. Yes. You really did a lot for such a low price (I spent less than 50€ for the early bird), but you could do way more if you double it. The price would still be acceptable compared to other conferences, but you can have more budget for a better catering or to invite more foreign speakers.

And the speakers. I've found **a noticeable difference between the level of speakers**. The conference was like divided into two: very high quality talks, low quality talks. Nothing in between. I would suggest to invest more time in the speakers selection. At the end, it's the most important part of the conference.

Last but not the least, the rooms. The conference was over two rooms. A very large and a very small one. **The small one was largerly undersized**. I've been left out for a couple of talks, it was always packed of standing people, and the temperature was hot.

That being said, conferences was great and I really learned a bunch of stuff. I would come back next year, and my feedback is just intended to be an hopefully constructive feedback to improve it further, year after year. Keep on doing a great job!
