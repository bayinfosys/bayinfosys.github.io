# Filtered Vector Search

Vector search rarely operates in isolation. Production systems need to filter by category, date ranges, user permissions, or other metadata. They often combine vector similarity with text relevance, popularity signals, or business rules. SQL can express all of these operations clearly, but the physical structure of indexes determines what executes efficiently.

This article examines two aspects of filtered vector search that extend beyond SQL syntax: how metadata integration in vector indexes affects execution, and how multiple ranking signals can be combined. Understanding these progressions helps match implementation choices to actual requirements.

## Metadata in the Graph

PostgreSQL with pgvector separates vectors from their associated metadata. The database maintains a table with columns for both embeddings and attributes, but the HNSW vector index contains only the vector data itself.

```
Table: documents
├─ id
├─ embedding (vector)
├─ category
├─ published_date
└─ author_id

HNSW Index on embedding:
Nodes connected by vector similarity only.
No category, date, or author information in the graph.
```

When executing a filtered vector query, the PostgreSQL query planner must choose between index strategies. It cannot use the HNSW index to filter by category during graph traversal because the category information simply does not exist in that index structure.

Consider this query:

```sql
SELECT * FROM documents 
WHERE category = 'tech' 
  AND published_date > '2024-01-01'
ORDER BY embedding <-> query_vector 
LIMIT 100;
```

The query planner might take several execution paths:

**Path 1: B-tree index on category**
Filter to documents matching the category and date criteria first (perhaps 1000 documents), then perform brute-force vector distance calculations on those candidates. This works when filters are highly selective.

**Path 2: HNSW vector index**
Traverse the HNSW graph to retrieve 500 nearest neighbours by vector similarity, then filter those candidates by category and date. If fewer than 100 results remain after filtering, iterate to retrieve more candidates from the graph and filter again. This is what pgvector calls iterative scan.

**Path 3: Sequential scan**
If the planner estimates both indexes are too expensive given the query parameters, it might scan the entire table.

The query planner bases this decision on index statistics, estimated selectivity of each filter, and the cost model for different operations.

Dedicated vector databases like Qdrant and Weaviate take a different approach. They store metadata alongside vectors in the index structure itself:

```
Vector Index Node:
{
  vector: [0.1, 0.3, 0.8, ...],
  category: "tech",
  published_date: "2024-01-15",
  author_id: 42
}
```

During graph traversal, the database can examine metadata and skip nodes that do not match the filter criteria. This happens in a single pass through the graph without requiring oversampling or iteration.

The SQL remains identical:

```sql
-- Same query works in PostgreSQL and Qdrant
SELECT * FROM documents 
WHERE category = 'tech' 
  AND published_date > '2024-01-01'
ORDER BY embedding <-> query_vector 
LIMIT 100;
```

But the execution differs fundamentally. PostgreSQL retrieves candidates then filters. Qdrant filters during retrieval.

Neither approach is universally superior. The trade-offs depend on specific query patterns and infrastructure:

**PostgreSQL advantages:**
- Simpler index maintenance (HNSW graph structure is cleaner)
- Leverages existing PostgreSQL infrastructure and operational knowledge
- Flexible query planner can choose different strategies based on filter selectivity
- Lower operational complexity for teams already running PostgreSQL

**Dedicated vector database advantages:**
- More efficient for queries with multiple moderately selective filters
- Reduced memory bandwidth (no need to fetch and discard filtered candidates)
- Purpose-built for vector workloads with integrated metadata

The practical implications emerge when query patterns and data scale become clear. If filters typically reduce the candidate set by 50-80 percent, integrated filtering saves substantial work. If filters are either very selective (reducing to less than one percent of data) or not very selective (most candidates pass), the difference matters less.

For PostgreSQL specifically, query structure significantly affects whether the planner chooses the vector index. The Clarvo article referenced earlier provides detailed guidance: keep WHERE clauses simple, place ORDER BY distance as the final clause before LIMIT, use EXISTS for related table filters, and consider denormalizing frequently filtered columns to avoid joins.

The constraint is structural. HNSW graphs in PostgreSQL maintain vector connectivity only. Metadata lives elsewhere. This is not a limitation of SQL but a consequence of index architecture.

## Combining Ranking Signals

Moving beyond filtered vector search to ranked vector search introduces signal composition. Rather than ordering results by vector distance alone, production systems often combine multiple signals: semantic similarity, keyword relevance, recency, popularity, or business-specific scores.

SQL handles this naturally through weighted combinations in the ORDER BY clause.

Starting with pure vector search:

```sql
SELECT id, embedding <-> query_vector as distance
FROM documents
ORDER BY distance
LIMIT 10;
```

Add text relevance using PostgreSQL full-text search:

```sql
SELECT id,
  embedding <-> query_vector as vector_distance,
  ts_rank(text_tsvector, query_tsquery) as text_rank
FROM documents
WHERE text_tsvector @@ query_tsquery
ORDER BY (0.7 * vector_distance + 0.3 * text_rank)
LIMIT 10;
```

Extend with popularity signal:

```sql
SELECT id,
  embedding <-> query_vector as vector_distance,
  ts_rank(text_tsvector, query_tsquery) as text_rank,
  log(view_count + 1) / 10.0 as popularity_score
FROM documents
WHERE text_tsvector @@ query_tsquery
ORDER BY (
  0.5 * vector_distance + 
  0.3 * text_rank + 
  0.2 * popularity_score
)
LIMIT 10;
```

