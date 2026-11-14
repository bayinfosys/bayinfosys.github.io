---
date: 2026-11-14
layout: article
title: "What Is a Private AI Server?"
seo_title: "What Is a Private AI Server? Hardware, Software and Costs"
description: "A private AI server runs open-weight models on hardware you control. What it contains, which models it can run, the three kinds of machine, the software, and what it costs."
keywords: ["private ai server", "what is a private ai server", "ai server", "local ai server", "on-premise ai server", "self-hosted ai server", "air-gapped ai", "llm server hardware"]
topic: "Infrastructure"
cta: private-inference
related:
  - 40-private-inference
  - 63-private-inference-stack
  - 114-unified-memory-machines-2026
  - 78-gpu-market-2026
  - 87-inference-infrastructure
  - 95-private-inference-costs
  - 64-marigold
---

# What Is a Private AI Server?

A private AI server is a computer you own or control that runs AI models itself, usually open-weight language models such as Llama, Mistral or Qwen. Prompts and documents are processed on that machine and never reach a model provider. It needs an internet connection only to download the models, and after that it can run with none.

It is the on-premise form of [private AI inference](/library/40-private-inference.html), and the strongest form of sovereign AI: no cloud provider is involved, so no third party holds the data and none can be compelled to hand it over. We cover what the machine contains, which models it can run, the three kinds of machine on the market, the software that serves the models, and what it costs to run.

## What a private AI server contains

Three parts decide what a private AI server can do.

**Memory for the model.** The model's weights, plus the key-value cache that grows with context length and concurrent users, must fit in the memory the GPU can use. This is the constraint that decides which models are possible. On a discrete GPU it is the card's VRAM; on a unified memory machine it is a share of one large pool.

**Memory bandwidth.** Generating each token reads every active weight once, so bandwidth sets a ceiling on how fast the model writes. Capacity decides what fits; bandwidth decides the speed.

**Serving software.** A program that loads the model, accepts requests over HTTP and queues or batches them. The choice depends on how many people use the server at once (covered below).

The CPU, system RAM and storage matter less. Fast local disk shortens model loading, and enough system RAM avoids swapping during load.

## Which models a private AI server can run

Memory decides the size of model that fits. The figures below assume 4-bit quantisation, the usual choice on a single server; a 7B model needs about 14GB at 16-bit precision and about 4GB at 4-bit.

| Memory available to the GPU | Language models it runs |
|---|---|
| 12 to 16GB | 13B to 14B |
| 24GB | 32B; 70B only with slow offload to system RAM |
| 48GB | 70B entirely in GPU memory |
| 96GB | 70B at 8-bit with room for context; 100B and above at 4-bit |
| 128GB (unified) | 70B dense, or mixture-of-experts models up to about 235B |
| 192 to 512GB (unified) | 405B to 671B |

For most document work (extraction, classification, summarisation, question-answering over an archive), models of 8B to 32B are enough, so a server with one or two GPUs covers it. The largest open-weight models need the bigger configurations. The [VRAM calculator](/tools/vram-calculator.html) sizes a specific model, context length and number of users. ([GPU options for local AI inference](/library/78-gpu-market-2026.html) has the full table, including image generation.)

## Three kinds of private AI server

| Kind | Memory | Strength | Constraint | Read more |
|---|---|---|---|---|
| Workstation or server with discrete GPUs | 24GB to 96GB per card | High bandwidth; fastest prompt processing; standard Linux containers | Capacity per card; more cards for large models | [GPU options](/library/78-gpu-market-2026.html) |
| Unified memory machine | 64GB to 512GB in one box | Very large models on a desk | Bandwidth well below a discrete GPU; container support varies | [Unified memory machines](/library/114-unified-memory-machines-2026.html) |
| Rack server with data-centre GPUs | 80GB to 192GB per card | Throughput for many users | Enterprise sales channels and lead times; renting is usually more practical | [GPU options](/library/78-gpu-market-2026.html) |

