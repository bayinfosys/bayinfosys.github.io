---
date: 2026-07-26
last_modified_at: 2026-11-14
layout: article
title: "What Self-Hosted LLM Inference Costs: 14 Models Measured on One GPU"
seo_title: "Self-Hosted LLM Inference Cost: A Measured Benchmark Across 14 Models"
description: "What self-hosted LLM inference costs, measured: 14 open-weight models, 1,204 requests and 226 watt-hours on one RTX 3060, or 5.6p of electricity. Plus how to work out when owned hardware breaks even against an API."
keywords: ["self-hosted inference cost", "self-hosted llm cost", "private ai inference cost", "local llm electricity cost", "gpu inference power draw", "llm api vs self-hosted cost", "open weight models benchmark", "rtx 3060 llm"]
topic: "Infrastructure"
cta: private-inference
related:
  - 80-falling-token-prices
  - 117-private-ai-server
  - 40-private-inference
  - 87-inference-infrastructure
  - 90-aws-bedrock-costs
  - 64-marigold
---

# What Self-Hosted LLM Inference Costs: 14 Models Measured on One GPU

Self-hosted inference has two costs: the hardware, paid once, and the electricity each request draws. Most published figures for the second are estimates built from a GPU's rated wattage and an assumed utilisation, and the assumption does most of the work. The benchmark below ran 14 open-weight instruct models through 1,204 requests on a single RTX 3060, sampling power and memory per request from the worker process, to replace the estimate with a measurement. We then set out how that measurement fits into a break-even calculation against an API.

## What was run

The stack was one RTX 3060, a Postgres-backed queue and one worker process, with no cloud component anywhere in the path. Each model handled 86 sequential requests across five prompt types (a fixed-prefix set, a structured-output set and three context lengths), with output capped at 256 tokens.

Electricity across the whole run, all 14 models and all 1,204 requests: **226.4 watt-hours, or 5.6p** at the Ofgem price cap rate at the time (about 25p per kWh).

(The per-request charts, the comparison of throughput against parameter count, and the raw CSV are published on [Marigold's benchmark page](https://marigold.run/blog/self-hosted-inference-benchmark.html) and on GitHub.)

## What the telemetry caught

Two findings came from recording every request individually, and an estimate would have produced neither.

Output length predicted request time better than parameter count did. The two slowest models in the set were the ones that wrote the longest completions, and neither was the largest. Capping output length is therefore one of the cheaper ways to cut cost per request.

One model, `dolphin-2.9-llama3-8b`, hit the 256-token cap on all 86 of its requests. Its stop token had silently stopped working, so it generated until it was cut off. The fault showed up only because completion length was recorded per request; an average would have hidden it inside a summary figure.

## The marginal cost

For this class of model, once the hardware exists and would otherwise sit idle, an extra request costs roughly the electricity it draws and very little else. That is the marginal cost. It says nothing about whether owning the hardware was worth it, which depends on how much of the time it is busy.

A hosted API prices each token with the provider's margin included, however cheap generation becomes underneath. Inference on hardware you control pays the marginal cost directly, which makes the cost structure legible: a meter reading and a hardware invoice. ([Falling token prices](/library/80-falling-token-prices.html) covers how the industry's prices are moving.)

## When owned hardware breaks even

The break-even point compares the hardware cost with the daily saving:

```
days to break even = hardware cost / (daily API cost at your volume - daily electricity cost)
```

The daily API cost is your tokens per day multiplied by the API's price per token, for a model of comparable quality on your task. The daily electricity cost is the measured energy per request multiplied by requests per day and your tariff. With the figures above, electricity is close to negligible, so the calculation is driven by volume and by the API price.

An independent study of consumer Blackwell GPUs put the electricity cost of self-hosted inference at $0.001 to $0.04 per million tokens, and found the hardware reaching cost parity with budget-tier cloud APIs within one to four months at 30 million tokens a day ([Private LLM Inference on Consumer Blackwell GPUs](https://arxiv.org/abs/2601.09527)). At low or irregular volume the same arithmetic favours the API, and as a rule self-hosting starts to pay above a few million tokens a day.

Four things move the answer and belong in any real calculation:

- **Utilisation.** The saving accrues only on days the hardware is busy. A server used one hour a day takes many times longer to pay back than the formula's ideal.
- **Staff time.** Someone installs, patches and monitors the server. On a small deployment, that can outweigh the hardware.
- **Quality.** The comparison only holds against an API model of similar quality on your task, which needs testing on your own examples ([how to evaluate an AI pipeline](/library/61-eval-datasets.html)).
- **Hardware life and price.** GPU and memory prices rose through 2026, and a card bought now has a service life of a few years ([what a private AI server is](/library/117-private-ai-server.html)).

Measured electricity removes the guesswork from one side of the calculation, and leaves volume and utilisation to decide the rest. (If a measurement like this would help scope your own inference costs, [get in touch](/contact.html).)
