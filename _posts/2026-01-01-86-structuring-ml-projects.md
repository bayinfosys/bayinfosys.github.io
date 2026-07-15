---
date: 2026-07-15
layout: article
title: "How to Structure an ML Project"
seo_title: "How to Structure an ML Project: Phases and Sequencing"
description: "ML projects open with a sequential setup phase before iteration
can begin. What that phase involves, why it does not compress, and how the
four project phases fit together."
keywords: ["ml project structure", "ml project management", "ml project phases",
"machine learning vs software engineering", "software engineering for machine
learning", "ml in software engineering", "feasibility study machine learning",
"data audit"]
topic: "Product & Strategy"
related:
  - 18-mle-vs-swe
  - 17-data-maturity
  - 04-cost-of-ml
  - 14-5-mistakes-to-avoid
---

# How to Structure an ML Project

An ML project is usually described in one of two ways. Either as a software
project with a different tech stack or as an open-ended research process.
Neither framing gives a team a workable structure to plan against.
In practice an ML project has a sequential setup phase, an iterative development phase, and an ongoing maintenance phase.

## Setup

After a proposal which identifies the business case, the must be a data audit to verify the availability of quality of data against the requirements.
Pipelines should be identified to move this data around as needed.
Labelling strategy and annotation tooling need to be decided, where labelling is part of the work.
Training and evaluation infrastructure needs to be built, so that results are repeatable and reproducable.

This phase is sequential in the way software's discovery phase is not.
A SW team can start building a feature with an incomplete spec and correct course as understanding improves.
An ML team cannot start training a model on data whose quality and availability are still unconfirmed, because every experiment run against that data inherits the uncertainty.
Results produced before the setup phase is complete cannot be trusted, and time spent on them is not progress, it is exploration.
The setup phase is not a failure of agile discipline.
Treating it as compressible is the single most common reason ML timelines slip.

For a fuller treatment of what "data availability and quality" actually means in practice, see [data maturity](/library/17-data-maturity.html).

## Iteration

Once the data and infrastructure are stable, the work shifts to an experiment-measure-refine cycle: train, evaluate against a baseline, adjust, repeat.
This phase is genuinely iterative in the same way as software's build phase, and benefits from the same discipline, short cycles, clear metrics, and frequent checkpoints.
It differs in the "definition of done".
A SW feature is done when it passes its functionality and user acceptance testing.
A model is done when its performance against a baseline is good enough for the operating context (a negotiated threshold rather than a binary pass).
Teams that carry the software definition of done into this phase tend to either ship too early or never ship at all.
Usually stuck chasing marginal gains or writing code to accomodate edge cases in model outputs.

## Delivery

A deployed model is the start of the operation cycle.
Once a model is deployed it must be monitored for drift from expected baselines, with a known and defined path to retraining.
Instrumentation at deployment captures whether the drift is related to unseen data (new training required) or trend changes which are normal seasonality in the process.

This is where an ML project's timeline is often under-estimated.
The most effective projects ship a basic model into production quickly, tolerate some level of poor performance to exercise the monitoring and retraining process; and then optimise the Iteration and Delivery steps with confidence.

---

| Phase | Character | What it produces |
|---|---|---|
| Setup | Sequential, does not compress | Data pipeline, labelling strategy, evaluation infrastructure |
| Iteration | Cyclical, benefits from short loops | A model meeting an agreed performance threshold |
| Delivery and monitoring | Ongoing, not a fixed endpoint | Production system with drift detection and a retraining path |

---

Planning against this structure rather than against a single project timeline changes how the effort is estimated:
Setup is a fixed, bounded engagement, because its output is a known state, not a moving target.
Iteration is a cycle length and a review cadence, not a single date.
Delivery is a monitoring plan attached to it at launch, not retrofitted once issues are flagged.