The SQL remains clear and expressive. The challenge lies in signal normalization and query planner behavior.

Different signals operate on different scales:
- Vector distance: 0 to 2 for cosine distance on normalized vectors
- Text rank: 0 to approximately 1 depending on document length and query complexity
- View count: unbounded, hence the log transformation

Without normalization, one signal dominates. The popularity score in the example uses log scaling and division to bring values into a comparable range. More sophisticated approaches might use min-max normalization, z-scores, or percentile ranks computed from dataset statistics.

The query planner faces new challenges when ORDER BY contains complex expressions combining multiple signals. Simple vector ordering with a single distance calculation can use the HNSW index efficiently. Combined ranking with multiple signals and arithmetic operations may cause the planner to abandon the vector index entirely, opting for a sequential scan instead.

This creates a choice between single-stage and two-stage execution.

Single-stage execution attempts to compute all ranking signals and combine them in one query:

```sql
SELECT id,
  embedding <-> query_vector as vector_distance,
  ts_rank(text_tsvector, query_tsquery) as text_rank,
  log(view_count + 1) / 10.0 as popularity_score,
  (0.5 * (embedding <-> query_vector) + 
   0.3 * ts_rank(text_tsvector, query_tsquery) + 
   0.2 * log(view_count + 1) / 10.0) as final_score
FROM documents
WHERE text_tsvector @@ query_tsquery
ORDER BY final_score
LIMIT 10;
```

This works if the query planner can use indexes effectively. Examine the query plan with EXPLAIN ANALYZE to verify. If the planner chooses a sequential scan due to expression complexity, consider the two-stage approach.

Two-stage execution separates candidate retrieval from ranking:

```sql
-- Stage 1: Vector search retrieves candidates using HNSW index
CREATE TEMP TABLE candidates AS
SELECT id, embedding <-> query_vector as vector_distance
FROM documents
ORDER BY vector_distance
LIMIT 500;

-- Stage 2: Rerank candidates with all signals
SELECT 
  c.id,
  c.vector_distance,
  ts_rank(d.text_tsvector, query_tsquery) as text_rank,
  log(d.view_count + 1) / 10.0 as popularity_score,
  (0.5 * c.vector_distance + 
   0.3 * ts_rank(d.text_tsvector, query_tsquery) + 
   0.2 * log(d.view_count + 1) / 10.0) as final_score
FROM candidates c
JOIN documents d ON c.id = d.id
WHERE d.text_tsvector @@ query_tsquery
ORDER BY final_score
LIMIT 10;
```

This approach separates concerns. The first stage uses the vector index to retrieve candidates based purely on semantic similarity. The second stage operates on a small dataset (500 candidates) where sequential processing is fast and complex ranking expressions are acceptable.

The two-stage pattern provides flexibility. Candidate retrieval can use any strategy (vector search, text search, filtered queries) while ranking logic remains independent. Ranking weights can be adjusted without affecting retrieval. Different ranking functions can be tested against the same candidate set.

Moving ranking to application code provides even more flexibility:

```python
# Retrieve candidates via simple vector query
candidates = db.execute("""
    SELECT id, 
           embedding <-> %(query_vector)s as vector_distance,
           view_count,
           text_tsvector
    FROM documents
    ORDER BY vector_distance
    LIMIT 500
""", {"query_vector": query_vector})

# Compute complex ranking in application
for doc in candidates:
    text_score = compute_text_rank(doc.text_tsvector, query)
    popularity = math.log(doc.view_count + 1) / 10.0
    
    doc.final_score = (
        0.5 * doc.vector_distance +
        0.3 * text_score +
        0.2 * popularity
    )

# Sort and return top results
results = sorted(candidates, key=lambda d: d.final_score)[:10]
```

Application-level ranking allows dynamic weight adjustment, A/B testing of ranking functions, incorporation of user-specific signals (personalization), and complex business logic that would be awkward to express in SQL.

The trade-off is latency. Network round-trips and data serialization add overhead. For most applications processing hundreds of candidates, this overhead is negligible compared to the flexibility gained. For applications requiring single-digit millisecond latency, keeping ranking in the database may be necessary.

Signal composition requires understanding both the mathematical properties of the signals being combined and the execution characteristics of the system performing the combination. SQL provides clear expression. Physical execution depends on index capabilities and query complexity.

## Conclusion

SQL syntax remains consistent across filtered and ranked vector search implementations. The query expresses intent clearly: retrieve documents matching criteria, ordered by combined scoring function, limited to top results.

Physical execution diverges based on index architecture. PostgreSQL separates vectors from metadata, requiring post-filtering of candidates. Dedicated vector databases integrate metadata into the graph structure, enabling filtering during traversal. Neither is universally better. The choice depends on filter selectivity patterns and infrastructure constraints.

Ranking signal composition introduces normalization challenges and query planner complexity. Simple vector ordering leverages indexes efficiently. Combined multi-signal ranking may require staged execution or application-level processing to maintain performance while supporting flexible ranking functions.

Understanding this progression from SQL syntax to index structure to signal composition helps match implementation to requirements. Start with PostgreSQL for most use cases, optimize query structure, and introduce additional complexity only when measurements indicate it is needed.
