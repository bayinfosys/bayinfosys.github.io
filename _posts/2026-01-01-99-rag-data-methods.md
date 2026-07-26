---
date: 2026-07-26
layout: article
title: "Data Methods for RAG"
description: "Chunking is one point on a spectrum of methods for preparing data for retrieval, not the whole spectrum. A working enumeration, from fixed-size splitting through knowledge graphs to retrieving directly from document images."
keywords: ["rag chunking strategies", "semantic chunking", "contextual retrieval", "late chunking", "graphrag", "image rag", "colpali", "multimodal rag", "document embedding methods"]
topic: "AI Systems"
seo_title: "RAG Data Methods: Chunking, Enrichment, and Image Retrieval Explained"
related:
  - 97-what-is-rag
  - 19-rag-strategy
  - 98-rag-risks-and-costs
  - 62-context-compilation
  - 20-vector-db-deepdive
---

# Data Methods for RAG

Every RAG system makes the same underlying decision, however it is dressed up: what goes into the thing that gets embedded. Chunking is the name usually given to this decision, but it undersells the range of options available. The methods below sit on a spectrum from "split the text by character count" through to "extract a knowledge graph" and "embed the page as an image rather than reading it as text", and the right point on that spectrum depends on what your source documents look like and what kind of question you expect to be asked.

## Text-based methods

**Fixed-size chunking** splits a document by token count, usually with some overlap between consecutive chunks so a sentence spanning a boundary isn't lost entirely to one side of it. It makes exactly one decision (chunk size) and is simple enough to implement in an afternoon. Its failure mode is equally simple: a topic boundary falling in the middle of a chunk produces two half-formed passages instead of one coherent one, and there is no mechanism in the method itself that would notice.

**Semantic chunking** adds a boundary-detection step ahead of the split. Embedding similarity between adjacent sentences or paragraphs identifies where the topic actually shifts, and the chunk boundary is placed there instead of at a fixed character count. The chunks that result reflect the structure of the content rather than an arbitrary token limit, at the cost of an extra embedding pass over the document before the real indexing begins.

**Hierarchical chunking** keeps the parent-child relationship between a passage and the section it belongs to, rather than treating every chunk as an independent unit. A paragraph retrieved on its own can retain a pointer to its section and document, and retrieval can operate at whichever granularity a given query needs: a single paragraph for a narrow factual question, the whole section for something that needs surrounding context to make sense.

**Contextual enrichment**, the technique Anthropic has published under this name, prepends a short chunk-specific summary to each chunk before it is embedded. A chunk that reads, in isolation, as "the fee increases by 3% in the second year" gains a prepended line naming which contract, which clause, and which party it refers to, giving the embedding model information a raw excerpt would not otherwise carry.

**Late chunking**, the approach associated with Jina, reverses the usual order of operations. The full document is embedded first, as a whole, and only then partitioned into the representations that get indexed as individual chunks. Each chunk's embedding reflects the meaning of the entire document it came from, rather than being computed from the excerpt in isolation, which matters for passages whose meaning depends on something stated earlier in the document and never repeated.

## Beyond flat chunks

**Graph-based context**, the pattern behind GraphRAG and tools like Zep's Graphiti, extracts entities and the relationships between them from source documents and stores the result as a knowledge graph rather than a flat list of embedded passages. Retrieval traverses the graph instead of ranking vectors by distance, which handles multi-hop questions (ones where the answer requires connecting two facts that never appear in the same passage) in a way that similarity search on flat chunks structurally cannot.

**Knowledge compilation** treats the build step itself as the engineering problem, rather than a preprocessing chore ahead of the real work. Source documents go in; the output is a structured, purpose-built artefact (a typed object, a synthesised reference page) rather than a set of retrievable excerpts. This is a large enough idea to deserve its own treatment, covered in full in [Context Is a Build Step](/library/62-context-compilation.html), including the maintenance problem that comes with it: a compiled artefact goes stale the moment its source changes, in exactly the way a flat chunk index does, and needs the same kind of update cycle.

**Structured extraction** covers the case where some or all of your source material is not prose at all but a relational database. [SQL Schema Documentation for RAG Pipelines](/library/27-schema-docs.html) covers this in detail: exposing table relationships, constraints, and business logic in a form a model can use to generate correct queries, rather than forcing structured data through the same chunk-and-embed pipeline built for prose.

## Image RAG: two different answers to the same question

Document sets that are heavy on tables, diagrams, scanned contracts, or forms raise a question none of the text-based methods above answer well: what happens to a document whose meaning depends on layout, not just words. Two genuinely different architectures have emerged to handle this, and they fail differently.

The established pattern runs OCR (or a captioning model, for diagrams and images) over the document first, then embeds the resulting text through the same pipeline as everything else. This is the path of least resistance, since it reuses the whole text-based stack, but it discards information at the OCR step that never comes back. A table's column alignment, a form's field layout, a diagram's spatial relationships: all of this is flattened into a text string, and whatever the OCR engine misread or restructured is now baked into the chunk with no way to recover the original.

The newer alternative, exemplified by models like ColPali and ColQwen, embeds the document page directly as an image, skipping the text-extraction step entirely. A late-interaction architecture (borrowed from the ColBERT line of retrieval models) compares the query against patches of the rendered page rather than against a single pooled vector, which lets the model attend to visual structure, a table, a stamp, a diagram's layout, that OCR would have discarded. The cost is a less mature tooling ecosystem than text embedding enjoys, larger per-page storage than a text chunk of equivalent content, and indexing infrastructure that has to support image-native retrieval rather than the vector stores built primarily for text.

The choice between them is not really about which is more advanced. It's about which failure mode you can tolerate: a text pipeline that loses layout information at ingestion and never tells you, or an image pipeline that retains it at a real cost in storage and tooling maturity. For a document set that is genuinely prose (contracts, policies, correspondence) OCR-then-embed loses very little and the mature tooling wins outright. For a document set where the table structure or the form layout carries part of the meaning, that loss is exactly the part of the document the question is likely to be about.

## Matching method to corpus

None of these methods is a strict upgrade over the one before it; each solves a specific failure mode at a specific cost. A team with clean, prose-heavy documents and stable content gains little from graph extraction or late chunking and should start with fixed-size or semantic chunking. A team whose questions genuinely require connecting facts across documents needs the graph. A team whose source material is scanned forms and tables needs to have the OCR-versus-image conversation before writing a single line of chunking code, because that decision is much harder to reverse once a corpus has been indexed one way.

(If you're working out which of these methods fits a specific document set, [get in touch](/contact).)
