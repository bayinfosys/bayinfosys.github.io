---
date: 2026-05-10
last_modified_at: 2026-11-14
layout: article
title: "Open Weight Models and the Separation of Concerns in AI"
description: "The major AI companies collect data, train models and sell inference as one offering. Open-weight models split those into three roles, and leave the organisation that understands the task holding the data that defines it."
keywords: ["open weight models", "open source ai", "separation of concerns ai", "model training", "ai strategy", "labelled data", "data sovereignty", "foundation models", "ai commoditisation"]
topic: "Product & Strategy"
related:
  - 65-why-private-inference
  - 40-private-inference
  - 46-labels-are-the-task
  - 61-eval-datasets
  - 70-training-commodity
  - 64-marigold
---

# Open Weight Models and the Separation of Concerns in AI

The major AI companies collect data, train models and sell inference as a single offering. The bundle is usually described as vertical integration, and it mixes two kinds of work that pull in different directions.

Data collection is a business process. It needs domain knowledge, a deliberate labelling strategy and a precise idea of what the model is meant to learn. Training and inference are technical processes: engineering, infrastructure and optimisation against a defined objective. The incentives of the two differ, and an organisation that runs both tends to let the second set the terms of the first.

We set out the problem with the bundle, the three roles that open-weight models separate, and the asset that separation leaves with the organisation that owns the task.

## The trouble with the bundle

A provider that collects data, trains models and sells inference has a structural reason to acquire data at scale. Volume is measurable and investable; fitness for a particular task is harder to show. The training set that results is shaped by what was available to acquire, and only loosely by what any particular task requires.

The knowledge that would make a model useful in a specific domain sits elsewhere. A hospital knows what a correct clinical summary looks like. A law firm knows what separates a sound contractual analysis from a poor one. A financial institution can tell a compliant recommendation from a non-compliant one. A general-purpose provider cannot collect that knowledge accurately from outside, and the domain organisation does not train foundation models and should not need to. The gap between what a general model produces and what a domain expert requires is mostly a gap in data.

## Three roles, three entities

Open-weight models allow the bundle to come apart into three roles.

The **model trainer** publishes weights. Its work is foundation quality: breadth, coherence, instruction-following and reasoning. Meta, Mistral and Alibaba's Qwen team fill this role. Their weights are public and fixed, and their training data is described in outline. (Fully open projects such as AI2's OLMo publish the training data as well.)

The **inference provider** runs the weights and exposes them through an API. Its work is operational: latency, availability, cost and the boundary around what enters and leaves the system. It handles requests and has no need to keep their content.

The **domain organisation** owns the task. It knows what correct output looks like, holds the data that shows it, and accumulates the labelled examples that refine the system over time. That knowledge stays with it, and does not reach the model trainer through anyone's logs.

With the three roles held by separate entities, the conflicts in the bundle fall away. The model trainer never sees production queries. The inference provider has no use for the content it serves. The domain organisation keeps its data, its knowledge of the task, and the value that builds up from both. The inference provider can be the domain organisation itself, running the weights on its own servers ([private inference](/library/40-private-inference.html)).

## The labelled dataset is the asset

The major providers' business terms now exclude API data from training by default, so a subscriber's data no longer improves the provider's model. It does not improve anything else either. Paying per token for a general model leaves the subscriber with no durable record of what correct output looks like for its task, unless it builds one deliberately. ([Why private inference](/library/65-why-private-inference.html) covers what the terms do and do not promise.)

A labelled dataset is that record: a formal statement of correct behaviour for a specific task, accumulated from domain expertise, production use and deliberate correction ([labels are the task](/library/46-labels-are-the-task.html)). It is owned, portable and improvable. When a better foundation model is released, the same dataset evaluates it ([how to evaluate an AI pipeline](/library/61-eval-datasets.html)). When a provider changes its terms, raises its prices or retires a model, the dataset keeps its value.

An organisation that owns its task data owns the behaviour of whatever model it runs against that data, and can change the model without losing either.

## The practical case

Open weights are sometimes argued for as a matter of principle, open against closed. The practical case is narrower and easier to test.

With the roles separated, the model trainer publishes weights, the inference provider runs them without keeping what it serves, and the domain organisation applies them to its own data without any of it entering a training pipeline. Much of the legal and procurement difficulty around AI in regulated sectors comes from the bundle: one commercial relationship that covers data collection, training and inference at once. Separate the three and most of that difficulty becomes a question of where the inference runs, which ordinary infrastructure can answer. (Marigold, Bay Information Systems' open-source inference platform, is one way to run the inference role yourself: [Marigold](/library/64-marigold.html).)
