---
date: 2026-07-26
layout: article
title: "Agent Frameworks and Harnesses"
description: "Framework, harness, and SDK get used interchangeably, and the field hasn't settled the vocabulary. A comparison of what LangGraph, CrewAI, the OpenAI Agents SDK, the Claude Agent SDK, and Claude Code actually are, and which of them ties you to one model."
keywords: ["agent frameworks compared", "langgraph vs crewai", "claude agent sdk", "openai agents sdk", "agent harness vs framework", "claude code agent", "multi-agent orchestration", "mcp agent framework"]
topic: "AI Systems"
seo_title: "Agent Frameworks vs Harnesses: LangGraph, CrewAI, Claude Agent SDK Compared"
related:
  - 54-runfox
  - 19-rag-strategy
  - 10-agent-memory
  - 101-what-are-agents
  - 103-agent-risks-costs
  - 104-agent-tasks
  - 105-agent-evaluation
---

# Agent Frameworks and Harnesses

Three words get used more or less interchangeably in agent discussions, and they describe genuinely different things. A **framework** gives you building blocks, an orchestration model, state management, tool-calling conventions, and you assemble the loop yourself. A **harness** owns the loop already: tools, approval gates, and context management come built in, tuned for a specific domain, and you drive it rather than construct it. An **SDK**, in the agent context, often means a harness exposed as a library, so you get the pre-built loop but call it from your own code instead of a CLI or an app. Which of these you want depends less on how capable each option is and more on how much of the loop you actually need to control yourself.

## Frameworks: you build the loop

**LangGraph** models an agent as a directed graph with conditional edges between nodes, and its main strength is what that graph structure buys you: built-in checkpointing, time-travel debugging (rewinding to an earlier state and re-running from there), and explicit control over every state transition. It's model-agnostic, working with Anthropic, OpenAI, Gemini, or local models without changing the orchestration code, which makes it the natural choice when a task needs genuinely complex, stateful control flow and the engineering time to build a graph is worth spending. MCP tools are integrated via adapters rather than natively.

**CrewAI** takes the opposite starting point: describe agents by role, goal, and backstory, and let the framework handle coordination between them. This role-based pattern is the fastest of the group to prototype in, reads closer to a team charter than to code, and has the largest community of the open-source options. MCP support is native rather than adapter-based, and it has added A2A (agent-to-agent) task delegation, which matters if agents built on different frameworks need to hand work to each other.

**The OpenAI Agents SDK** is the thinnest abstraction of the three: a small number of primitives, explicit handoffs between agents, and the fastest path from nothing to a working agent. It shipped OpenAI-first, and now reaches other model providers through a LiteLLM integration, though that path is newer and less proven than the model-agnostic design LangGraph and CrewAI were built with from the start.

**Google's Agent Development Kit (ADK)** is built around Gemini but supports other models, and its standout feature is native A2A support with auto-generated Agent Cards, making it the strongest option of the group for an architecture that genuinely needs agents from different vendors talking to each other rather than one team building everything in one framework.

**AG2** (the community continuation of AutoGen) and **Microsoft's Agent Framework** (which folded AutoGen and Semantic Kernel into one SDK) round out the enterprise end of the list, the latter specifically for teams already committed to the .NET and Azure ecosystem.

## Harnesses: the loop is already built

A harness is what you get when someone has already made the framework decisions above, for one specific domain, and shipped the result as a finished tool. **Claude Code**, OpenAI's **Codex**, and **Cursor**'s agent mode are the clearest examples: each owns the read-observe-act loop, ships with a fixed tool set (read a file, run a command, edit code), and manages its own approval gates for anything destructive, all tuned specifically for software engineering. Nothing here is being assembled by the person using it. The trade-off for that convenience is scope: a harness built for coding is a poor fit for a task outside that domain, in the way a framework's blank-canvas building blocks are not.

Anthropic's own documentation makes the relationship explicit: the **Claude Agent SDK** is described as being built directly on top of "the agent harness that powers Claude Code", exposing that same loop, tool set, and context management as a Python and TypeScript library rather than a CLI. That's the cleanest real-world example of the three-way distinction actually holding: Claude Code is the harness, the Claude Agent SDK is that harness's engine made programmable, and something like LangGraph is a genuine framework, since it makes none of Claude Code's domain-specific decisions for you and leaves the loop itself to be built.

## The comparison

| Tool | Category | Model dependency | MCP support | Best fit |
|---|---|---|---|---|
| LangGraph | Framework | Agnostic | Via adapters | Complex, stateful workflows needing checkpointing |
| CrewAI | Framework | Agnostic | Native | Fast multi-agent prototyping, role-based teams |
| OpenAI Agents SDK | Framework | OpenAI-first, others via LiteLLM | Native | Fastest path from zero to a working agent |
| Google ADK | Framework | Gemini-optimised, others supported | Native | Cross-vendor agent-to-agent workflows |
| Claude Agent SDK | SDK (harness as library) | Claude only | Deepest integration | Coding and computer-use agents, safety-sensitive tasks |
| Claude Code / Codex / Cursor | Harness | Locked to provider | Varies | Software engineering tasks, no orchestration build needed |
| runfox (Marigold) | Static-planning engine | Any, including local models | N/A (fixed workflow) | Predictable, self-hosted execution where cost and determinism matter more than runtime flexibility |

## What this changes about the decision

Model lock-in is the column worth reading first, because it's the one that determines how much of this decision you're making once versus repeatedly. The OpenAI Agents SDK and the Claude Agent SDK each tie the agent to their own provider's models by design, which is a reasonable trade when the harness's built-in tools (Claude Code's file and shell access, specifically) are the actual reason for choosing it. LangGraph, CrewAI, and AG2 keep that choice open, which matters if cost or capability differences between providers are likely to change which model you want to run against the same orchestration logic. runfox sits furthest from all of them: a fixed, static workflow engine rather than a dynamic agent loop, which trades runtime flexibility for a cost and behaviour profile that's fully known in advance, and one that runs entirely on infrastructure you control rather than a hosted framework calling out to someone else's API.

That cost and control trade-off, what an agent loop actually costs per task and who governs what it's allowed to do, is the subject of the next article in this series.

(If you're choosing between a framework, a harness, and a fixed workflow for a specific task, [get in touch](/contact.html).)
