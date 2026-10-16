---
date: 2026-07-26
layout: article
title: "Evaluating Agents"
description: "How to evaluate an AI agent: tool-call correctness, planning efficiency and task success, measured separately and in that order, then repeated to check it succeeds the same way twice (pass^k)."
keywords: ["agent evaluation", "tool calling accuracy", "task success rate", "GAIA benchmark", "SWE-bench", "tau-bench", "agent drift detection", "agent reliability"]
seo_title: "How to Evaluate an AI Agent: Metrics, Benchmarks, and Drift"
topic: "AI Systems"
related:
  - 25-llm-evaluation
  - 61-eval-datasets
  - 68-build-measurements
  - 44-static-vs-dynamic-planning
  - 101-what-are-agents
  - 102-agent-frameworks
  - 103-agent-risks-costs
  - 104-agent-tasks
---

# Evaluating Agents

A completed task and a correctly completed task look the same in a transcript, in the same way a fluent RAG answer can be ungrounded. So evaluation has to check each stage of the loop separately, in pipeline order, rather than trusting a single end-to-end success number.

## First, tool-call correctness

Before asking whether the task succeeded, check whether the agent called the right tool with the right arguments at each step. This is measured independently of final outcome, since an agent can call the correct tool with a malformed argument and still stumble into a working result by luck, or call the wrong tool first and still recover. The Berkeley Function-Calling Leaderboard is the standard reference for this specific measurement: function-calling accuracy in isolation, across languages and API styles, held apart from anything downstream. If this number is poor, nothing later in the loop can be trusted to mean what it appears to mean.

## Then, planning efficiency

With tool calls confirmed correct, measure whether the agent got to the answer efficiently or wandered there. Step count per completed task and cost per completed task are the two numbers that matter here, and they're rarely reported alongside success rate even though they should be read together: a benchmark score of 88% achieved at fifty dollars of inference per task is not the same result as 88% achieved at fifty cents, and most published agent benchmarks don't integrate cost into the headline number at all. This is the stage where the cost risk from the previous article in this series actually gets caught before the bill does, a plan that took thirty steps for a three-step task shows up here as a number, not as a mystery on the invoice.

## Then, task success rate, checked more than once

Finally, whether the task was actually completed correctly. GAIA measures this across general assistant tasks requiring multi-step reasoning and tool use; SWE-bench Verified measures it for coding agents specifically, against real GitHub issues where a patch has to make the failing tests pass without breaking the ones that already did; WebArena and OSWorld measure it for browser and desktop tasks; tau-bench (and its successor tau2-bench) adds a distinction worth adopting directly, scoring policy adherence separately from task completion, so an agent that resolves a request by violating a stated rule doesn't get full credit for succeeding.

The number worth checking that most teams skip: does the agent succeed the same way twice. Agent variance between runs on identical tasks is large enough that a single pass rate is close to meaningless on its own; reported pass^4 scores commonly run fifteen to twenty-five points below pass^1 on the same benchmark. A 90% single-run success rate can correspond to something closer to 70% reliability once the same task gets retried a handful of times, which is the situation a production system is actually in. Measure success rate across repeated runs of the same task, not once per task, or the number you report will be higher than the reliability you actually get.

## Getting the numbers

None of the benchmarks above substitutes for an eval set built from your own tasks, for the same reason a general RAG benchmark doesn't substitute for evaluating against your own corpus: GAIA and SWE-bench measure general capability, not whether your agent handles your tools, your data, and your failure modes correctly. Build a small task set from real cases (including ones the agent has previously got wrong) and run the three measurements above against it directly, using the general benchmarks as calibration for how a given model or framework performs before you commit to building against it.

One further limitation worth stating plainly: most agent benchmarks report a single end-to-end number and don't localise which stage of the pipeline a failure came from. That's precisely why the three measurements above are worth taking separately rather than trusting whatever single score a leaderboard reports, since a dropping success rate with unchanged tool-call correctness points somewhere different than a dropping success rate caused by tool calls going wrong.

## Drift detection in agents

None of the three measurements is a one-time gate. Two things drift independently of the model. A tool's underlying API changes its response format or its error codes, and calls that used to succeed start failing in a way the agent has no way to anticipate. A sub-agent's system prompt, or the tool set the harness exposes, stops matching what it was tuned against, and the agent's behaviour degrades in a way that looks exactly like the model getting worse, when nothing about the model has changed.

Re-run the three measurements on a fixed schedule, and specifically after any change to a tool's API, a harness version, or a framework upgrade, rather than only after a model change, since those are the more common source of a production agent quietly getting less reliable. When a metric drops, it points at a stage the same way it does for RAG: falling tool-call correctness means a tool's interface has changed underneath the agent; falling planning efficiency with unchanged tool-call correctness means the planning strategy itself has degraded; falling task success rate with the first two holding steady means the model or the final-step logic is where to look.

(If you're setting up this evaluation loop for an agent already in production, [get in touch](/contact.html).)
