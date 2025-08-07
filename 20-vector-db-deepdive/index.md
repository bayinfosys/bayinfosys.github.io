# Why Are Vector Databases Difficult? A Deep Dive

## Introduction

Vector databases have become essential in modern AI applications, powering semantic search, retrieval-augmented generation (RAG), and recommendation systems. These databases store **embedding vectors** (high-dimensional numerical representations derived from machine learning models). Unlike traditional databases that store structured or keyword-based data, vector databases enable **similarity search**, where a query retrieves the most semantically similar items.

Despite their utility, vector databases introduce unique challenges, particularly when handling **multi-model embeddings**. Different models generate vectors of varying sizes and distributions, making indexing, querying, and infrastructure management more complex. This article explores the core difficulties of vector databases, including:

* The nature and origin of embeddings
* Large and variable vector sizes
* CPU vs. GPU deployment and caching implications
* Indexing complexities (HNSW, IVF, etc.)
* Memory bandwidth and storage constraints
* Fine-tuning embedding models for better retrieval
* The difference between storing and querying embeddings

## Understanding Embeddings and Latent Space

### What Are Embeddings?

Embeddings are numerical representations of data (text, images, audio) mapped into a high-dimensional space. These vectors capture semantic relationships—similar items are closer together, while dissimilar items are farther apart.

For example, **text embeddings** from models like `all-MiniLM-L6-v2` map similar phrases to nearby points in space. **Image embeddings**, such as those from Meta’s `SAM` model, encode visual features into high-dimensional vectors, often exceeding **1,024 dimensions**, making them significantly larger than text embeddings.

### How Are Latent Spaces Built?

Modern embeddings are derived from deep learning models, often from the intermediate layers of a **Transformer model**. Historically, **Variational Autoencoders (VAEs)** were common, but today’s approaches primarily use:

* **Contrastive Learning (e.g., CLIP, SimCLR)**: Forces similar items to have close embeddings while pushing dissimilar ones apart.
* **Self-Supervised Learning**: Uses masked token prediction (BERT-style models) or next-sentence prediction.
* **Metric Learning**: Optimizes embeddings for retrieval-specific objectives.

### Why Fine-Tune Embeddings?

Off-the-shelf embeddings might not be optimal for specific domains. **Fine-tuning** aligns the latent space with the problem at hand. The key steps:

1. **Collect labeled pairs** (query-document pairs, similar/dissimilar images, etc.).
2. **Train with a loss function** (contrastive loss, triplet loss, or cosine similarity loss).
3. **Evaluate using retrieval metrics** like **Mean Reciprocal Rank (MRR), Recall\@K, or NDCG**.

Fine-tuned embeddings can dramatically improve retrieval quality but add complexity in maintaining custom models.

## Why Are Vector Databases Challenging?

### 1. Large and Variable Vector Sizes

Embeddings range from **256 dimensions (simple models)** to **2,048+ dimensions (complex image models like SAM)**. High-dimensional vectors cause:

* **Memory bloat**: A dataset with millions of 1,536-d vectors consumes vast amounts of RAM.
* **CPU cache inefficiencies**: Large vectors don’t fit neatly in cache lines, leading to slow memory accesses.
* **Difficulty in mixed-model retrieval**: Different models output varying sizes, forcing schema design choices (multiple indexes or concatenated vectors).

### 2. CPU vs. GPU for Vector Search

#### FAISS and GPU Acceleration

Facebook AI Similarity Search (**FAISS**) is the most widely used library for vector search, supporting both **CPU and GPU acceleration**.

* **CPU-Based FAISS**: Uses SIMD (vectorized operations) and multithreading to optimize nearest neighbor search.
* **GPU-Based FAISS**: Leverages CUDA for parallel brute-force search, often **10-100x faster** than CPU.

**Key Trade-offs:**

| Factor        | CPU FAISS                         | GPU FAISS                         |
| ------------- | --------------------------------- | --------------------------------- |
| Query Latency | Slower (depends on RAM bandwidth) | Fast (parallel execution)         |
| Index Types   | IVF, HNSW                         | Flat (brute-force), IVF           |
| Memory Usage  | Fits in system RAM                | Limited to GPU VRAM (often <24GB) |
| Cost          | Cheaper                           | Expensive GPUs required           |

