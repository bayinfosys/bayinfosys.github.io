---
date: 2026-06-29
layout: article
title: "Falling Token Prices and the Cost of Inference You Already Own"
description: "Token prices are falling industry-wide while volume rises faster than the price drops. A measured benchmark of 14 open-weight models on a single GPU shows what that dynamic looks like at the smallest possible scale: 5.6p in electricity for 1,204 requests."
keywords: ["self-hosted inference cost", "open weight model benchmark", "ai token economics", "token price elasticity", "private inference cost", "rtx 3060 llm benchmark"]
topic: "Infrastructure"
seo_title: "Self-Hosted Inference Cost vs the AI Industry's Token Economics"
related:
  - 40-private-inference
  - 65-why-private-inference
  - 78-gpu-market-2026
  - 64-marigold
---

# Falling Token Prices and the Cost of Inference You Already Own

Google's reported monthly token volume rose roughly fifty-fold between early 2025 and mid-2026, from about 9.7 trillion to over 480 trillion, according to figures Sundar Pichai has given publicly.
Over a similar period, the blended price per million tokens across the industry fell from around 17 dollars to around 2, by Epoch AI's tracking.
The two numbers are not independent.
[Exponential View's analysis](https://intelligence.exponentialview.co/) of the broader market puts the relationship at an elasticity of roughly 1.2 to 1.8: a 10 percent price cut tends to produce 12 to 18 percent more usage.
Tokens are getting cheaper and the industry is using more of them faster than the price falls, which means total spend on inference keeps growing even as the per-unit cost collapses.

That is the dynamic at hyperscaler scale, where it is hard to verify directly.
From outside Google, we cannot audit the 480 trillion figure, and the "cost per token" reported by providers is a blended commercial price, not a measured cost of generation.
The same dynamic is verifiable at the smallest possible scale, however: a single GPU, a defined set of models, and a meter on the wall.

## A measured number, not an estimated one

We ran 14 open-weight instruct models through 1,204 requests on a single RTX 3060, with per-request power draw and VRAM sampled directly from the worker process rather than inferred from the card's rated wattage.
Each model handled 86 sequential requests across five prompt types -- a fixed-prefix set, a structured-output set, and three context lengths -- with output capped at 256 tokens.
Total electricity drawn across the entire run, all 14 models, all 1,204 requests: 226.4 watt-hours. At the current Ofgem rate, that is 5.6 pence.

Two findings from the same telemetry are worth keeping, because they show what a measured run catches that an estimate cannot.
Output length, not parameter count, was the strongest predictor of how long a request took: the two slowest models in the set were not the largest, but the ones that wrote the longest completions.

The full per-request charts, the throughput-against-parameter-count comparison, and the raw CSV behind this run are published on [Marigold's benchmark page](https://marigold.run/blog/self-hosted-inference-benchmark.html).

## What the small number says about the large one

Five and a half pence for 1,204 requests is not evidence that inference is free.
It is evidence that for a defined class of model, the marginal cost of an additional request, once the hardware exists and is idle, approaches the cost of the electricity it draws and very little else.
That is the same statement the industry-level figures are making about token prices generally, at a scale where it can actually be checked.

The distinction that matters for an organisation deciding how to run inference is not whether the marginal cost is low.
By most measures available, it already is, and falling.
The distinction is who controls where that marginal cost is paid.
A cloud API bills per token at a margin set by the provider, regardless of how cheap the underlying generation has become.
Inference run on infrastructure you control -- whether a desktop GPU for development or a managed private deployment at production scale -- pays the marginal cost directly, with no margin sitting between the electricity meter and the result.

This is the argument for self-hosting: not that it is dramatically cheaper in absolute terms for every workload, but that the cost structure is legible.
You can point at 226.4 watt-hours and a meter reading.
A per-token API price is a commercial decision made somewhere else, and it does not have to track the falling cost of generation at all.

For the architectural version of this question -- what changes when inference runs inside a network boundary you control rather than a provider's -- see [Private Inference: Running AI Inside Your Own Infrastructure](/library/40-private-inference.html).

[Marigold](https://marigold.run) runs the same class of open-weight models on private infrastructure for workloads that have outgrown a single GPU.
