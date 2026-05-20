---
layout: article
title: "When Training is a Commodity"
seo_title: "When AI Training is a Commodity: Every Organisation Becomes a Model Provider"
description: "Inference is already a commodity. Training is next. When it
arrives, every organisation that has spent the intervening period curating
its own data will have a model. The AI provider will be as unremarkable
as the web host."
keywords: ["ai commodity", "foundation models", "open weight models", "machine learning training", "ai strategy", "digital twin ai", "private ai", "data moat", "ai competitive advantage"]
topic: "Product & Strategy"
last_modified_at: 2026-05-20
related:
  - 66-open-weights-separate-concerns
  - 40-private-inference
  - 46-labels-are-the-task
  - 04-cost-of-ml
  - 65-why-private-inference
redirect_from:
  - /when-training-is-a-commodity/
---

# When Training is a Commodity

Inference is already a commodity. Compute, storage, APIs, deployment infrastructure: these are engineering tasks with known costs, multiple providers, and no meaningful differentiation between them at the capability level.
Running a model is a solved problem.
The only remaining reason to choose one inference provider over another is price, latency, sovereignty, or other "non-functional" requirements.

However, training is not a commodity.
Building a frontier model requires specialised expertise in scaling optimisation, distributed training infrastructure, and architectural decisions that only a small number of organisations can obtain.
The gap between an organisation that can train a frontier model and one that cannot is still wide.

## The trajectory

The history of compute follows a consistent pattern.
A capability that requires specialist infrastructure and rare expertise becomes, over time, a service that anyone can purchase.
Mainframes became servers became cloud instances.
The capability does not diminish but the barrier to access is reduced.

Training is on the same trajectory.
The techniques are documented in public research.
The infrastructure is increasingly available through cloud providers.
The expertise is diffusing through the industry.
Fine-tuning is an already accessible feature for any competent ML engineer.
Full pre-training on domain-specific data is approaching the same threshold.

The question is not whether training will become a commodity, but rather: what will the world looks like when it does?

## What happens to the data

When training infrastructure is available to any organisation, the differentiating asset is no longer the model.
It is the data.

Consider three organisations that have spent the last decade accumulating data as a byproduct of their core activity.

A hospital trust has clinical records, diagnostic confirmations, treatment outcomes, and correction logs from every case that did not follow the expected pathway.
This data reflects the specific population the trust serves, the specific protocols it follows, and the specific failure modes it has encountered and resolved.

An aerospace engineering firm has twenty years of finite element analysis results, materials testing data, and failure mode simulations.
Each simulation represents physical reality under controlled conditions -- the behaviour of specific materials under specific loads, accumulated through expensive experimental work that cannot be reconstructed from public sources.

A financial institution has compliance decisions, risk assessments, flagged transactions, and the outcomes that confirmed or overturned each flag.
This record reflects the firm's specific regulatory environment, its specific client base, and the accumulated judgement of its compliance team applied to real cases over years.

None of these datasets are available to a foundation model trainer.
They exist inside these organisations, accumulated quietly, and are currently sitting largely unused as future training assets.
When training becomes a commodity, each of these organisations can train a model on that data.
The result is not a general-purpose model that happens to know about medicine, engineering, or finance.
It is a model that reflects the specific institutional knowledge of that organisation -- its cases, its decisions, its corrections, its accumulated understanding of its own domain.

That is a digital twin. Not a simulation of a physical system or a customer, but a computational expression of an organisation's knowledge, trained on the evidence that knowledge produced.

## The data leakage problem closes the loop

There is a reasonable objection to this argument: if training becomes a commodity, cannot a competitor simply train on similar data and produce an equivalent model?

The answer is no, for a structural reason: A model trained on proprietary data obfuscates that data within its weights.
The weights encode the patterns in the training data without exposing the data itself.
This is not a privacy feature -- it is a consequence of how training works.
The New York Times litigation demonstrated that models can, under specific prompting conditions, reproduce fragments of training data.
But the general case is the opposite: the model obscures its training data behind a learned representation that is opaque to anyone who does not hold the original data.

The organisation that trained on its own data retains the data.
The model is a derivative, not a copy.
A competitor who trains on public data produces a public model.
The organisation that trains on decades of proprietary engineering simulations produces a model that reflects physical reality as that organisation has measured it.
Those are not equivalent, and the gap between them does not close with better training infrastructure.

## The AI provider will be as unremarkable as the web host

In 1995, having a website required specialist expertise, expensive infrastructure, and a relationship with a provider who understood both.
By 2005, anyone could publish.
By 2015, not having a website was a signal that an organisation was not serious.
The provider became invisible infrastructure.

AI model providers are on the same arc.
Today, using a foundation model requires an API relationship with one of a small number of companies.
When training is a commodity, every organisation that has curated its own data will have its own model.
The provider will be the organisation itself.
The external AI provider will occupy the same position as the web host -- necessary infrastructure, unremarkable, interchangeable.

The organisations that understand this now are spending the intervening period doing one thing: accumulating and curating the data that their future model will be trained on.
Not because they can train it yet. Because when they can, the data will be the only part that cannot be purchased.

([The open weights article](/library/66-open-weights-separate-concerns.html) covers the separation of model training and inference in the current landscape.
[Marigold](/library/64-marigold.html) is our inference layer -- the commodity part, handled so you can focus on the data part.)
