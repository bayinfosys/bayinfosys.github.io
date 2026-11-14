---
date: 2026-07-15
last_modified_at: 2026-11-14
layout: article
title: "AI Inference Infrastructure: A Decision Framework"
seo_title: "AI Inference Infrastructure: Choosing Hosting, GPUs and Serving Software"
description: "Best practices for AI inference infrastructure: hosting, GPUs and VRAM, dedicated servers or cloud instances, serving software for concurrent users, reliability, and integration with existing systems."
keywords: ["ai inference infrastructure", "ai inference infrastructure best practices", "best infrastructure for ai inference", "inference servers", "ai inference hosting", "ai inference deployment", "dedicated inference servers", "vllm", "gpu vram inference"]
topic: "Architecture & Deployment"
related:
  - 40-private-inference
  - 117-private-ai-server
  - 63-private-inference-stack
  - 65-why-private-inference
  - 78-gpu-market-2026
  - 114-unified-memory-machines-2026
  - 95-private-inference-costs
---

# AI Inference Infrastructure: A Decision Framework

The best infrastructure for AI inference follows from three facts: how sensitive the data is, how steady the traffic is, and how many users wait on a response at once. Those three facts settle four decisions. Who hosts the model (a hosted API, a managed service, or servers you control). Which GPU, where memory is the constraint. How load spreads across machines once one is not enough. And which serving software queues and batches the requests.

We take the four decisions in turn, then cover reliability, integration with existing systems, and the practices that hold across all of them.

## The options at a glance

| Category | Examples | Where it runs | Suits |
|---|---|---|---|
| Hosted model API | OpenAI, Anthropic, Google | The provider's servers | Data with no sensitivity constraint; variable usage |
| Open-weight API provider | Together AI, Groq, Fireworks AI, DeepInfra | The provider's shared servers | API convenience with open weights, where data egress is acceptable |
| Managed private deployment | Hugging Face Inference Endpoints with private networking, Baseten, AWS SageMaker private endpoints, Azure AI in a managed VNet | Dedicated infrastructure in an agreed region | Sovereignty requirements without a GPU operations team |
| Self-hosted serving engine | vLLM, Ollama, llama.cpp | Your servers or your cloud account | Data that cannot leave; steady volume |
| Self-hosted platform | [marigold](/library/64-marigold.html) | Your servers or your cloud account | Several applications and model types sharing GPUs; typed pipelines |

Every self-hosted option in the table exposes an OpenAI-compatible inference API, so the choice between them can change later without rewriting the applications that call them.

## Hosting: who runs the model

The first decision is who runs the infrastructure. A hosted API (OpenAI, Anthropic and similar) removes infrastructure work entirely, and it is the right default when the data has no sensitivity constraint and usage varies enough that dedicated hardware would sit idle. A managed inference service runs open-weight models on dedicated infrastructure that a supplier operates under terms you set by contract. Self-hosted inference runs the model inside your own boundary.

Self-hosting is the right choice in two cases: when the data cannot leave that boundary at all, or when usage is steady enough that dedicated hardware costs less than per-token pricing, which usually happens above a few million tokens a day. Data sensitivity decides first and the usage pattern second. ([What private AI inference is](/library/40-private-inference.html) covers the boundary in detail, and [why private inference](/library/65-why-private-inference.html) the risks that drive it.)

## Dedicated inference servers or cloud GPU instances

Once the model runs inside your boundary, the hardware is either bought or rented.

**Owned servers** turn inference into a fixed cost. They give the most control, run on your premises with no cloud provider involved, and can run with no network connection once the models are downloaded. They also make you responsible for power, cooling, spares and replacement. ([What a private AI server is](/library/117-private-ai-server.html) covers the hardware choices.)

**Cloud GPU instances in your own account** bill by the hour and scale with demand. AWS g5 and p4 instances, and their Azure and Google equivalents, run inside the network rules, access controls and logging you already operate. The cloud provider's jurisdiction applies. For intermittent work that needs a lot of memory, renting from GPU clouds such as Lambda, RunPod or Vast.ai is usually the practical option.

**Dedicated server hosting** sits between the two: bare-metal GPU servers in a provider's data centre, reserved for you on a monthly contract.

The choice follows the traffic. Steady, predictable load favours owned or dedicated servers. Load that rises and falls favours instances that can be stopped.

## Hardware: why VRAM is the binding constraint

For inference, the number that determines what you can run is VRAM. A model's weights, plus the key-value cache that grows with context length and concurrent requests, both have to fit in GPU memory at the same time. A GPU with too little memory cannot run the model at all, whatever its other specifications.

NVIDIA remains the default for most deployments because of ecosystem maturity: CUDA support across every major inference framework, mature driver and monitoring tooling, and used and rental markets deep enough to size capacity flexibly. AMD and Apple Silicon close the hardware gap in places but bring their own framework and container constraints, set out in [GPU options for local AI inference](/library/78-gpu-market-2026.html). Unified memory machines hold far more weights in one box at lower bandwidth ([unified memory machines](/library/114-unified-memory-machines-2026.html)).

