---
date: 2026-05-10
layout: article
title: "Open Weight Models and the Separation of Concerns in AI"
description: "Vertically integrated AI companies collect data, train models,
and sell inference. This is a business process error. The organisation that
understands the task should own the data that defines it."
keywords: ["open weight models", "open source ai", "model training",
"private inference", "data sovereignty", "ai strategy",
"foundation models", "self-hosted llm", "ai commoditisation"]
topic: "Product & Strategy"
related:
  - 40-private-inference
  - 64-marigold
  - 46-labels-are-the-task
  - 61-eval-datasets
---

# Open Weight Models and the Separation of Concerns in AI

The major AI companies collect data, train models, and sell inference.
This is presented as vertical integration -- a strength. It is more
accurately described as a business process error that compounds
until it becomes visible in model quality.

Data collection is a business process. It requires domain knowledge,
deliberate labelling strategies, and a precise understanding of what
the model is being asked to learn. Model training and inference are
technical processes. They require engineering rigour, infrastructure,
and optimisation against a defined objective. These are different
disciplines with different incentives. Organisations that do both
do neither well.

## The monolithic provider problem

A monolithic provider -- one that collects data, trains models, and
sells inference as a single commercial offering -- has a structural
incentive to acquire data at scale. Volume is measurable, defensible,
and investable. Quality is harder to quantify.

The result is models trained on whatever was available rather than on
what was needed: a training set shaped by commercial relationships and
acquisition opportunity rather than by the requirements of any
particular task.

The domain organisation -- the hospital, the legal firm, the financial
institution -- holds the knowledge that would make a model genuinely
useful. It understands what a correct clinical summarisation looks like.
It knows what distinguishes a sound contractual analysis from a poor one.
It can identify a compliant recommendation from a non-compliant one.
The monolithic provider does not have this knowledge and cannot acquire
it accurately from the outside. The domain organisation does not train
foundation models and should not need to.

The gap between what a general-purpose model produces and what a domain
expert requires is not a capability gap but a data gap.

## Three roles, three entities

Open-weight models make the correct separation possible by decoupling
what the monolithic provider bundles together.

The **model trainer** publishes weights trained on declared public
datasets. Their focus is foundation quality: breadth, coherence,
instruction-following, reasoning. Llama, Mistral, and Qwen occupy
this role. The weights are public, fixed, and available to anyone.

The **inference provider** runs those weights and exposes them through
an API. Their focus is operational: latency, availability, cost,
and -- critically -- the boundary conditions around what enters and
leaves the system. The inference provider handles requests. It does
not need content to do its job.

The **domain organisation** owns the task. It understands how correct
output looks, holds the data that demonstrates it, and accumulates
the labelled examples to refine the system over time.
This knowledge stays with the domain organisation and does not flow to
the model trainer through the inference provider's logs.

When these three roles are held by three separate entities, the
conflicts of interest that plague the monolithic model disappear.
The model trainer has no access to production queries. The inference
provider has no incentive to retain content. The domain organisation
retains its data, its task knowledge, and the asset value that
accumulates from both.

## The labelled dataset is the asset

A subscription to a monolithic provider produces no durable asset.
The domain organisation pays per token, the provider improves its
model on the resulting data, and the investment compounds for the
provider rather than for the customer.

A labelled dataset is different. It is a formal statement of what
correct behaviour looks like for a specific task -- accumulated from
domain expertise, production use, and deliberate correction. It is
owned, portable, and improvable. When a better foundation model is
released, the same dataset evaluates it. When a provider changes its
terms, raises its prices, or discontinues a model, the dataset retains
its value independently.

The organisation that owns its task data owns its model behaviour.
That is a competitive asset in a way that an API subscription is not.

## A complete technical solution

The argument for open weights is sometimes framed as ideological --
open versus closed, community versus corporate. That framing obscures
the practical case.

Open weights enable a complete technical solution to the data
sovereignty problem. The model trainer publishes on declared data.
The inference provider runs the model without recording submissions.
The domain organisation applies it to its own data without any of
that data entering a training pipeline.

The corporate politics and legal complications that surround AI
adoption in regulated sectors exist almost entirely because the
monolithic model bundles data collection, training, and inference
into a single commercial relationship. Separate those concerns and
most of the complications dissolve.

This is the correct architecture for any organisation that takes
its data seriously.

---

(The [private inference articles](/library/40-private-inference.html)
cover the data sovereignty case in detail. [Marigold](https://marigold.run)
is our inference provider -- open-weight models, no content retention,
no training pipeline.)
