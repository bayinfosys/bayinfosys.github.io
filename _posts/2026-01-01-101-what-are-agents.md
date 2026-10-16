---
date: 2026-07-26
layout: article
title: "What Are Agents"
description: "An agent differs from a pipeline in one respect: it decides the next step at runtime instead of following one fixed in advance. That decision is expensive, so the question worth asking first is when it earns its cost."
keywords: ["what is an ai agent", "agentic ai vs automation", "when to use ai agents", "is claude code an agent", "agent vs pipeline", "static vs dynamic planning"]
topic: "AI Systems"
seo_title: "What Are AI Agents For? A Framework for When to Use Them"
related:
  - 29-platforms-vs-pipelines
  - 23-business-goals
  - 10-agent-memory
  - 102-agent-frameworks
  - 103-agent-risks-costs
  - 104-agent-tasks
  - 105-agent-evaluation
---

# What Are Agents

A pipeline runs a fixed sequence of steps decided in advance. An agent runs a loop: take an action, observe the result, decide the next action based on what was just observed. That loop is what "agentic" actually refers to, and it is also the source of everything that makes agents slower and more expensive than a pipeline doing an equivalent task. Each decision point is a model call, each model call can go wrong in a way a hard-coded step cannot, and the total cost of a task is no longer fixed at design time, it depends on how many loops the agent takes to get there. The question worth answering before building one is not whether agents are the more capable technology. It's whether the task actually has a next step that can't be decided in advance.

## The test: is the next step known before you start

A fixed pipeline works when the sequence of steps is the same regardless of what the data contains: extract these three fields, validate against this schema, write to this table. Nothing about step two depends on what step one actually found, beyond straightforward pass/fail branching, which a pipeline handles perfectly well without needing a model to decide anything.

An agent earns its cost when the next step genuinely depends on what was just discovered, and that dependency can't be reduced to a small number of predictable branches. Investigating why a deployment failed is a reasonable example: the first thing checked determines what gets checked second, and that chain isn't the same twice. Answering a question against a document set where the right passage to check next depends on what the first passage said is another. In both cases, writing out every possible path in advance is either impossible or produces a decision tree large enough that a model choosing at runtime is simpler to build and maintain than the tree would have been.

The failure worth naming directly: reaching for an agent because the task is complicated, rather than because the next step is genuinely undetermined. A complicated task with a knowable sequence of steps is still better served by a pipeline, however many steps it has, because every one of those steps runs the same way every time and costs the same every time. An agent applied to that task adds a decision point at every step that didn't need one, and each of those decision points is a place the task can go wrong that a pipeline's equivalent step cannot.

## What this looks like as a spectrum, not a binary

Few real systems sit at either extreme. A pipeline with one conditional branch, retry once on failure, otherwise proceed, is barely more dynamic than a pure sequence and doesn't need agent framing to justify it. A system that decides its entire approach fresh on every task, with no fixed steps at all, is rare in production because it's also the hardest to test, monitor, and debug: if the sequence of steps is different every run, there's no fixed thing to write a test against.

The useful middle ground, and where most production agentic systems actually sit, is a fixed outer structure with a dynamic step or two inside it: a pipeline that runs known validation and formatting steps, then hands off to an agent specifically for the part where the next action genuinely can't be predetermined, then returns to fixed steps for logging and delivery. This is worth treating as the default design question rather than "agent or pipeline": which specific steps in this task are undetermined until runtime, and how much of the rest can stay fixed around them.

## Is Claude Code an agent

Yes. A coding agent takes an action (read a file, run a test, edit a line), observes the result, and decides the next action based on what it found. That's the same loop described above, applied to one domain. What makes it feel different from a general-purpose agent you'd build yourself is that the loop, the tool set, and the approval gates all come pre-built and tuned specifically for software work. That pre-built, purpose-tuned wrapper around the loop is what gets called a harness, as distinct from a framework you'd use to build the loop yourself from scratch. The distinction between the two, and what it actually changes about cost, model choice, and governance, is the subject of the next article in this series.

(If you're weighing whether a task needs an agent or a well-built pipeline, [get in touch](/contact.html).)
