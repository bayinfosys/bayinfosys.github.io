---
date: 2026-07-15
last_modified_at: 2026-10-31
layout: article
title: "AI Inference Infrastructure: A Decision Framework"
seo_title: "AI Inference Infrastructure: Choosing Hosting, GPUs and Serving Software"
description: "The best AI inference infrastructure depends on four decisions: who hosts it, which GPU (VRAM is the constraint), how it scales, and which serving software handles concurrent users. How to make each one for production."
keywords: ["ai inference infrastructure", "ai inference infrastructure best practices", "ai inference hosting", "ai inference deployment", "ai inference servers", "ai model inference hosting", "ai inference api", "local ai", "vllm", "gpu vram inference"]
topic: "Architecture & Deployment"
related:
  - 65-why-private-inference
  - 40-private-inference
  - 63-private-inference-stack
  - 78-gpu-market-2026
  - 95-private-inference-costs
  - 114-unified-memory-machines-2026
---

# AI Inference Infrastructure: A Decision Framework

An inference layer needs four things: somewhere to run (a hosted API, a
managed service, or servers you control), a GPU with enough memory for
the model's weights and its key-value cache, a way to spread load across
machines once one is not enough, and serving software that queues and
batches requests. The best infrastructure for a given deployment follows
from three facts: how sensitive the data is, how steady the traffic is,
and how many users wait on a response at once.

Teams new to the problem often research the four decisions as one
question. We take them in turn, then map three common workloads onto
them.

## Hosting and deployment models

The first decision is who runs the infrastructure: a hosted API, a managed inference service, or self-hosted on infrastructure you control.
A hosted API (OpenAI, Anthropic, and similar) removes infrastructure work entirely and is the right default when the data involved has no sensitivity constraint and usage is variable enough that dedicated hardware would sit idle.
A managed inference service runs open-weight models on infrastructure you don't operate but do control.
Self-hosted inference runs the model on infrastructure inside your own boundary. It is the right choice when data cannot leave that boundary at all (see [why private inference](/library/65-why-private-inference.html)), or when usage is steady enough that dedicated hardware costs less than per-token pricing over time.
or when usage is consistent enough that dedicated hardware costs less than per-token pricing over time.

The decision follows from data sensitivity first and usage pattern second.
[Self-hosted or managed](/library/65-why-private-inference.html) works through that decision on its own, including the contractual position each option puts you in.

## Hardware: why VRAM is the binding constraint

For inference, the number that determines what you can run is VRAM.
A model's weights, plus the key-value cache that grows with context length and concurrent requests, both have to fit in GPU memory simultaneously.
A GPU with limited memory cannot run the model at all, regardless of other numbers.

NVIDIA remains the default choice for most deployments due to ecosystem maturity: CUDA support across every major inference framework, mature driver and monitoring tooling, and a used and cloud rental market deep enough to size capacity flexibly.
Alternatives exist: AMD, Apple Silicon, and a handful of Chinese vendors close the raw hardware gap in places but bring their own framework and container constraints, covered in full in [our GPU options guide](/library/78-gpu-market-2026.html).
Quantisation, running a model at reduced numerical precision, is common for managed or self-hosted deployments:
it can cut VRAM requirements substantially, as our own benchmark across [14 models on a single consumer GPU](https://marigold.run/blog/self-hosted-inference-benchmark.html) shows in practice.
Concurrency changes the arithmetic, because the KV cache grows with simultaneous requests while the weights do not: [sizing an inference deployment](/tools/vram-calculator.html) covers that calculation.

## Multi-machine and enterprise deployment

A single GPU may serve a single tenant's needs.
Beyond that, the questions change: how multiple machines share the load, how they communicate, and how access is controlled across them.
This is the territory people increasingly describe as "local AI" as opposed to a hosted API, and the term covers a range of setups rather than one architecture.

Networking between GPUs matters once a model or a workload spans more than one machine:
InfiniBand's low latency and high bandwidth matter for multi-GPU training but are usually unnecessary for inference-only deployments, where the bottleneck is serving throughput rather than inter-GPU communication.
Storage matters for model weights and checkpoints, which benefit from fast local disk rather than network storage.
Access control, authenticating model calls, and dispatching requests, is where most of the operational complexity in enterprise deployment exists.

## Serving software: how requests get dispatched

The last decision, and the one with the least public understanding, is the middleware between incoming requests and the model.
vLLM has become the default choice for multi-user, production inference, largely because of continuous batching and paged attention, which let it serve many concurrent requests against one loaded model with far less contention than naive request handling.
Ollama and direct HuggingFace `transformers` pipelines are simpler to run and well suited to single-user or low-concurrency use, local development, prototyping, personal deployment, but were not built for multi-user throughput.
Performance degrades once concurrent load increases.

We've run this comparison directly: [vLLM, Ollama, and Marigold on a single &pound;170 GPU](https://marigold.run/blog/llm-providers.html) covers the same three options with full telemetry, including the VRAM problem most benchmarks leave out.

## Matching systems to workload

Three recurring patterns cover most inference deployments, and each points to a different combination of the choices above.

**Batch document processing** (extracting, summarising, or classifying documents in bulk, with no one waiting on a live response) tolerates queuing.
A single GPU sized to the model's VRAM footprint is normally enough; there's no concurrent-user load to justify vLLM's operational overhead.

**Concurrent user-facing APIs** (a chat interface, an internal tool several people use at once) are the case vLLM exists for.
PagedAttention and continuous batching keep response times stable as concurrent requests increase.
Ollama and Marigolds one-request-at-a-time model degrades quickly under this load, regardless of hardware.

**Single-developer prototyping** (testing a model, building a workflow before a production decision has been made) doesn't need production-grade serving at all.
Ollama's simplicity outweighs its throughput ceiling here, and GPU choice matters less than reaching a working prototype quickly.

Mapping a project onto one of these three narrows the hardware and serving-software decision from four independent questions to one.

(Whether to run inference yourself, and how to do it compliantly, is covered on the [Sovereign AI](/sovereign-ai.html) page.)