Quantisation, running a model at reduced numerical precision, cuts VRAM requirements substantially; the [marigold benchmark across 14 models on one consumer GPU](https://marigold.run/blog/self-hosted-inference-benchmark.html) shows it in practice. Concurrency changes the arithmetic, because the KV cache grows with simultaneous requests while the weights do not. The [VRAM calculator](/tools/vram-calculator.html) does that calculation.

## Serving software and concurrent users

For an API with many concurrent users, the serving software matters as much as the GPU. vLLM has become the default for multi-user production inference because of continuous batching and PagedAttention, which let it serve many simultaneous requests against one loaded model with far less contention than naive request handling. Response times stay stable as concurrent requests rise.

Ollama and llama.cpp are simpler to run. They handle a few requests in parallel and suit local development, prototyping and single-user deployments, and throughput falls away as concurrent load grows.

marigold takes a different shape. Requests join a queue in Postgres, and each worker loads one model at a time; adding a GPU host adds a worker. That design lets many applications and model types (text, embeddings, images, speech) share the same GPUs and run as typed pipelines. A single chat model under heavy concurrent load is vLLM's case, and vLLM serves more users per GPU there. ([vLLM, Ollama and marigold on a single GBP 170 GPU](https://marigold.run/blog/llm-providers.html) compares the three with full telemetry.)

## Multi-machine and enterprise deployment

A single GPU may serve one team. Beyond that, the questions become how machines share load, how they communicate, and how access is controlled across them.

Networking between GPUs matters once a model spans more than one machine. InfiniBand's latency and bandwidth matter for multi-GPU training and are usually unnecessary for inference-only deployments, where the bottleneck is serving throughput. Model weights belong on fast local disk. Access control (authenticating model calls and dispatching requests) is where most of the operational complexity of enterprise deployment sits.

## Reliability and efficiency

**Reliability** comes from removing single points of failure and making failure visible:

- Run at least two GPU hosts or workers where downtime matters, so one failure slows the service without stopping it.
- Put a queue in front of the model, so requests wait through a restart.
- Route data that allows it to a hosted API as a fallback during an outage.
- Pin model versions. An open-weight model is a set of files, and the version you tested stays in production until you change it.
- Monitor latency, queue depth and GPU memory, and alert on all three.

**Efficiency** is mostly utilisation. A GPU costs the same whether it is busy or idle, so cost per request falls as utilisation rises. Batching (vLLM's main contribution) raises throughput per GPU, quantisation fits larger models or more concurrent requests into the same memory, and capping output length shortens requests. In the 14-model benchmark, output length predicted request time better than parameter count did.

## Integrating with existing infrastructure

OpenAI-compatible endpoints make integration mostly a configuration change. Applications, SDKs and tools such as Open WebUI, LangChain and LangGraph point at a new base URL and keep working. (Feature support varies between servers: marigold, for example, returns streamed responses without token-level streaming.)

Put your own gateway in front of the inference servers. It handles authentication against the identity system you already run, per-application credentials and rate limits, and request logging under your retention rules. Deploy the servers inside the existing network boundary (a VPC on AWS), so the model is reached the same way as any internal service, and send its metrics to the monitoring you already have.

## Matching systems to workload

Three recurring patterns cover most inference deployments, and each points to a different combination of the choices above.

**Batch document processing** (extracting, summarising or classifying documents in bulk, with no one waiting on a live response) tolerates queuing. A single GPU sized to the model's VRAM footprint is normally enough, and a queue-based platform such as marigold fits the work.

**Concurrent user-facing APIs** (a chat interface, an internal tool several people use at once) are the case vLLM exists for. PagedAttention and continuous batching keep response times stable as concurrent requests increase.

**Single-developer prototyping** (testing a model or building a workflow before a production decision) does not need production serving at all. Ollama's simplicity outweighs its throughput ceiling, and GPU choice matters less than reaching a working prototype quickly.

## Best practices for production inference

The decisions above reduce to eight practices:

1. Decide hosting from data sensitivity first and usage second.
2. Size GPU memory for the weights plus the KV cache at peak concurrency.
3. Choose serving software for the concurrency you expect: vLLM for many simultaneous users, a queue for batch work, Ollama for one developer.
4. Expose an OpenAI-compatible endpoint behind your own gateway, so applications never depend on a particular backend.
5. Pin model versions, and test a new version against your own labelled examples before switching ([how to evaluate an AI pipeline](/library/61-eval-datasets.html)).
6. Run at least two hosts or workers where downtime matters, with a queue in front.
7. Measure cost per request from telemetry, which catches faults a wattage estimate hides ([what private inference costs](/library/95-private-inference-costs.html)).
8. Treat prompts in logs as the data they contain, with retention and access rules to match.

Each practice follows from one of the three facts at the start: the sensitivity of the data, the shape of the traffic, and the number of people waiting. A project that has answered those three has made most of its infrastructure decisions already.

(Whether to run inference yourself, and how to do it compliantly, is covered on the [sovereign AI](/sovereign-ai.html) page.)
