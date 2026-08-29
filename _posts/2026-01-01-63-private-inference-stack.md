---
date: 2026-05-07
layout: article
title: "The Private Inference Stack: A Field Guide"
description: "From raw PyTorch to managed private API services. What each layer of the inference stack does, where the tools come from, and how they relate."
keywords: ["private inference", "ollama", "vllm", "pytorch", "huggingface", "self-hosted llm", "inference stack", "open-weight models"]
topic: "Architecture & Deployment"
seo_title: "Ollama vs vLLM vs Managed Providers: The Private Inference Stack Explained"
related:
  - 40-private-inference
  - 87-inference-infrastructure
  - 02-deploy-simple-model
  - 04-cost-of-ml
  - 32-training-llm
  - 72-private-inference-fhe
---

# The Private Inference Stack: A Field Guide

Running an AI model privately means choosing where in the
stack to operate. The options range from raw framework code through
purpose-built inference servers to fully managed private API services.
Each layer trades control for convenience, and each has a natural home
in a particular kind of project.

## A brief history of the framework layer

Before the current tooling existed, running a model meant working directly
with one of several deep learning frameworks.

**Caffe**, released in 2013, was one of the
first frameworks to gain broad adoption. It was fast on image tasks,
written in C++, and distributed pre-trained weights through a Model Zoo --
a convention that every subsequent tool would borrow. Facebook extended
it as Caffe2 before eventually folding it into PyTorch.

**TensorFlow** arrived from Google Brain in 2015. The initial design used
static computation graphs. Deployment was efficient but development was awkward.
Keras, written by Francois Chollet, became the dominant high-level interface over
TensorFlow, eventually absorbed as its official API in TensorFlow 2.0.
TensorFlow remains in production use, particularly within Google, but share of new projects has fallen sharply.

**PyTorch**, released by Facebook's AI Research lab in 2016, used dynamic
computation graphs -- more intuitive and easier to debug.
Research communities adopted it quickly and it now dominates both academic work
and a substantial share of production systems.

**MXNet**, backed by Amazon and donated to the Apache Software Foundation,
competed for several years and was integrated into AWS infrastructure. It
retired in September 2023 after development activity effectively ceased.
Amazon shifted its own tooling to PyTorch.

The framework consolidation matters because the current tools are all
built on top of PyTorch, and the weight distribution ecosystem that
emerged -- HuggingFace Hub -- is the source most of them draw from.

## Layer 1: Raw framework code

The lowest layer is direct use of PyTorch with the HuggingFace
`transformers` library. HuggingFace Hub hosts model weights from most
major open-weight families (Llama, Mistral, Qwen, Falcon, and many
others) alongside the code to load and run them. A few lines of Python
loads a model and runs inference:

```python
from transformers import pipeline
pipe = pipeline("text-generation", model="meta-llama/Llama-3.2-3B-Instruct")
result = pipe("Summarise the following document:")
```

This layer gives you complete control: arbitrary model surgery,
custom sampling strategies, direct access to logits and attention weights,
integration with training pipelines. It also gives you complete
responsibility: batching, memory management, concurrency, and serving
are all your problems. This is the right layer for researchers, for
fine-tuning workflows, and for anything that requires access to model
internals.

## Layer 2: Ollama

Ollama wraps llama.cpp, a C++ inference library that runs models in GGUF
format. GGUF is a quantised weight format: the model weights are
compressed and stored in a structure that allows efficient loading and
fast inference, often without a GPU. A Llama 8B model that requires
around 16GB of GPU memory in full precision fits in 5-6GB in 4-bit
quantised GGUF.

Ollama distributes models from its own library (ollama.com/library),
which re-packages models from HuggingFace into GGUF format. Installation
is a single command; pulling a model is `ollama pull llama3.2`. It
exposes an OpenAI-compatible HTTP API on localhost, so application code
written against the OpenAI SDK works against Ollama without changes.

The appropriate use is local development and low-volume deployment.
Ollama serves one request at a time without batching. At any meaningful
request volume that ceiling becomes a bottleneck. It is the right tool
for a developer working on a prototype, a single-user application, or
a workflow being tested before a production decision has been made.

## Layer 3: vLLM

vLLM is a production inference server. It loads models directly from
HuggingFace Hub in standard PyTorch format and serves them via an
OpenAI-compatible API. The central technical contribution is
PagedAttention: a memory management approach for the key-value cache
that allows the server to handle many concurrent requests efficiently
on the same GPU. Combined with continuous batching -- processing requests
as they arrive rather than waiting to fill a fixed batch -- vLLM
sustains substantially higher throughput than llama.cpp-based servers
on the same hardware.

The tradeoff is operational. vLLM is a service that requires deployment,
monitoring, and maintenance. It expects a GPU with sufficient VRAM for
the model weights in full or bfloat16 precision -- the quantisation
efficiency of GGUF is not its focus. GPU instances on AWS (g4dn, g5, p4)
or equivalent are the natural home.

The practical boundary between Ollama and vLLM is workload. Development
and testing sit comfortably on Ollama. A production service handling
concurrent users, a pipeline processing documents in bulk, or an
application with latency requirements at scale warrants vLLM. Application
code typically moves between them without changes, because both expose
the same API surface.

Marigold packages this same self-hosted layer with typed pipeline definitions and a declarative workflow engine on top, for teams that want the orchestration a managed service would normally provide without handing the inference itself to one. See our [Marigold](https://marigold.run) platform for more options.

## Layer 4: Managed private inference services

Above the self-hosted layer, a range of managed services host open-weight
models on GPU infrastructure and expose them via API. They split into two
meaningfully different categories.

**API inference providers** -- Together AI, Groq, Cerebras, DeepInfra,
Fireworks AI -- serve open-weight models over a shared API. Your data
passes through their servers, but because the underlying models are
public weights, the claim "we do not train on your data" is auditable
in a way it is not with closed-model providers: you can run the same
Llama or Qwen weights locally and verify that outputs match the API.
These providers compete on infrastructure speed rather than model
exclusivity, and they are appropriate for organisations that want API
convenience with the option to migrate to self-hosted later. They are
not appropriate where the constraint is data egress itself.

**Private deployment services** -- HuggingFace Inference Endpoints with
private networking, Baseten with region-locked HIPAA and SOC 2 Type II
certified deployments, Scaleway for EU-only data residency -- run
inference on dedicated infrastructure within a defined boundary. Your
data does not share infrastructure with other customers and does not
leave the agreed region. The provider's compliance posture substitutes
for your own, which is useful for organisations without a GPU operations
capability but with genuine data sovereignty requirements. The cloud
providers offer equivalent options: AWS SageMaker with private VPC
endpoints, Azure AI in a managed VNet.

The simplest way to distinguish the two categories: with an API inference
provider, your data travels to their infrastructure. With a private
deployment service, your data stays within a boundary you have
contractually defined. For regulated sectors, that distinction is
usually determinative.

## Choosing a layer

The choice follows from context rather than preference. A developer
testing locally uses Ollama. A production system with concurrent users
and volume runs vLLM. An organisation with data sovereignty requirements
and no GPU operations team uses a managed private provider.

Most production systems pass through more than one layer: Ollama in
development, vLLM or a managed service in production, with the same
application code throughout because the API surface is consistent. The
transition between layers is an operational decision.
