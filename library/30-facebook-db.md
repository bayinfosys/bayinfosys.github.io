# Scaling Databases: Lessons from Facebook's MySQL Journey

Most businesses will never face the scaling challenges that Facebook encountered in its early years. Yet the decisions Facebook made while scaling from thousands to millions of users contain lessons relevant to any growing system. This article examines Facebook's progression from a simple database to a sharded architecture, focusing on the practical constraints and trade-offs that drove each decision.

## The Starting Point

Facebook began with the standard web architecture of its era: the LAMP stack (Linux, Apache, MySQL, PHP). A single MySQL database held all user data. Web servers connected directly to this database to read and write information. This architecture worked because the constraints matched the capabilities. A few thousand users at Harvard produced a manageable amount of data and query load.

The simplicity provided real advantages. Developers could write straightforward SQL queries with joins across any tables. The database handled transactions and maintained consistency. Operational complexity remained low because only one system required monitoring and backup.

## Adding Memcache: The Lookaside Cache Pattern

As Facebook's user base expanded, read queries began to overwhelm the single MySQL instance. The solution was memcache, deployed as a lookaside cache. This pattern works as follows:

When a web server needs data, it first checks memcache. If the data exists in cache (a hit), the server uses it immediately. If the data does not exist (a miss), the server queries MySQL, retrieves the result, and stores it in memcache for future requests.

For writes, the process differs. The web server updates MySQL directly, then deletes the corresponding entry from memcache. This invalidation approach (rather than updating the cache) ensures the next read retrieves fresh data from the database.

This architecture succeeded because Facebook's workload was heavily read-biased. Users consume far more content than they create. Caching reduced database load significantly while keeping the authoritative data in MySQL.

However, memcache introduced new complexities. Cache invalidation required careful coordination to avoid serving stale data. The system needed mechanisms to handle thundering herds (many simultaneous requests for the same uncached item) and maintain consistency across distributed cache servers. Facebook developed techniques like leases (tokens that control which request can populate the cache after a miss) to address these challenges.

## The Write Bottleneck

Caching handles read scaling, but writes present a different problem. MySQL's architecture concentrates writes on a single master server. As Facebook grew, this became a fundamental constraint. Adding more read replicas helps with read load, but write capacity remains limited by the capabilities of one machine.

This bottleneck forced Facebook toward application-level sharding: splitting data across multiple independent MySQL instances.

## Application-Level Sharding

Sharding distributes data across multiple database servers based on a shard key. For Facebook, the natural choice was user ID. The application determines which MySQL instance holds a particular user's data, typically using a hash function or modulo operation:

```
shard_id = user_id % number_of_shards
```

This approach spreads users across shards with reasonable balance. User 1001 always maps to the same shard, ensuring consistency.

The operational mechanics involve maintaining multiple MySQL instances, each with identical schemas but different subsets of data. When the application needs data for user 1001, it calculates the shard ID, connects to that specific MySQL instance, and executes the query there.

### The Costs of Sharding

Sharding solves the write scaling problem but introduces substantial complexity:

**Loss of cross-shard operations**: SQL joins and transactions only work within a single shard. If user A (on shard 1) and user B (on shard 2) are friends, queries involving both users require separate database calls and application-level coordination. The database can no longer enforce referential integrity across shards.

**Application complexity**: The application must track which shard holds which data. Every database query requires routing logic. This code becomes distributed across the application, creating opportunities for errors and inconsistencies.

**Operational overhead**: Managing 100 MySQL instances is qualitatively different from managing one. Backup strategies, monitoring, failover procedures, and schema migrations all become more complex. When Facebook reached thousands of shards, even routine maintenance became a significant engineering challenge.

**Rebalancing difficulties**: Adding new shards requires redistributing data. With simple hash-based sharding (modulo N), changing the number of shards potentially requires moving most data. Techniques like consistent hashing reduce this cost but add their own complexity.

### Geographic Distribution Challenges

As Facebook expanded globally, data needed to exist in multiple regions to reduce latency. This meant replicating shards across datacentres. Master-slave replication with asynchronous writes introduced consistency problems.

Consider a user in Europe posting a comment. The write goes to the master database (perhaps located in the United States), then replicates asynchronously to European replicas. A European user reading the comment immediately after posting might not see it yet because replication has not completed. Facebook's solution involved cache invalidation strategies and accepting eventual consistency in certain contexts.

The cache layer complicated this further. Memcache instances in Europe could not immediately serve consistent reads from their local database replicas because replication lag meant the replica might not have the latest data. This created scenarios where user actions appeared differently to different users, causing confusion.

## When to Consider Sharding

