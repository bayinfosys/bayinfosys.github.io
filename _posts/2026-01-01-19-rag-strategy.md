---
date: 2025-08-06
last_modified_at: 2026-07-26
layout: article
title: "The Components of RAG"
description: "RAG is not one architecture but four independent decisions: how you chunk, how you index, how you retrieve, and how you generate. A component breakdown, with the tooling that matches each one."
keywords: ["rag components", "rag indexing", "rag strategy", "retrieval augmented generation architecture", "vector database", "llm", "enterprise ai"]
topic: "AI Systems"
seo_title: "RAG Architecture Explained: Chunking, Indexing, Retrieval, Generation"
related:
  - 97-what-is-rag
  - 20-vector-db-deepdive
  - 33-vector-db-filters
  - 27-schema-docs
  - 10-agent-memory
---

# The Components of RAG

RAG gets discussed as though it were a single architecture with a name, chosen once and then built. It is better understood as four independent decisions, made separately and revisited on different schedules: how documents get broken into chunks, how those chunks get indexed and stored, how a query retrieves candidates from that index, and how a model turns the retrieved candidates into an answer. Treating these as one choice is where most RAG projects lose time, because a team commits to "a RAG system" when they should be committing to a chunking approach this month and a retrieval strategy next quarter, upgradable independently.

## Chunking and ingestion

Before anything is stored, a document has to be broken into pieces small enough to embed and retrieve individually. Fixed-size chunking (splitting by token count, with some overlap between chunks) is the simplest version and makes one decision at build time: chunk size. It is fast to set up and brittle wherever a topic boundary falls in the middle of a chunk. Semantic chunking, hierarchical chunking that preserves the relationship between a paragraph and its parent section, and enrichment steps that add context to a chunk before it is embedded, are all more capable alternatives with a real cost in engineering time. This is a large enough topic to deserve its own treatment, which the next article in this series covers in full, including the multimodal case: retrieving directly from document images rather than text extracted from them first.

## Indexing and storage

Once chunks exist, they need somewhere to live that supports similarity search at query time. This is an infrastructure decision, and the options differ enough that picking the wrong one shows up later as a rebuild.

| Store | Indexing | Deployment | Best for |
|---|---|---|---|
| FAISS | IVF, HNSW, PQ | Self-hosted, custom deployment | High performance where you control the whole stack |
| Qdrant | HNSW, Flat | Self-hosted or managed | Metadata filtering and hybrid search |
| Weaviate | HNSW with plugins | Helm, Terraform, or SaaS | Structured search, modular pipelines |
| Milvus | IVF, HNSW, ANNOY | Helm or managed | Multi-billion vector, high-scale workloads |
| Pinecone | Proprietary, HNSW-like | Managed only | Reliability without operating the infrastructure yourself |
| pgvector | Cosine, L2, inner product | Self-hosted or cloud Postgres | Business data that already lives in a relational schema |
| Chroma | Dense similarity | Local container | Prototyping and small-scale experiments |

Two things narrow this list quickly in practice. If your source data is already relational, pgvector keeps the vector index next to the tables it describes rather than in a separate system, and a fuller treatment of that path, including how to expose schema information for RAG over structured data, is in [SQL Schema Documentation for RAG Pipelines](/library/27-schema-docs.html). If you expect production traffic with metadata filters (by user, category, or date) rather than pure similarity search, the indexing trade-offs are covered in full in [Why Are Vector Databases Difficult?](/library/20-vector-db-deepdive.html) and [Filtered Vector Search](/library/33-vector-db-filters.html), which is worth reading before committing to a store, since the choice between them depends on filter selectivity in a way that is easy to get wrong from a features table alone.

## Retrieval

Retrieval is the step that turns a query into a set of candidate chunks, and it is where most of the complexity in a RAG system actually lives, independent of which database sits underneath it.

The simplest form embeds the query and returns the nearest neighbours by vector distance. It is fast, cheap, and brittle against vague or abstractly phrased questions, because the query embedding and the answer embedding are not guaranteed to sit close together in the vector space just because a human would recognise one as the answer to the other.

Reranking retrieves a wider candidate set (the top 100, say) using cheap similarity search, then reorders that set with a more expensive model that reads full passage content rather than comparing vectors. This recovers much of the accuracy that pure vector similarity loses, at the cost of an extra model call on every query.

Query rewriting and agentic retrieval move a language model earlier into the process: rewriting an ambiguous query before it is embedded, generating summaries at ingestion time so retrieval matches against a cleaner target, or deciding dynamically which source to query at all. This is often the only way to hold quality up when questions are complex or multi-part, and it is the retrieval strategy most likely to need the kind of build-step thinking laid out in [Context Is a Build Step](/library/62-context-compilation.html).

Naive retrieval pairs well with pgvector or Chroma, since both are fast to reason about and the retrieval logic stays simple. Reranking wants a store built for high-recall candidate sets, which is where FAISS, Qdrant, and Milvus earn their keep. Agentic retrieval tends to need schema-aware, flexible storage, which points back towards Weaviate or Qdrant rather than the simpler options.

## Generation

The final component is the model call that turns retrieved chunks plus the original query into an answer. This is the step most existing RAG writing focuses on almost exclusively, which understates its share of where things go wrong; retrieval quality determines what the model has to work with, and a fluent answer built on the wrong passage is a harder failure to catch than a search index simply returning nothing.

It is also the step where the third-party question becomes unavoidable. A generation call to a commercial API sends the retrieved context, which by construction contains the parts of your document set the system judged most relevant to the query, to whichever company operates that endpoint, on every single question asked. What that means for data exposure and for the shape of your bill is substantial enough to need its own treatment, which is next in this series.

## Choosing a starting point

None of these four decisions needs to be made at maximum sophistication on day one. A naive chunking approach, a simple vector store, similarity-only retrieval, and a single generation call is a reasonable starting system for an internal search tool with well-structured source documents. Each component can be upgraded independently once you know which one is actually limiting quality, which is a more tractable question than "is our RAG good enough", because it points at a specific piece of the pipeline rather than the whole thing at once.

(If you're scoping a RAG build and want a second opinion on which components are worth the engineering time, [get in touch](/contact).)
