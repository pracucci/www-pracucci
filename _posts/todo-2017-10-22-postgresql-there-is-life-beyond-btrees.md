---
layout:         post
title:          "PostgreSQL: there's life beyond B-trees"
tags:           postgresql
date:           2017-10-21 03:00:00 GMT
hidden:         true
keywords:
---

The primary use of indexes - in a database - is as **access methods**, a way to speed up access to data. The most known and used index in PostgreSQL is B-tree, a sortable and balanced tree, that fits well for general use cases. I admit that most of the time I've to create an index to speed up a query, I blindly create a B-tree which fit the most common situations.

But hey, there's life beyond B-tree and [Giuseppe Broccolo](https://twitter.com/giubro)'s talk very inspiring! PostgreSQL natively supports six index types:

- **B-tree**
- **Hash**
- **GiST**
- **SP-GiST**
- **GIN**
- **BRIN**


### Trees

Trees are binary structures hierarchically sorted, whose primary categorization split them into balanced and unbalanced. Balanced trees are generally faster for punctual searches, since they redux the number of nodes to be scanned on average, while unbalanced tree are faster for range searches, since logically closer data is closer in the tree structure too.

PostgreSQL supports four tree algorithms:

- **B-tree**: sortable and balanced
- **GIN**: generalized and balanced
- **GIST**: generalized and balanced
- **SP-GiST**: generalized and unbalanced


### Hashes

The **Hash** index is a key-value map, who can only handle **simple equality comparisons** very efficiently, with access in `O(1)`. Unfortunately it also have some **limitations** drastically reducing real use cases:

- Can only handle searches by identity `=` 
- The size grows `O(N)` with the dataset
- Before PostgreSQL 10 were [not crash safe and not replicated](#hash-indexes-logged-on-wal)


### BRINs

BRINs (Block Range INdexes) have been introduced in PG 9.5 and are designed for handling very large tables in which certain columns have some natural correlation with their physical location within the table. It basically expects that **data logically adjacent is stored in adjacent blocks on disk** (ie. _immutable payments transactions whose ids chronologically grow over the time_).

BRIN indexes are very small and fast to create. You can index TBs of data, with indexes in order of MBs.

These indexes simplify sequential table scans. Because a BRIN index is very small, scanning the index adds little overhead compared to a sequential scan, but may avoid scanning large parts of the table that are known not to contain matching tuples. In the general case, it can **offer a 10x - 100x scale factor compared to sequential table scans**.

Due to its nature presents some **limitations**:

- Low performances for dynamic data, since on each `UPDATE` tuples can be moved across disk pages, loosing their on-disk adjacency.
- When a new disk page is created, it's not automatically added to index but remains unsummarized until a summarization run is invoked later. A summarization can be manually trigged with `brin_summarize_range()`, occurs during a manual `VACUUM` or can be automatically run by autovacuum if enabled with the `autosummarize` parameter. [Autosummarization has been introduced in version 10](#brin-summarization-for-new-inserts).
- Summarization is additive. It adds new data to index, but it's still not able to shrink summarized data on updates and delete. If you update or delete data you need to run `REINDEX` every while to rebuild the index.




TODO:
- opclass
- index options
- https://devcenter.heroku.com/articles/postgresql-indexes
- https://www.citusdata.com/blog/2017/10/17/tour-of-postgres-index-types/

In order to be efficient, indexes should fit in shared buffers. The topic is more complex. The portion of index you need should be stored in RAM and - possibly - in shared buffers. But it's mainly important to have it in RAM. To monitor and investigate it, you checkout two PG extensions: pg_pageinspect and pg_buffercache.


### Operator class

CREATE INDEX xxx USING method ON table (column opclass_name) WITH (opt=value)



