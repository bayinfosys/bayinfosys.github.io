---
date: 2026-06-14
last_modified_at: 2026-11-14
layout: article
title: "Open Weights Make the Deployment Tier a Reversible Decision"
seo_title: "LLM Deployment Tiers: Local, Private, Self-Hosted and Cloud with Open Weights"
description: "With open-weight models, a laptop, a private deployment, your own GPU servers and rented cloud GPUs run the same application. Each tier has its own reason, and the tier can change later without rewriting code."
keywords: ["llm deployment tiers", "open weight models deployment", "run llm locally", "self-hosted llm production", "private inference vs cloud", "ollama local development", "llm vendor lock-in", "open source llm deployment"]
topic: "Architecture & Deployment"
related:
  - 63-private-inference-stack
  - 40-private-inference
  - 117-private-ai-server
  - 87-inference-infrastructure
  - 66-open-weights-separate-concerns
  - 64-marigold
---

# Open Weights Make the Deployment Tier a Reversible Decision

Building on a closed model fixes where the model runs. A closed model can be reached through the provider's API, or through a cloud provider's private networking in a region you choose, but it cannot run on your own hardware, inside a client's network or with no connection at all. Choosing the model chooses the tier.

Open-weight models separate the two decisions. The weights are published, so the same model runs on a laptop, on a private deployment, on your own GPU servers or on rented cloud GPUs. The application calling it stays the same throughout, because every tier exposes the same OpenAI-compatible API. Only the infrastructure underneath changes, and infrastructure decisions can be reversed.

We set out the four tiers, the reason each one exists, and what stays the same when an application moves between them.

## The four tiers

| Tier | Typical stack | Primary reason | Limit |
|---|---|---|---|
| Local | Ollama or llama.cpp on a laptop or workstation | Latency, offline use, a physical data boundary | Throughput; a few concurrent requests |
| Private managed | A dedicated deployment run for you, such as marigold hosted in an agreed region | Data sovereignty without a GPU operations team | Monthly cost; a supplier in the arrangement |
| Self-hosted | vLLM or marigold on your own GPU servers or cloud instances | Cost at sustained volume | Operating the GPUs |
| Cloud rental | Rented H100s, A100s or similar by the hour | Capacity and model sizes no owned hardware covers | Cost at sustained use |

**Local.** Ollama wraps a quantised model behind an OpenAI-compatible endpoint on localhost. The application code is the code that will run in production, with a different base URL, and it runs against the same weights production will use. Differences between development and production then come from infrastructure, which narrows debugging considerably. Local inference also adds no network latency, works without a connection (at the edge, in an air-gapped environment, on a train) and keeps the data on one machine, the strongest boundary there is. Its limit is throughput: Ollama handles a few requests in parallel, and a machine without a discrete GPU generates slowly.

**Private managed.** A supplier runs the same open-weight models on infrastructure reserved for you, inside a boundary set by contract. The base URL changes and the model identifier may change in format; the request and response shapes do not. For regulated organisations this is often the tier that makes a project possible at all, and it remains the right tier however large the volume grows. ([What private AI inference is](/library/40-private-inference.html) covers who provides it.)

**Self-hosted.** vLLM or a platform such as marigold on your own GPU servers or cloud instances costs more to operate than a managed deployment and less per token at sustained volume. It suits organisations with GPU operations skills and steady load ([what a private AI server is](/library/117-private-ai-server.html), [AI inference infrastructure](/library/87-inference-infrastructure.html)).

**Cloud rental.** Rented data-centre GPUs cover bursts of demand and models too large for any owned hardware, with the same weights and the same API.

## Each tier has its own reason

Cost is the usual way to choose: local is cheapest, cloud rental most expensive, pick by volume. Each tier's main reason lies elsewhere. Local is for latency and offline use. Private managed is for sovereignty. Self-hosted is for cost at scale. Cloud rental is for capacity on demand.

The reason tells you when the tier should change, and when it should stay put. An organisation can sit at private managed inference permanently because sovereignty is a standing requirement, whatever its volume. If the reason is sovereignty, moving to a cheaper public API at higher volume gives up the property the architecture was built for. If the reason is latency, moving to a managed service adds the network hop that local inference avoided.

With closed models, the tier, the data handling, the latency and the offline capability are one decision, because they all reduce to whether the data goes to the provider's servers. Open weights let each be decided separately: private inference with high throughput, or local development against production-quality weights.

## What stays the same

An application built against Ollama on localhost:

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:11434/v1",
    api_key="ignored",
)

response = client.chat.completions.create(
    model="llama3.2",
    messages=[{"role": "user", "content": prompt}],
)
```

The same application against a private deployment:

```python
client = OpenAI(
    base_url="https://inference.internal.example.com/v1",
    api_key=INFERENCE_API_KEY,
)

response = client.chat.completions.create(
    model="llama3.2",
    messages=[{"role": "user", "content": prompt}],
)
```

Two lines change. The prompts, the response handling, the error handling and the retries stay as they were, because they were written for the model and the task, and neither has moved. (The serving software behind each tier is compared in [how to self-host an LLM](/library/63-private-inference-stack.html).)

Choosing an open-weight model leaves the tier as a decision about the present, open to revision as the reasons change.