GPU-based FAISS excels in large-scale brute-force searches but struggles with complex indexing methods like HNSW due to VRAM limitations.

### 3. Indexing Difficulties

Vector search requires **Approximate Nearest Neighbor (ANN)** indexing to speed up retrieval. Popular techniques include:

* **HNSW (Hierarchical Navigable Small World)**: Graph-based search, high recall but memory-heavy.
* **IVF (Inverted File Index)**: Clustered search, requires training on dataset.
* **PQ (Product Quantization)**: Compresses vectors to reduce memory footprint.

Each has trade-offs:

* **HNSW requires full index rebuilds** after major updates.
* **IVF struggles with dynamic data**, as centroids don’t adjust without retraining.
* **PQ reduces precision**, affecting search quality.

### 4. Storage vs. Querying: Not the Same

Many databases claim to “support embeddings,” but few offer **native vector search**.

* **PostgreSQL (pgvector) and SQLite (VSS)** provide SQL-like interfaces for embeddings but still rely on extensions.
* **MySQL, MongoDB, and Redis** store embeddings but don’t always offer **optimized similarity search**.

This distinction matters: If the database doesn’t support ANN natively, you may need to offload search to **Python (FAISS, Annoy)** or **C++ implementations**, adding architectural complexity.

### 5. Infrastructure Constraints

#### Memory Bandwidth & Scaling Issues

* **Vector search is memory-bound**: Even optimized FAISS queries often max out RAM bandwidth, limiting performance.
* **Sharding vectors across machines is complex**: Unlike traditional databases, vector DBs require distributed indexing.
* **Few databases offer true storage/compute separation**: Pinecone and Milvus are starting to offload storage to object stores, but most systems still require **fully in-memory indexes**.

#### Logging & Observability

Unlike SQL databases, vector search queries aren’t easily interpretable. **Debugging search results** is hard because raw embeddings lack human readability. To mitigate:

* **Store metadata alongside vectors** (e.g., text descriptions of embeddings).
* **Use embedding visualization tools** like **TensorBoard’s embedding projector**.
* **Log top-N retrieved items per query** to analyze search quality over time.

## Comparing Vector Database Solutions

| **Database**               | **Type**            | **Indexing Methods**    | **Max Dimensions**                   | **Storage/Compute Separation** | **Best Use Case**                       |
| -------------------------- | ------------------- | ----------------------- | ------------------------------------ | ------------------------------ | --------------------------------------- |
| **PostgreSQL (pgvector)**  | RDBMS Extension     | HNSW, IVFFlat           | \~2,000 (Postgres page size limit)   | No                             | Adding vector search to relational data |
| **SQLite (VSS Extension)** | Embedded SQL        | IVF, Flat               | Flexible (depends on implementation) | No                             | Lightweight, mobile/edge applications   |
| **Milvus**                 | Dedicated Vector DB | HNSW, IVF, DiskANN      | 32,768+                              | Yes                            | Large-scale, distributed search         |
| **Pinecone**               | Managed Cloud       | Proprietary (HNSW-like) | 20,000                               | Partial                        | Serverless, easy integration            |
| **Weaviate**               | GraphQL-based       | HNSW                    | 65,000+                              | Yes                            | Multi-modal search (text + images)      |

## Conclusion

Vector databases are powerful but introduce significant **scalability, memory, and indexing challenges**. When dealing with **multi-model embeddings**, engineers must carefully:

* Choose between **CPU vs. GPU** search based on cost/performance.
* Select an appropriate **indexing strategy** (HNSW, IVF, PQ).
* Understand that **storage ≠ query performance**—some databases store embeddings but don’t optimize retrieval.
* Consider **fine-tuning embeddings** to improve retrieval performance.

Despite these hurdles, innovations like **FAISS on GPUs, serverless vector DBs, and smarter ANN indexing** are making vector search more efficient. However, designing a robust, scalable retrieval system still requires deep architectural planning.
