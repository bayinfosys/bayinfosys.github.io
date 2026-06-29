---
date: 2026-06-14
layout: article
title: "Open Weights Mean the Tier Is a Deployment Decision, Not a Lock-In"
description: "With closed AI APIs, your infrastructure tier is permanent. With open-weight models, local, private, and cloud are the same application at different scales. You choose the tier; the code stays the same."
keywords: ["open weight models local inference", "ollama local development", "self-hosted llm production", "llm deployment tiers", "private inference vs cloud", "open source llm deployment", "llm infrastructure scaling", "run llm locally", "marigold private inference"]
topic: "Architecture & Deployment"
related:
  - 63-private-inference-stack
  - 40-private-inference
  - 64-marigold
  - 66-open-weights-separate-concerns
  - 65-why-private-inference
---

# Open Weights Mean the Tier Is a Deployment Decision, Not a Lock-In

When you build against the OpenAI API, you make a permanent infrastructure decision at the same time. You cannot run GPT-4 locally. You cannot move it into your VPC. You cannot hand it to a client to self-host, deploy it offline, or run it in a tight loop without a network round-trip. The model and the infrastructure are one thing. Whatever tier you are on -- shared cloud, enterprise agreement, whatever -- that is where the model lives. The tier is not a choice you revisit.

Open-weight models separate these two decisions. The weights are published. They run on your laptop, on a private AWS instance, on a rented GPU cluster, or on a client's on-premises server. The application calling the model does not change between those environments, because the API surface is the same throughout. What changes is the infrastructure underneath -- and infrastructure decisions are reversible.

This is a more useful framing than "open source vs closed". The practical consequence is that you choose your deployment tier based on what you actually need right now, with the option to change it when that changes.

## What the tiers are

Local inference via Ollama is the natural starting point for development. Ollama wraps a quantised model behind an OpenAI-compatible HTTP endpoint on localhost. The application code is identical to production code; the only difference is the base URL. This matters more than it sounds: you are not testing against a mock, a stub, or a smaller proxy model. You are testing against the same weights that will run in production. Behavioural differences between development and production are infrastructure differences, not model differences. That is a significantly narrower debugging surface.

Local inference has reasons beyond development convenience. A model running on the same machine as the application adds no network latency -- relevant for tight loops, real-time annotation, or any workflow where the inference call is on the critical path. It works without a network connection, which matters for edge deployment, air-gapped environments, or applications that need to function on a train. And nothing leaves the machine, which is the strongest possible data boundary: not contractual, not architectural, simply physical.

The constraint is throughput. Ollama serves one request at a time. On a development machine without a discrete GPU, generation is slow. This is fine for a single developer; it is not fine for concurrent users or bulk processing.

Private managed inference -- a service like [Marigold](https://marigold.run) running the same open-weight models on dedicated GPU infrastructure -- handles that constraint without changing the application. The base URL changes. The model identifier may change slightly in format. The API surface, the request structure, and the response shape are the same. The application does not know it has moved.

Private managed inference has its own reason set that goes beyond throughput. The data boundary is contractual and architectural: your data reaches the inference server and returns; it does not enter a training pipeline, it does not pass through shared infrastructure, and the provider has accepted explicit constraints on what they can do with it. For organisations in regulated sectors -- healthcare, legal, financial services -- this is often the constraint that makes a project viable at all, and it holds regardless of request volume.

Self-hosted production infrastructure (vLLM on your own GPU instances) sits above that in operational complexity and below it in per-token cost at sustained scale. It is the right tier for organisations with GPU operations capability and volume high enough that the fixed infrastructure cost beats per-request pricing. The same weights, the same API surface.

Cloud GPU rental -- rented H100s, A100s, or equivalent -- covers burst capacity and model sizes that no local hardware can accommodate. Same again.

## Why the tier reason matters

The usual way to frame this is cost: local is cheapest, cloud is most expensive, choose based on volume. That framing is correct but incomplete.

Each tier has a primary reason that is not cost. Local is about latency and offline capability. Private managed is about data sovereignty. Self-hosted is about cost at scale. Cloud rental is about capacity on demand. An organisation might sit at private managed inference not because it has outgrown local and not yet reached self-hosted, but because data sovereignty is a permanent requirement regardless of scale. A developer might run locally not because they cannot afford an API call but because they need the application to work on an aeroplane.

Understanding the reason clarifies when the tier should change. If the reason is data sovereignty, moving to a cheaper public API tier at higher volume is not a cost optimisation -- it removes the property the architecture was built around. If the reason is latency, moving to a managed service adds a network hop that the reason for local specifically avoided.

Closed-model providers collapse this. The tier choice is also the data handling choice, the latency choice, and the offline capability choice, all at once, because they are all the same thing: whether your data goes to that provider's servers. With open weights they separate. You can have private managed inference with high throughput. You can have local inference with the same model quality as production. The tier decision and the other decisions come apart, and you can make each one on its own terms.

## What stays the same

The simplest demonstration of this is the code. An application built against Ollama on localhost:

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:11434/v1",
    api_key="ignored"
)

response = client.chat.completions.create(
    model="llama3.2",
    messages=[{"role": "user", "content": prompt}]
)
```

The same application against Marigold in production:

```python
client = OpenAI(
    base_url="https://api.marigold.run/v1",
    api_key=MARIGOLD_API_KEY
)

response = client.chat.completions.create(
    model="llama3.2",
    messages=[{"role": "user", "content": prompt}]
)
```

Two lines change. The logic, the prompt structure, the response handling, the error handling, the retry behaviour -- none of it changes, because none of it was ever specific to the infrastructure. It was always specific to the model and the task.

This is what the private inference series on this blog has been building toward. The separation of model from infrastructure is not an architectural nicety. It is the property that makes the tier decision reversible, that makes local and production genuinely equivalent for testing purposes, and that removes the infrastructure tier from the list of permanent early decisions a project has to get right.

The decision you are making when you choose an open-weight model is not "which provider". It is "which tier fits right now" -- with the understanding that the answer is allowed to change.
