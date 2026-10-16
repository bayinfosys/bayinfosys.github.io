---
date: 2026-07-26
layout: article
title: "Agent Frameworks and Harnesses"
seo_title: "Agent Frameworks Compared: LangGraph, CrewAI, OpenAI, Claude"
description: "Agent tools divide by who builds the loop. Frameworks leave it to you, harnesses ship it finished for one domain, and agent SDKs expose a harness as a library. LangGraph, CrewAI, the OpenAI Agents SDK, Google ADK, Microsoft Agent Framework and the Claude Agent SDK compared on that, on model choice and on crash recovery."
keywords: ["agent frameworks compared", "langgraph vs crewai", "openai agents sdk", "claude agent sdk", "google adk", "microsoft agent framework", "agent harness vs framework", "durable agents"]
topic: "AI Systems"
related:
  - 101-what-are-agents
  - 113-durable-execution
  - 112-dbos
  - 44-static-vs-dynamic-planning
  - 103-agent-risks-costs
  - 105-agent-evaluation
---

# Agent Frameworks and Harnesses

"Framework", "harness" and "SDK" are used almost interchangeably in writing about agents, and the tools they name differ in one respect that matters more than any feature list: who builds the loop.
An agent runs a loop (act, observe the result, choose the next action), as described in [What Are Agents](/library/101-what-are-agents.html).
A framework supplies the parts and you assemble the loop.
A harness ships the loop finished, with tools and approval gates tuned for one kind of work.
An agent SDK, in current usage, is usually a harness exposed as a library, so the finished loop is called from your own code.

We can sort the current tools by that question first, then by two more: which models each one allows, and what happens to a running task when the process dies.

## Frameworks: you build the loop

LangGraph models an agent as a graph of nodes joined by edges.
Conditional edges choose the next node at runtime and cycles are allowed, which is the shape an agent loop needs.
Its checkpointers save the graph's state to Postgres, SQLite or Redis, so an interrupted run can resume and an earlier state can be rewound and run again.
It works with any model provider, and it reaches MCP servers through an adapter package.

CrewAI describes agents by role, goal and backstory, and coordinates them as a crew.
The role descriptions read more like a team charter than a program, which makes it quick to sketch a multi-agent design.
It treats A2A (the agent-to-agent protocol) as a first-class way to delegate: an agent can hand a task to a remote A2A agent, and a CrewAI agent can serve A2A requests from elsewhere.

The OpenAI Agents SDK is deliberately small: agents, handoffs between them, guardrails, sessions and tracing, in Python and TypeScript.
It uses OpenAI's models by default.
Other providers connect through its LiteLLM extension or any endpoint compatible with the Chat Completions API, though its defaults (the Responses API, tracing to OpenAI's dashboard) lean towards OpenAI's platform.

Google's Agent Development Kit (ADK) is built around Gemini and supports other models, with A2A support for agents that need to call agents built elsewhere.

Microsoft Agent Framework succeeds both AutoGen and Semantic Kernel.
It was built by the same teams, reached version 1.0 in April 2026, and runs in Python and .NET, which suits teams already working in Microsoft's ecosystem.
AG2, a fork of AutoGen maintained by some of its original authors, continues the older AutoGen design.

## Harnesses: the loop is already built

Claude Code, OpenAI's Codex and Cursor's agent mode are harnesses for software engineering.
Each owns the loop, ships a fixed set of tools (read a file, run a command, edit code) and asks for approval before anything destructive.
The person using one directs it and assembles nothing.
Its tools and prompts assume a code repository, which limits how far it transfers to other work.

The Claude Agent SDK shows how the categories relate.
Anthropic describes it as built on the harness that powers Claude Code, and it exposes that loop, tool set and context management as a Python and TypeScript library (it was previously called the Claude Code SDK).
Claude Code is the harness, the Agent SDK makes the same harness programmable, and LangGraph is a framework because it makes none of those decisions for you.

## Model choice

The second question decides how often the first decision has to be revisited.
LangGraph, CrewAI and AG2 leave the model open, so the orchestration code survives a change of provider.
The OpenAI Agents SDK and Google ADK favour their own provider's models and accept others.
The Claude Agent SDK and Claude Code run Claude models only, Codex defaults to OpenAI's models, and Cursor offers models from several providers.
(Model support changes often, so check each tool's current documentation before committing to it.)

| Tool | Category | Models | Notes |
|---|---|---|---|
| LangGraph | Framework | Any provider | Graph with cycles; checkpointed state |
| CrewAI | Framework | Any provider | Role-based agents; A2A delegation |
| OpenAI Agents SDK | Framework | OpenAI by default; others via LiteLLM or compatible endpoints | Small set of primitives; handoffs |
| Google ADK | Framework | Gemini by default; others supported | A2A support |
| Microsoft Agent Framework | Framework | Azure OpenAI, OpenAI and others | Python and .NET; successor to AutoGen and Semantic Kernel |
| Claude Agent SDK | Harness as a library | Claude only | Claude Code's loop and tools |
| Claude Code, Codex, Cursor | Harness | Claude only; OpenAI by default; several providers | Software engineering |

## Crash recovery

None of these categories settles what happens when the process running the loop dies halfway through a task.
An agent task can run for minutes or wait days for a human approval, and a restart in that window either loses the task or repeats work already paid for, sometimes work with side effects such as a sent email.

LangGraph's checkpointer covers part of this.
It resumes from the start of the node that was interrupted, so a node that made three model calls and failed on the third repeats all three.
Durable execution libraries record each step as it completes and replay the work from that record ([Durable Execution vs Workflow Orchestration](/library/113-durable-execution.html) compares the approaches).
DBOS stores the record as rows in Postgres and packages the pattern for several agent tools, including the OpenAI Agents SDK, Pydantic AI, LlamaIndex and Google ADK, turning each model request and tool call into a recorded step ([What Is DBOS?](/library/112-dbos.html)).
Temporal gives the same guarantee through a separate service.

Where the sequence of steps is known before the task starts, a declared workflow removes the agent loop altogether.
runfox (our own library) runs workflows declared in YAML and keeps one record per run, so cost and behaviour are fixed when the workflow is written.
[Static vs Dynamic Planning](/library/44-static-vs-dynamic-planning.html) covers when that suits.
(If you are choosing between a framework, a harness and a fixed workflow for a specific task, [get in touch](/contact.html).)

## Choosing

The three questions apply in order.
How much of the loop you need to control decides the category: a harness when its domain matches the task, a framework when it does not.
How open the choice of model must stay narrows the frameworks.
Where progress is recorded decides what sits underneath, and for anything long-running or with side effects that means a checkpointer or a durable execution layer beneath the framework.
