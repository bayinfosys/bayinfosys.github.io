---
layout: article
title: "Context is a Build Step"
description: "Every approach to context generation -- from basic chunking to knowledge
compilation -- is an instance of the same pattern. The quality of the build step
determines what your agent can do at runtime."
keywords: ["rag", "context engineering", "vector database", "agentic ai",
"knowledge compilation", "llm", "retrieval", "chunking", "semantic search"]
topic: "AI Systems"
last_modified_at: 2026-05-05
related:
  - 46-labels-are-the-task
  - 20-vector-db-deepdive
  - 33-vector-db-filters
  - 19-rag-strategy
  - 25-llm-evaluation
  - 10-agent-memory
---

# Context is a Build Step

Long before RAG was a term, data engineers understood that the gap between
stored data and useful data had to be closed before the query arrived. You do
not run aggregations at read time if you can pre-aggregate at write time. In
software engineering this is cache construction: move the expensive work
upstream, pay it once, and serve the result repeatedly. Materialised views,
OLAP cubes, search index construction -- each is the same instinct in a
different register.

That pattern is now the central problem in AI system design.

## Semantic search is the foundation

The current conversation about "post-RAG" architectures tends to frame
semantic search as something to move beyond. This misreads the situation.
Semantic search -- embed a query, find the nearest vectors, retrieve the
results -- is a foundational operation and stays foundational regardless of
what surrounds it. What is changing is not the retrieval mechanism but the
assumption that retrieval alone is sufficient preparation.

A human querying a search engine and an agent querying a knowledge base are
both performing semantic lookup. The difference is scale and purpose: the
agent executes tasks, not explorations, and needs results it can act on
directly rather than results it can read and judge. The retrieval step is the
same. What must differ is everything built around it. (The indexing trade-offs
behind that retrieval step are covered in
[Why Are Vector Databases Difficult?](/library/20-vector-db-deepdive.html).)

## Context generation techniques

A range of context generation techniques are currently documented. They
differ in how much work they perform at build time, and understanding that
spectrum is more useful than treating them as distinct generations of
technology. (For a treatment of how these map to RAG system types and
tooling, see [RAG Strategy and Tooling](/library/19-rag-strategy.html).)

**Fixed-size chunking** splits a document by token count, optionally with
some overlap. It makes one decision at build time: chunk size. Simple to
implement; brittle when topic boundaries fall mid-chunk.

**Semantic chunking** adds a boundary-detection step, using embedding
similarity to identify where topics shift before deciding where to cut. The
chunk boundaries reflect content structure rather than character count.

**Hierarchical chunking** preserves parent-child relationships across
granularity levels -- the paragraph knows which section it belongs to, the
section knows which document. Retrieval can operate at the appropriate level
for a given query.

**Contextual enrichment** (as described by Anthropic) prepends a
chunk-specific summary to each chunk at ingestion time, giving the embedding
model context that a raw excerpt would lack.

**Late chunking** (Jina) embeds the full document first, then partitions the
resulting representations. Each chunk's embedding reflects the whole document
rather than the excerpt in isolation.

**Graph-based context** (GraphRAG, Zep/Graphiti) extracts entities and
relationships from source documents and stores them as a knowledge graph.
Retrieval traverses the graph rather than ranking vectors, which handles
multi-hop questions that semantic similarity search cannot.

