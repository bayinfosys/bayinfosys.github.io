# RAG Strategy and Tooling

Retrieval-Augmented Generation (RAG) has become a cornerstone of modern AI systems, especially for enterprise applications where large language models need grounding in domain-specific knowledge.

But "RAG" isn't one thing. There are several techniques of varying complexity, and the tools chosen, particularly databases and indexing strategies, should reflect that technique.

In this article, I’ll walk through three types of RAG strategies, the tradeoffs behind each, and how to choose appropriate tooling for your context.

---

## Three Types of RAG Systems

**1. Naive RAG**
The simplest setup: embed your documents, store them in a vector database, and query using nearest-neighbour search. It is fast to implement and sufficient for many internal search tasks, though often brittle when queries are vague or abstract.

**2. Reranking RAG**
This approach retrieves a broad candidate set (for example, the top 100 results) and reranks them using a more capable model that examines full content, such as a cross-encoder. It increases relevance but adds computational cost and latency.

**3. LLM-Enabled or Agentic RAG**
In this case, LLMs participate earlier in the process: rewriting queries, generating document summaries during ingestion, or dynamically shaping retrieval. It is often the only way to maintain high quality when questions are complex or ambiguous.

---

## How Do Databases Support RAG?

You cannot run an effective RAG system without making infrastructure decisions. Below is a comparison of common vector databases and retrieval tools:

### FAISS

* **Indexing**: IVF, HNSW, PQ
* **Deployment**: Fully self-hosted; requires custom cloud deployment
* **Strength**: High performance and control
* **Limitation**: No built-in metadata filtering

### Qdrant

* **Indexing**: HNSW, Flat
* **Deployment**: Self-hosted or managed; supports Helm/Kubernetes on AWS and GCP
* **Strength**: Metadata filtering and hybrid search
* **Best for**: Flexible, mid-scale projects

### Weaviate

* **Indexing**: HNSW with plugin modules
* **Deployment**: Available via Helm, Terraform, or SaaS
* **Strength**: GraphQL interface and modular pipeline support
* **Best for**: Structured search and integration with external services

### Milvus

* **Indexing**: IVF, HNSW, ANNOY
* **Deployment**: Available via Helm or managed service
* **Strength**: High-scale, multi-billion vector workloads
* **Best for**: Performance-sensitive deployments

### Pinecone

* **Indexing**: Proprietary, HNSW-like
* **Deployment**: Managed service only
* **Strength**: Reliable and scalable
* **Limitation**: No self-hosting option

### pgvector (Postgres extension)

* **Indexing**: Cosine, L2, inner product
* **Deployment**: Self-hosted or cloud Postgres (e.g. RDS, Aurora)
* **Strength**: SQL-native; supports hybrid queries
* **Best for**: Business data with existing relational structure

### Chroma

* **Indexing**: Dense similarity
* **Deployment**: Local container or lightweight self-hosted use
* **Strength**: Simplicity; supports basic filters
* **Best for**: Prototyping and experiments

---

## Matching Tooling to RAG Strategy

* **Naive RAG** works well with `pgvector`, `Chroma`, or `DuckDB`. These are fast to set up, easy to reason about, and integrate with structured or tabular data.

* **Reranking RAG** benefits from `FAISS`, `Qdrant`, or `Milvus`. These support high-recall candidate sets, which rerankers require.

* **LLM-Enabled RAG** often depends on flexible pipelines and schema-aware storage. `Weaviate` and `Qdrant` are particularly suitable here, as they accommodate structured enrichment and allow dynamic querying.

Structured filters and clean metadata are important, and especially relevant when the LLM is orchestrating retrieval steps based on intermediate reasoning.

---

## Summary

RAG systems are not one-size-fits-all. The difference between a frustrating chatbot and a useful AI application often comes down to retrieval quality. That quality, in turn, depends on how you structure, index, rank, and augment the content behind your models.

By understanding your RAG architecture (naive, reranking, or LLM-enhanced) you can:

* Select the right retrieval and storage tooling
* Prioritise the evaluation points that matter
* Iterate effectively and deliver grounded, performant systems

If you're working in this space or exploring how to apply RAG techniques, I’d be interested to hear how you’re approaching the tradeoffs.
