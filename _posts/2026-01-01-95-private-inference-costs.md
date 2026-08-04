---
date: 2026-01-01
layout: article
title: "Private Inference: Costs"
description: "Cost claims about self-hosted inference are usually estimates. A full telemetry run across 14 open-weight models on a single consumer GPU replaces the estimate with a number: 5.6 pence in electricity for 1,204 requests."
keywords: ["self-hosted inference cost", "open weight models benchmark", "rtx 3060 llm", "local inference cost", "gpu inference power draw", "private ai inference cost"]
topic: "Infrastructure"
seo_title: "Self-Hosted LLM Inference Cost: A Measured Benchmark Across 14 Models"
related:
  - 64-marigold
  - 40-private-inference
  - 78-gpu-market-2026
  - 65-why-private-inference
---

# Self-Hosted Inference, Measured: 14 Models, One GPU, Five Pence

Most claims about the cost of self-hosted inference are estimates built from a GPU's wattage rating and an assumed utilisation figure. The assumption does most of the work, and it is rarely stated. We ran 14 open-weight instruct models through 1,204 requests on a single RTX 3060, with per-request power and VRAM sampled directly from the worker process, to replace the estimate with a measured number.

## What was run

The stack was a single RTX 3060, a Postgres-backed queue, and one worker process (no cloud component anywhere in the path). Each model handled 86 sequential requests across five prompt types: a fixed-prefix set, a structured-output set, and three context lengths, with output capped at 256 tokens. Total electricity drawn across the entire run, all 14 models, all 1,204 requests: 226.4 watt-hours. At the current Ofgem rate, that is 5.6 pence.

Two findings from the same telemetry are worth keeping, because they show what a measured run catches that an estimate cannot. Output length, not parameter count, was the strongest predictor of how long a request took: the two slowest models in the set were not the largest, but the ones that wrote the longest completions. And one model, `dolphin-2.9-llama3-8b`, hit its 256-token cap on all 86 of its requests without exception, a stop-token configuration that had silently stopped working, visible only because the benchmark recorded completion length per request rather than averaging it into a summary statistic.

(The full per-request charts, the throughput-against-parameter-count comparison, and the raw CSV behind this run are published on [Marigold's benchmark page](https://marigold.run/blog/self-hosted-inference-benchmark.html) and on GitHub.)

## What the small number says about the large one

Five and a half pence for 1,204 requests is not evidence that inference is free. It is evidence that for a defined class of model, the marginal cost of an additional request, once the hardware exists and is idle, approaches the cost of the electricity it draws and very little else. That is the same statement the industry-level figures are making about token prices generally, at a scale where it can actually be checked.

The distinction that matters for an organisation deciding how to run inference is not whether the marginal cost is low. By most measures available, it already is, and falling. The distinction is who controls where that marginal cost is paid. A cloud API bills per token at a margin set by the provider, regardless of how cheap the underlying generation has become. Inference run on infrastructure you control, whether a desktop GPU for development or a managed private deployment at production scale, pays the marginal cost directly, with no margin sitting between the electricity meter and the result.

(For the architectural version of this question, what changes when inference runs inside a network boundary you control rather than a provider's, see [Private Inference: Running AI Inside Your Own Infrastructure](/library/40-private-inference.html). [Get in touch](/contact.html) if a benchmark like this one would help scope your own inference costs.)
