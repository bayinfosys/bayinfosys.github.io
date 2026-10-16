---
date: 2026-10-16
layout: article
title: "Evaluating Agents"
seo_title: "How to Evaluate an AI Agent: Task Sets, Traces and Repeated Runs"
description: "How to evaluate an AI agent on your own tasks: tool-call correctness, planning efficiency and outcome, measured separately and in that order, then repeated to check it succeeds the same way twice."
keywords: ["how to evaluate an ai agent", "agent evaluation", "tool calling accuracy", "agent task success rate", "pass^k", "llm as judge", "agent reliability", "agent drift"]
topic: "AI Systems"
related:
  - 100-rag-evaluation
  - 61-eval-datasets
  - 68-build-measurements
  - 109-instrumentation
  - 112-dbos
  - 103-agent-risks-costs
  - 102-agent-frameworks
---

# Evaluating Agents

A transcript of an agent that completed a task and one that completed it correctly can look the same, in the way a fluent RAG answer can be ungrounded ([Evaluating RAG](/library/100-rag-evaluation.html)).
An agent's output is a sequence of actions, and each can be right or wrong independently of the final answer.
Evaluation therefore follows the loop: each stage measured on its own, in the order the agent runs them, on tasks taken from your own work, and repeated.

We can set out the method in five parts: the task set, the trace, three measurements, repetition, and when to run it again.

## The task set

Public benchmarks measure general capability on someone else's tools.
The evaluation that predicts behaviour in production uses your tasks, your tools and your failure cases.
A few dozen tasks will find the large faults, and the set grows as production supplies new cases.

Each task needs three things written down before the agent runs it: the request as a user would phrase it, the end state that counts as success, and any rules the agent must respect on the way.
The end state carries the most weight.
tau-bench, a benchmark for customer-service agents, judges a run by comparing the database after the conversation with an annotated goal state, which tests what the agent did and ignores how well it described it.
The same check works on a private set: the order is cancelled, the ticket carries the right label, the patch fixes the failing test and the existing tests still pass.

Include tasks the agent should refuse or escalate (a request that breaks a stated policy, a change it has no permission to make) and tasks it has got wrong before.
These test the governance problems in [Agent Risks, Costs, and Governance](/library/103-agent-risks-costs.html), which a set of ordinary requests never reaches.

## The trace

Every measurement reads from a record of the run: each tool call with its arguments and result, each model call with its token count, the order they happened in, and the final state.
[Instrumentation Is the Deliverable](/library/109-instrumentation.html) argues that this record is worth building for its own sake.
A durable execution layer produces most of it as a side effect.
DBOS, for example, stores each workflow's inputs and every step's output as rows in Postgres ([What Is DBOS?](/library/112-dbos.html)), so the evaluation queries the same tables the recovery mechanism uses.
(If you are building this record for an agent already in production, [get in touch](/contact.html).)

## Three measurements, in order

**Tool-call correctness.**
For each call, check that the agent chose the right tool and passed valid arguments.
Most of this is mechanical: arguments validate against the tool's schema, identifiers refer to records that exist, and values fall within documented ranges.
Where a task has one correct sequence of calls, compare the trace with it; where several sequences are acceptable, check each call against rules instead.
The Berkeley Function-Calling Leaderboard measures this stage across models, which helps choose a model before building and says nothing about your own tools.

**Planning efficiency.**
For completed tasks, count steps and cost, and compare each with a budget set per task.
A task that should take three steps and takes thirty shows up here as a number before it shows up on an invoice.
Read these beside the success rate, since a higher success rate bought with ten times the steps is a different result.

**Outcome.**
Compare the final state with the expected end state, and check the rules separately: an agent that completes a refund by skipping a required approval has failed the task.
Use code to check anything code can check.
Use a model as judge only for outputs it cannot (the quality of a written summary, for instance), and test the judge against a sample of human labels before relying on it ([How to Evaluate an AI Pipeline](/library/61-eval-datasets.html)).

The order serves diagnosis.
A fall in outcome while tool calls stay correct points at planning or at the model's final step.
A fall in tool-call correctness most often means something changed in a tool (its schema, its error codes, its data), and the later measurements inherit the fault.

## Repetition

An agent given the same task twice can take different paths to different results, so one run per task overstates reliability.
Run each task several times and report two numbers: the share of individual runs that succeed, and the share of tasks that succeed on every run.
tau-bench introduced the second as pass^k, for k runs.
The gap between the two numbers measures inconsistency, and a production system lives with that gap, because every real request is another draw.
(If runs were independent, a 90 per cent success rate per run would give 0.9 to the power 4, about 66 per cent, for four successes in a row.)

Repetition also separates change from noise.
A difference between two model versions smaller than the spread between runs of one version is not yet a finding.

## When to run it again

Run the full set whenever anything in the loop changes: the model, a tool's API, the harness or framework version, the system prompt, or the set of tools exposed to the agent.
Tool and harness changes cause drops in reliability without any change to the model, and they arrive more often than model releases.
Between changes, a scheduled run on a fixed sample catches external tools that changed without notice.
The task set, the trace and the three measurements stay the same each time, which is what makes one run comparable with the last.
