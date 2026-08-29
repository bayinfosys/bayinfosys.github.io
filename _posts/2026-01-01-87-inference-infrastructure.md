---
date: 2026-07-15
layout: article
title: "AI Inference Infrastructure: A Decision Framework"
seo_title: "How to Choose AI Inference Infrastructure for Production (2026 Guide)"
description: "How to choose AI inference infrastructure for production: hosted vs. self-hosted, sizing GPUs by VRAM, and serving software like vLLM for handling many concurrent API users. A four-part decision framework."
keywords: ["ai inference infrastructure", "ai inference infrastructure best
practices", "ai inference hosting", "ai inference deployment", "ai inference
servers", "ai model inference hosting", "ai inference api", "local ai",
"vllm", "gpu vram inference"]
topic: "Architecture & Deployment"
related:
  - 40-private-inference
  - 63-private-inference-stack
  - 65-why-private-inference
  - 04-cost-of-ml
---

# AI Inference Infrastructure: A Decision Framework

Getting a model into production raises four largely independent
decisions: where it runs, what hardware it runs on, how it scales
past one machine, and what software dispatches requests to it. Teams
new to the problem tend to research these as one question, which is
why the advice is usually either too shallow to act on or too deep
to be relevant yet. Each decision is worth understanding at the level
that actually determines the next step.

## Hosting and deployment models

The first decision is who runs the infrastructure: a hosted API, a managed inference service, or self-hosted on infrastructure you control.
A hosted API (OpenAI, Anthropic, and similar) removes infrastructure work entirely and is the right default when the data involved has no sensitivity constraint and usage is variable enough that dedicated hardware would sit idle.
A managed inference service runs open-weight models on infrastructure you don't operate but do control.
Self-hosted inference runs the model on infrastructure inside your own boundary, is the right choice when data cannot leave that boundary at all (see: [why private inference](/library/65-why-private-inference.html))
or when usage is consistent enough that dedicated hardware costs less than per-token pricing over time.

None of these is universally correct.
The decision follows from data sensitivity and usage pattern, in that order, not from which option is newest or best-known.

## Hardware: why VRAM is the binding constraint

For inference, the number that determines what you can run is VRAM.
A model's weights, plus the key-value cache that grows with context length and concurrent requests, both have to fit in GPU memory simultaneously.
A GPU with limited memory cannot run the model at all, regardless of other numbers.

NVIDIA remains the default choice for most deployments due to ecosystem maturity: CUDA support across every major inference framework, mature driver and monitoring tooling, and a used and cloud rental market deep enough to size capacity flexibly.
Alternatives exist: AMD, Apple Silicon, and a handful of Chinese vendors close the raw hardware gap in places but bring their own framework and container constraints, covered in full in [our GPU options guide](/library/78-gpu-market-2026.html).
Quantisation, running a model at reduced numerical precision, is common for managed or self-hosted deployments:
it can cut VRAM requirements substantially, as our own benchmark across [14 models on a single consumer GPU](https://marigold.run/blog/self-hosted-inference-benchmark.html) shows in practice.

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

We've run this comparison directly: [vLLM, Ollama, and Marigold on a single £170 GPU](https://marigold.run/blog/llm-providers.html) covers the same three options with full telemetry, including the VRAM problem most benchmarks leave out.

## Matching systems to workload

Three recurring patterns cover most inference deployments, and each points to a different combination of the choices above.

**Batch document processing** (extracting, summarising, or classifying documents in bulk, with no one waiting on a live response) tolerates queuing.
A single GPU sized to the model's VRAM footprint is normally enough; there's no concurrent-user load.
There is no concurrent-user load to justify vLLM's operational overhead.

**Concurrent user-facing APIs** (a chat interface, an internal tool several people use at once) are the case vLLM exists for.
PagedAttention and continuous batching keep response times stable as concurrent requests increase.
Ollama and Marigolds one-request-at-a-time model degrades quickly under this load, regardless of hardware.

**Single-developer prototyping** (testing a model, building a workflow before a production decision has been made) doesn't need production-grade serving at all.
Ollama's simplicity outweighs its throughput ceiling here, and GPU choice matters less than reaching a working prototype quickly.

Mapping a project onto one of these three narrows the hardware and serving-software decision from four independent questions to one.

(If you're weighing hosted against self-hosted inference for a specific workload, [get in touch](/contact) to talk through the tradeoff.)