**Knowledge compilation** (Pinecone Nexus, Karpathy's LLM Wiki) treats the
build step as a first-class engineering problem. Source documents are input;
the output is a structured, interlinked artefact -- a typed JSON object, a
synthesised wiki page -- purpose-built for a specific consumer. The agent
queries the compiled output, not the raw sources.

These are points on a spectrum defined by how much reasoning the build step
performs. At the low end, chunking; at the high end, artefact construction
that resolves contradictions, infers schema, and encodes relationships that
did not exist explicitly in the source material. The vector index is present
throughout. Semantic search runs at every level.

## What are the compilation steps?

Pinecone's technical description of their compiler names two functions:
`curate()`, which constructs the artefact, and `query()`, which handles
retrieval. Karpathy's LLM Wiki names three: `ingest()`, which processes
a new source into the wiki; `query()`, which retrieves from the compiled
result; and `lint()`, which health-checks the wiki for broken links, orphan
pages, stale claims, and contradictions introduced by newer sources.

The `curate()`/`ingest()` distinction is worth noting. Pinecone's compiler
iterates `curate()` against an eval set until the artefact schema converges;
Karpathy's `ingest()` runs once per source, producing wiki pages and
cross-references in a single pass. Both are build-step operations. The
difference is whether the build step knows what good looks like.

`query()` is everything at retrieval: how the request is expressed, what
filters apply, what shape the response takes. At the naive end this is a
vector similarity search returning a ranked list of text fragments. At the
structured end it is a typed request with a declared output schema, returning
a JSON object with field-level provenance. (How filters and ranking signals
interact with the underlying index is examined in
[Filtered Vector Search](/library/33-vector-db-filters.html).)

The two functions are coupled. A weak `curate()` constrains what `query()`
can return; a precisely specified `query()` creates pressure on `curate()` to
produce artefacts that satisfy it. The gap between them is where most of the
engineering cost in a RAG system lives, even when not named.

## The update cycle

`lint()` points at something missing from the compilation framing.
A build step that runs once is not a cache; it is a snapshot. Sources change,
new material arrives, earlier claims get superseded. A knowledge base without
a maintenance cycle degrades silently -- the compiled artefacts stay in place
while the ground truth they were built from moves.

This is not a new problem. Software build systems handle it through
incremental compilation, dependency graphs, and version control. A context
pipeline faces the same questions: which artefacts are downstream of a
changed source, which need recompilation, which are stale in ways that affect
live queries. Karpathy's `lint()` operation -- checking for broken links,
orphan pages, claims contradicted by newer sources -- is what a mature pipeline should handle.

Version control is the natural infrastructure here. If compiled artefacts are
files, they can be diffed, rolled back, and reviewed. Changes to source
documents can trigger selective recompilation of the artefacts that depend on
them. The build step becomes a build pipeline in the conventional software
engineering sense, with all the tooling that implies. (The memory persistence
problem for agents operating over these artefacts is covered in
[Memory in Agentic AI](/library/10-agent-memory.html).)

## The eval problem

The build step is more useful when we have a signal to iterate against.
A context compiler that rewrites `curate()` and re-runs on the same corpus
is doing data engineering -- and engineering requires measurement.

The Nexus architecture is explicit about this: each domain requires an eval
set, a collection of representative tasks with known-good answers. The
compiler iterates until the eval signal converges. Without that signal there
is no target, and the compilation process has no way to distinguish a better
artefact schema from a worse one.

Constructing domain evals is itself a significant task. A pipeline without a
task specification has no definition of success -- the eval set is that
specification, and assembling it requires understanding what the agent will be
asked to do and what a correct answer looks like. (This argument is developed
in full in [Task Specification is the Primary Artefact](/library/46-labels-are-the-task.html);
the measurement frameworks for evaluating retrieval quality are covered in
[LLM Evaluation Metrics](/library/25-llm-evaluation.html).)

(Bay Information Systems is building tooling in this direction: https://bayis.co.uk/marigold)

## The query interface

Knowledge query languages -- KnowQL being the current example -- are
structured JSON with a fixed vocabulary: declare intent, specify output
shape, set a token budget and confidence threshold. This is closer to a typed
API call than to natural language, and the narrowness is a feature. The
vocabulary is small enough that a small, specialised model could be trained
to translate task descriptions into well-formed queries, rather than routing
that work through a general-purpose LLM.

This aligns with an architecture common in production systems: a large
reasoning model handles planning and synthesis; smaller specialised models
handle structured sub-tasks. A retrieval model that reliably produces
correct, typed query requests from natural-language task descriptions is a
tractable training target.

## What this means in practice

The useful question for any system that retrieves from text is not "which RAG
variant should I use" but "what does my build step produce sufficient context?".
That depends on query frequency, source stability, the shape the consuming agent
requires, and whether the domain justifies the cost of an eval set.

For a one-off internal search tool, a well-configured chunker with hybrid
retrieval is probably sufficient. For a domain where agents run thousands of
queries against stable corporate data and need typed, auditable outputs, a
structured build step is justified and -- probably -- required.

The build step is where intelligence goes in. The query is where it comes
out. The maintenance cycle is what keeps the two in correspondence.
