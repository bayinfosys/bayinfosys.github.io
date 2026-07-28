---
date: 2026-05-27
last_modified_at: 2026-07-26
layout: article
title: "Memory in Agentic AI"
description: "The types of memory available to an AI agent, how they
work, when each is appropriate, and what breaks when the wrong type
is used or the memory layer is absent. Includes a survey of named
systems: A-MEM, Karpathy's LLM Wiki, Letta, Zep, Mem0, and Cognee."
keywords: ["agentic ai", "agent memory", "llm agents", "context window",
"vector memory", "agentic memory", "ai agent memory architecture",
"agent memory systems", "llm agent memory", "role of memory in agentic ai",
"a-mem agentic memory for llm agents", "karpathy llm wiki",
"agentic ai memory management"]
topic: "AI Systems"
seo_title: "Memory in Agentic AI: Types, Storage, and Failure Modes"
related:
  - 19-rag-strategy
  - 43-agent-alloys
  - 44-static-vs-dynamic-planning
  - 62-context-compilation
redirect_from:
  - /10-agent-memory/
  - /10-agent-memory/index.html
---

# Memory in Agentic AI

An AI agent differs from a stateless model call in one specific way: it accumulates state.
It takes an action, observes a result, and that result shapes what it does next.
Memory is the mechanism that makes accumulation possible.
Without it, each call starts from the same place and the system has no continuity across interactions, sessions, or tasks.

There are four timescales at which memory operates in agentic systems, each requiring different storage and retrieval approaches: within a
single call (context and caching), within a session (coherence and
state), across sessions with a user (intent understanding and
refinement), and across all users (agent behaviour and self-improvement).
The design patterns below map onto these timescales.

## Per-Agent Memory (Long-Term Memory)

Persistent across all interactions, per-agent memory stores what the
agent knows about its users and domain over time.

- **Scope:** Persistent across all interactions with the agent.
- **Storage:** PostgreSQL, Redis, or vector databases (Pinecone,
  Weaviate, FAISS).
- **Purpose:** Stores knowledge, user preferences, and interaction
  history. Enables personalisation and long-term adaptability.
- **Example data:** User profiles, past queries and interests,
  historical interaction summaries, evolving decision-making heuristics.
- **Extracted signals:** Behavioural trends, recurring request themes,
  personalised recommendations.

**Failure mode:** An agent without long-term memory treats every
interaction as a first meeting. It cannot personalise, cannot build
on previous sessions, and cannot refine its behaviour over time.
The symptom is an agent that feels stateless to the user regardless
of how many previous conversations have occurred.

## Per-Interaction Memory (Session Memory)

Scoped to a single conversation or task run, session memory maintains
coherence within an exchange.

- **Scope:** Limited to a single user session or chat interaction.
- **Storage:** In-memory stores (Redis, SQLite, session-based key-value
  storage).
- **Purpose:** Maintains short-term context within an ongoing
  conversation. Prevents repetition and mid-session inconsistency.
- **Example data:** Recent message history with timestamps, contextual
  references to earlier in the conversation.
- **Extracted signals:** Sentiment and intent trends within a session,
  anomalies in conversation flow, engagement patterns.

**Failure mode:** Without session memory, the agent contradicts itself
mid-conversation or asks for information it was already given. In
multi-step tasks, it loses the thread and requires the user to repeat
context. This is the most visible failure mode to end users and the
most commonly misattributed to model quality.

## Per-Task Memory (Workflow or Process Memory)

Specific to an ongoing task or multi-step process, task memory tracks
what has been done and what remains.

- **Scope:** Specific to an ongoing task, goal, or multi-step process.
- **Storage:** Graph databases (Neo4j), workflow engines, task-specific
  logs.
- **Purpose:** Tracks workflow progress. Ensures consistency in
  decision-making across steps. Allows the agent to resume without
  restarting.
- **Example data:** Completed and pending steps, intermediate outputs
  and dependencies, task-specific parameters and constraints.
- **Extracted signals:** Workflow bottlenecks and inefficiencies,
  task success and failure analysis, adaptive completion strategies.

**Failure mode:** An agent without task memory repeats steps it has
already completed. In pipelines with side effects -- database writes,
sent messages, external API calls -- this is not merely inefficient.
Repeated writes corrupt data; repeated messages create duplicates.
The failure is often silent: the agent does not know it has repeated
the step, so it does not report an error.

## Per-Experience Memory (Episodic Memory)

Episodic memory captures meaningful episodes across multiple
interactions, distinct from general long-term knowledge.

- **Scope:** Captures significant episodes across multiple interactions.
- **Storage:** Vector databases for embeddings, knowledge graphs.
- **Purpose:** Captures key learnings from distinct experiences.
  Provides context-aware decision-making by recalling specific past
  encounters. Facilitates adaptation without retraining.
- **Example data:** Summarised takeaways from past interactions, key
  entities, intents, and outcomes.
- **Extracted signals:** Longitudinal behaviour patterns, knowledge
  gaps requiring further training.

**Failure mode:** Without episodic memory, the agent cannot recall
specific past events in context -- "what happened last time we
processed this type of document", or "how did this user respond when
we suggested X". Long-term memory holds general patterns; episodic
memory holds specific instances. The absence of the latter produces
an agent that knows general things but cannot reason about its own
history of particular cases.

## Named systems