Most applications should delay sharding as long as possible. Several approaches scale MySQL before sharding becomes necessary:

**Read replicas**: Direct read traffic to slave databases while writes go to the master. This handles read-heavy workloads effectively and is far simpler than sharding.

**Vertical scaling**: Increase the master database's resources (CPU, memory, faster storage). Modern hardware can handle substantial workloads on a single instance.

**Query optimisation**: Proper indexing, query tuning, and schema design often reveal significant performance improvements without architectural changes.

**Partitioning**: MySQL supports table partitioning, where a single table's data splits across multiple files based on defined criteria. This provides some scaling benefits while maintaining a single logical database.

Sharding becomes appropriate when:

- Write volume exceeds a single server's capacity, even with optimal hardware
- Data size makes single-instance backup and recovery impractical
- Geographic distribution requires data proximity to users across regions
- Vertical scaling costs become prohibitive compared to horizontal distribution

Even then, sharding should be approached deliberately. The complexity it introduces is permanent. Systems rarely return to unsharded architectures once committed to sharding.

## Practical Sharding Considerations

If sharding becomes necessary, several implementation details matter:

**Shard key selection**: The key should distribute data evenly and align with query patterns. User ID works well for social networks because most queries involve a single user. Choosing poorly creates hot spots where some shards handle disproportionate load.

**Shard mapping**: The simplest approach uses modulo operations, but this makes adding shards difficult. Alternatives include:
- Range-based sharding (user IDs 1-1000000 on shard 1, etc.)
- Hash-based sharding with consistent hashing
- Directory-based lookup tables that track which shard holds which data

**Cross-shard queries**: Plan for queries that need data from multiple shards. Options include denormalising data to avoid these queries, running parallel queries and merging results in the application, or maintaining separate analytical databases.

**Schema changes**: Applying schema migrations across hundreds of shards requires careful orchestration. Facebook developed tools to manage this process, applying changes gradually and monitoring for issues.

## Beyond Sharding: TAO

By 2009, Facebook's sharded MySQL architecture had grown to thousands of instances. The complexity of managing this system, combined with the limitations of memcache for graph-structured data (friends, likes, comments), led to TAO (The Associations and Objects).

TAO sits between the application and the sharded MySQL instances, providing a graph-aware caching layer. It models data as objects (nodes) and associations (edges), which aligns naturally with social network data. TAO handles routing to the correct MySQL shard, manages caching, coordinates writes across the storage and cache layers, and provides geographic distribution with eventual consistency.

The system processes over a billion reads per second and millions of writes while maintaining the underlying MySQL storage. This demonstrates that even at extreme scale, MySQL can remain viable when wrapped in appropriate abstraction layers.

For most organisations, TAO represents over-engineering. The system exists because Facebook's specific constraints (massive graph-structured data, global distribution, billions of users) made simpler approaches inadequate. The TAO paper (published at USENIX ATC 2013) provides detailed insights for those interested in these extreme-scale challenges.

## Lessons for Modern Systems

Facebook's journey offers several practical lessons:

**Start simple**: The LAMP stack served Facebook well through its early growth. Premature optimisation would have been wasted effort.

**Cache before you shard**: Memcache provided years of additional capacity before sharding became necessary. Caching is far simpler to implement and operate.

**Sharding is a last resort**: The complexity cost is substantial. Exhaust simpler approaches first.

**Pragmatic choices matter**: Facebook kept MySQL as the persistent store even when building TAO. The operational knowledge, tooling, and reliability of MySQL outweighed any theoretical benefits of switching to purpose-built systems.

**Abstraction layers help**: As systems grow complex, intermediate layers (like TAO) can hide complexity from application developers while managing the underlying distributed systems.

Most businesses will never need Facebook-scale infrastructure. A well-configured MySQL instance on modern hardware can handle millions of users. Read replicas and caching scale this further. Understanding when these approaches suffice, and when more complex architectures become necessary, is part of building maintainable systems.

The database scaling decisions your system needs depend on your specific constraints: query patterns, data size, geographic distribution requirements, and team capabilities. Facebook's choices were right for Facebook's constraints. Your choices will differ.

## References

For those interested in the technical details:

- "Scaling Memcache at Facebook" (NSDI 2013) - Details the memcache architecture and optimisations
- "TAO: Facebook's Distributed Data Store for the Social Graph" (USENIX ATC 2013) - The complete TAO system design
- "Scaling services with Shard Manager" (Facebook Engineering Blog, 2020) - Modern shard management at scale

These papers demonstrate both the engineering challenges of extreme scale and the pragmatic solutions that emerge from real constraints.
