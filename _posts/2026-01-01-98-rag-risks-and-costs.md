---
date: 2026-07-26
layout: article
title: "RAG Risks and Costs"
description: "A RAG pipeline sends your documents to a third party twice on every query, not once, and its bill scales with corpus size in a way most budgets never account for. A third risk, permission-blind retrieval, rarely gets named at all."
keywords: ["rag data privacy", "rag security risk", "rag cost", "embedding api cost", "private rag pipeline", "rag access control"]
topic: "AI Systems"
seo_title: "RAG Risks: Data Exposure, Cost, and Access Control Explained"
related:
  - 65-why-private-inference
  - 40-private-inference
  - 09-data-risks
  - 95-private-inference-costs
  - 64-marigold
  - 97-what-is-rag
---

# RAG Risks and Costs

Most discussion of RAG risk focuses on the generation call: the moment a model sees retrieved context and produces an answer. That framing misses half the pipeline. A standard RAG system sends data to a third party twice on every query, not once, and the second trip (embedding) tends to go unexamined. In total, RAG has risks of data exposure, cost, and governance.

## Exposure

Chunking a document and embedding it are treated as preprocessing, something that happens before the interesting part starts. But embedding a chunk means sending its text to a model, and if that model sits behind a commercial API, the chunk has already left your infrastructure before a single question has been asked. Do this for an entire document set, and every contract, every support ticket, every internal memo you have indexed has been transmitted to that provider once, at ingestion, regardless of whether anyone ever queries it.

When a user asks a question, the query gets embedded (a second transmission), the retrieved passages get assembled into a prompt, and that prompt, containing the material judged relevant to the question, is sent to a generation API (a third transmission). The generation call gets the scrutiny. The two embedding calls, which between them cover your entire corpus and every question anyone has ever asked it, usually get none.

This is the same structural point made in [Why Private Inference](/library/65-why-private-inference.html): sending data to a commercial API is, architecturally, indistinguishable from sending it to any other third-party processor, and the ICO's definition of a reportable breach covers data sent to a processor regardless of what that processor's policy says about retention. A RAG pipeline simply does this twice per query instead of once, and does it continuously, at ingestion, for a corpus that may contain material *never queried*.

This is the source of RAG data leakage: a system retrieving external documents can surface content nobody intended to expose. The embedding step is where content first leaves the building, not when it gets surfaced.

## Cost

RAG cost gets budgeted as a per-query number, and per-query numbers are the easier half of the bill to predict. The harder half sits at ingestion, and it scales with the size of the corpus, and how often it changes.

Every document chunked and embedded is a paid call to an embedding API. A corpus of ten thousand documents chunked into passages of a few hundred tokens produces a call volume in the hundreds of thousands before a question is asked. Re-index that corpus (maybe because source documents changed, or because a better embedding model shipped, or for any other reason) and the cost repeats in full. A team that budgets for query volume and treats ingestion as a one-off setup cost will find that re-indexing a growing, changing corpus is expensive.

At query time, the generation cost is driven by the size of the retrieved context, not the size of the question. A one-line question that retrieves ten passages of supporting material pays for those ten passages on every call, whether or not the model needed all of them to answer. This is the token-cost mechanics behind [Falling Token Prices](/library/80-falling-token-prices.html), applied to the specific shape of a RAG call: the context window is a cost decision made by your retrieval strategy, not the user's question.

## Governance

The third risk is most likely to be discovered by an incident rather than audit. A vector index built from a document set typically has no concept of who is allowed to see which document. The source system, a CRM, a document management platform, an internal wiki, usually does enforce permissions. The moment that content is chunked and embedded into a separate vector store, the permission model has to be rebuilt in the new system or it stops existing.

The failure mode is specific: a user asks a question, the retrieval step finds the most semantically relevant passage regardless of who wrote it or who it's about, and the generation step includes that passage in its answer. Nothing in a naive RAG pipeline checks whether the asking user was permitted to see that document. This has to be deliberately engineered against, by storing access metadata alongside each chunk and filtering at retrieval time (covered in [Filtered Vector Search](/library/33-vector-db-filters.html)).

## What this changes about the build

None of these three risks argues against RAG as an approach. They argue for treating the embedding step with the same scrutiny as the generation step, budgeting ingestion as a recurring cost tied to corpus size rather than a one-off, and building permission checks into retrieval from the start rather than discovering their absence later.

The exposure and cost points share a structural fix: running chunking, embedding, and generation on infrastructure you control removes the third party from both round trips. [Marigold](https://marigold.run) runs this stack on private, self-hosted infrastructure over your own data, so the ingestion cost is compute you already own and the query cost stops being a metered call to someone else's API.

(If you're weighing a RAG build against these three risks, [get in touch](/contact).)
