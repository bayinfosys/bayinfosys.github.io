---
layout: article
title: "Agent Alloys or Persona Leakage?"
description: "Context bleeds between agents in multi-agent systems. The XBOW experiment suggests that for exploratory tasks, this is a feature rather than a failure mode."
keywords: ["multi-agent", "llm agents", "persona leakage", "agent architecture", "ai systems"]
topic: "AI Systems"
last_modified_at: 2025-01-01
---

# Agent Alloys or Persona Leakage?

The standard architecture for multi-agent AI systems assumes that clean separation is the goal.
Each agent has a defined role, a system prompt that establishes its persona, and boundaries that prevent it from drifting into another agent's territory.
A planning agent plans. An execution agent executes. A creative agent generates. The coordinator stitches the outputs together.

This is a reasonable engineering instinct.
Separation of concerns is foundational to how we build software.
But in practice, context bleeds, and the bleeding is not always a problem to be fixed.

## How Leakage Happens

When agents in a multi-agent system communicate, they share context.
Agent B reads what Agent A produced. That output primes Agent B's generation -- not just informationally, but stylistically and structurally.
Agent A's framing of a problem shapes which solutions Agent B considers.
Agent A's tone seeps into Agent B's response. Agent A's assumptions become Agent B's starting point.

This happens because language models do not have a clean boundary between "reading" and "being influenced by."
The context window is the model's working memory, and everything in it exerts some pull on what comes next.
A carefully crafted system prompt establishing a distinct persona competes with everything the model has read in the conversation so far.
At sufficient context length, the conversation often wins.

Engineers working with multi-agent systems spend considerable effort managing this.
Memory partitioning, explicit handoff summaries, context truncation, reinforcement of system prompts at each turn.

## The XBOW Experiment

A research team at XBOW noticed something unexpected while building an automated vulnerability research system ([here](https://xbow.com/blog/alloy-agents)).
Rather than running separate agents with explicit handoffs, they tried maintaining a single conversation thread and alternating which model responded. Claude for some turns, Gemini for others.

Each model, reading the full thread, treated the entire conversation as its own work -- consistent with training on human text, where a single author owns the whole thread.
It did not know another model had contributed earlier turns.
It inherited the reasoning, the direction, and the implicit assumptions of whatever came before, and built on them as if they were its own.

The results were better than their cleanly separated architecture.
The models were not working in parallel and synthesising outputs.
They were, in effect, thinking together in sequence, each one pushing the problem forward from wherever the previous model had left it.
XBOW called this alloying -- different models blended into a single process, each contributing its particular strengths without the overhead of coordination.
This only works when the models are sufficiently different; alloying two variants of the same model produces little benefit.

## When Leakage Becomes a Feature

The insight is that leakage is not inherently a failure mode.
It is a failure mode when you need agents to maintain distinct, non-overlapping roles -- when the integrity of each agent's output depends on it not being influenced by the others.
It is a feature when you want models to build on each other's thinking without the friction of formal handoffs.

The distinction maps roughly onto the nature of the task.
Deterministic pipelines -- data extraction, classification, structured generation -- benefit from clean separation.
Each stage should do exactly its defined job and pass a clean output to the next stage. Ambiguity introduced by leakage is a defect.

Exploratory tasks are different. Vulnerability research, creative writing, open-ended analysis -- these require varied perspectives and unexpected combinations.
A model that picks up the thread from a different model and continues it from a slightly different angle is not corrupting the output.
It is contributing something the first model would not have reached alone.

## The Writers Room

Not all leakage is productive.

At Bay Information Systems we built [PopStory](https://popstory.co.uk) to experiment with early AI-generated content.
Part of this experiment built a writers room which maintained separate character agents -- each one responsible for different aspects of a generated story.
The agent goals would often leak into the story, and maintaining context separation was of crucial importance.
The clearest example was in multilingual generation where the target language (Spanish) is not the same as the agent prompt language, and also not the same as the image generation language (English).
Language leaking between the two caused failures: the Spanish phrase for "Black Horse" is "Caballo Negro", which triggered image generator guardrails and rejected the prompt.
Here, leakage was not collaboration. It was contamination.

## The Design Choice

Persona leakage is not always a bug to eliminate. The prior question is whether influence between agents is desirable at all.

For most production pipelines, the answer is no.
For exploratory and creative tasks, it is often yes -- and the coordination overhead saved by running a single thread rather than managing multiple isolated agents is a practical benefit on top of the qualitative one.

The cleaner framing of multi-agent architecture is not separation versus integration.
It is: at what point in the pipeline should the agents think together, and at what point do you need independence?