**A workstation or server with discrete GPUs** is the common choice. A used RTX 3090 (24GB) on x86-64 Linux runs 32B models, two of them run 70B, and the RTX PRO 6000 Blackwell holds 96GB on one card. NVIDIA remains the simplest software path; AMD cards run under ROCm on x86-64 Linux with a thinner catalogue of container images.

**A unified memory machine** shares one memory pool between CPU and GPU. The DGX Spark and other GB10 machines, AMD's Ryzen AI Max+ mini PCs and Apple's Mac Studio hold 64GB to 512GB, enough for models no consumer GPU can load. Their bandwidth (256GB/s to 1.2TB/s) is well below a high-end discrete card, so dense 70B models run slowly on most of them, while mixture-of-experts models, which read only part of their weights per token, run well. The operating system decides how much work a server stack takes: AMD's machines run standard x86-64 containers, GB10 machines need Arm64 images, and macOS gives containers no access to the GPU.

**A rack server with data-centre GPUs** (A100, H100 and newer) serves many concurrent users. Buying new cards outside enterprise channels is rarely realistic, so most organisations rent this class of hardware by the hour, which moves the deployment from a private server into a cloud account.

## The software on a private AI server

The serving software decides how many people the server can handle at once. ([How to self-host an LLM](/library/63-private-inference-stack.html) compares the options layer by layer.)

- **Ollama and llama.cpp** suit one user or a small team: simple to install, efficient with quantised models, and limited under concurrent load.
- **vLLM** suits an API with many simultaneous users, through continuous batching and PagedAttention.
- **marigold**, Bay Information Systems' open-source platform, suits a server shared by several applications and model types (text, embeddings, images, speech), with requests queued and composed into typed pipelines.

All three expose OpenAI-compatible endpoints, so applications written for a hosted API point at the server by changing one address, and the serving software can change later without touching them.

## Running a private AI server without a network connection

An air-gapped server downloads its models once, while connected, and then runs with no connection at all. Three things need planning for that to hold:

- Container images and software packages are built or mirrored before the machine is disconnected.
- Model updates arrive through a controlled transfer, which also means the model version changes only when you decide.
- Monitoring and logs stay on the local network.

marigold follows this pattern: downloading the declared models is the only step that needs the internet.

## What a private AI server costs to run

The hardware is the main cost. Running costs are small: on a single RTX 3060, 14 open-weight models answered 1,204 requests for 226 watt-hours of electricity, about 5.6p ([what private inference costs](/library/95-private-inference-costs.html)). Prices for GPUs and unified memory machines rose through 2026 with the cost of memory, so any figure should be checked against a live listing ([unified memory machines](/library/114-unified-memory-machines-2026.html) lists late 2026 prices).

Against a hosted API, a private server pays off when the data cannot leave the building at all, or when usage is steady enough to keep the GPU busy, which usually happens above a few million tokens a day. At low or irregular volume, the API costs less.

## Buy, rent or build

A private AI server can be bought and run by your own team, built and installed by a supplier, or replaced by GPU instances in your own cloud account where the data may sit with a cloud provider. The first keeps everything in-house and needs someone to operate it. The second hands over a working machine with the operating knowledge. The third trades the fixed cost for an hourly one and brings the cloud provider's jurisdiction with it. ([AI inference infrastructure](/library/87-inference-infrastructure.html) compares owned servers, dedicated hosting and cloud instances.)

## How to choose a private AI server

We can reduce the choice to three questions.

**Which models must it run?** Size the weights and the cache first. That rules configurations in or out before anything else.

**How many people will use it at once?** One user or a pipeline suits Ollama or a queue on modest hardware. Many simultaneous users need vLLM and a GPU with the bandwidth to serve them.

**Which software has to run on it?** If the same containers must run on the server and in the cloud, an x86-64 Linux machine with an NVIDIA or AMD GPU runs them unchanged, and a GB10 machine runs them with Arm64 builds. A Mac runs the model server as a native process beside the containers.

Memory decides which models a private AI server can hold, and the serving software decides how many people it can serve. The rest of the specification follows from those two. (Bay Information Systems sizes, installs and configures private AI servers running marigold; see [sovereign and on-premise AI](/sovereign-ai.html).)