The five categories above describe what memory needs to do. They say little about how a given system actually does it, and the current landscape sorts into a small number of real strategies, most of them descending from one paper: Park et al.'s Generative Agents (2023), which introduced a chronological memory stream retrieved by a weighted combination of recency, importance, and relevance. Most systems below are a variation on that idea rather than a departure from it.

**Vector-first, drop-in.** Mem0 and LangMem store memories as embeddings and retrieve by similarity, the same mechanism as naive RAG applied to an agent's own history. This is the simplest strategy to reason about and the easiest to add to an existing agent, and it inherits vector search's usual weakness: a query phrased differently from the stored memory can miss it entirely.

**Temporal knowledge graphs.** Zep, built on its Graphiti engine, stores facts as a graph with time attached, so it can answer not just what happened but what used to be true and when it stopped being true. This matters specifically for episodic memory in domains where facts change: a customer's plan tier, a project's status, a policy's current version. A pure vector store has no native way to represent that a fact has been superseded; a temporal graph does.

**OS-inspired, self-editing.** Letta (formerly MemGPT) treats the context window as RAM and everything else as disk. A small core memory block stays always in context and the agent edits it directly; a larger archival store gets paged in and out on the agent's own initiative. The distinguishing feature is that the agent manages its own memory hierarchy, rather than a fixed pipeline deciding on its behalf what gets kept in view.

**Compile, don't just retrieve.** Two systems reject the retrieval framing outright, and both are worth understanding on their own terms because they answer the Search Console queries that led to this update. A-MEM organises memories as Zettelkasten-style notes: each new entry can trigger re-linking of existing entries, so the memory structure evolves as new information arrives rather than being filed once and left alone. Karpathy's LLM Wiki takes a related but distinct approach: raw sources stay immutable, an LLM maintains a linked markdown wiki derived from them, and a periodic lint pass checks the wiki for gaps and stale entries. The core claim behind both is the same one made in [Context Is a Build Step](/library/62-context-compilation.html): memory should be synthesised once and then maintained, not re-derived from scratch on every query. Where they differ is what gets maintained. A-MEM organises discrete memory notes; the LLM Wiki compiles an entire knowledge base, with human-legible files a person can read and edit directly, which is the more direct fit for the per-agent, long-term memory category above.

**Local-first, graph reasoning.** Cognee applies knowledge-graph memory in a deployment aimed specifically at privacy-critical, self-hosted use, which makes it the clearest example of what a private memory layer looks like in practice: the graph, the extraction pipeline, and the storage all running on infrastructure you control rather than a managed API.

None of this changes which of the five memory types a given task needs. It changes which tool actually implements that type well, and the choice between them tends to come down to one question: does the task need to reason about how a fact changed over time (reach for a temporal graph), does it need the agent editing its own memory as it works (reach for the OS-inspired model), or is a maintained, human-readable knowledge base the actual deliverable (reach for a compiled wiki rather than a retrieval index).

## A note on memory quality

The things an agent writes to memory may be wrong. Text entering a
memory store rarely enters raw -- it passes through extraction steps
first. Named entity recognition identifies people and organisations.
Fact extraction isolates claims. Summarisation compresses long
exchanges. Each step introduces error: an NER model misidentifies a
job title as a person's name; a summariser drops a qualifying clause
that changes a decision's meaning; a fact extractor mishandles a
negation.

The result is that agent memory is non-deterministic and difficult to
test in the way that a function or API call is testable. A unit test
can verify that a given input produces the correct output from the
language model. It cannot easily verify that the memory written from
a session is accurate, because the extraction pipeline has its own
error rate that varies with content. Human review of extracted facts
before committing to long-term memory is the most reliable mitigation
where accuracy matters. Versioned memory records with confidence scores
and provenance references allow downstream retrieval to filter
uncertain facts, though neither approach eliminates the problem.

This is precisely the failure mode A-MEM's re-linking and the LLM Wiki's lint pass are designed to catch: a periodic check of the memory structure itself, rather than trusting that whatever was extracted at write time stays correct indefinitely.

## Memory and learning

Memory does not mean learning in the machine learning sense. In
agentic systems, learning operates through four distinct mechanisms:

- **Pattern extraction** -- the agent derives insights from stored
  memories across interactions.
- **Reinforcement** -- feedback loops, human-in-the-loop or automated,
  adjust responses over time.
- **Fine-tuning and updates** -- new knowledge incorporated into the
  base model weights directly.
- **Symbolic and hybrid reasoning** -- structured reasoning combined
  with memory stores for tasks requiring explicit logic.

These mechanisms operate at different timescales and with different
costs. Pattern extraction and reinforcement work continuously against
the memory layer. Fine-tuning is periodic and expensive. Hybrid
reasoning is task-specific. A well-designed agentic system makes these
distinctions explicit rather than conflating memory accumulation with
model improvement.

## What memory makes possible

The structured memory design allows agents to balance short-term
contextual awareness with long-term continuity. The practical gains
are in personalisation, workflow reliability, and the accumulation of
domain knowledge over time -- capabilities that do not require model
retraining and are instead a function of what the memory layer holds
and how well it is maintained.

The design question for any agentic system is which memory types the
use case actually requires, at which timescales, and what extraction
accuracy those memory layers need to support. Start from the failure
modes. They identify the gaps.

---

(Bay Information Systems designs and builds agentic systems for
production deployment. If you are working through these architecture
decisions, [get in touch](/contact).)
