---
layout: article
title: "The Private Inference Stack: A Field Guide"
description: "From raw PyTorch to managed private API services. What each layer of the inference stack does, where the tools come from, and how they relate."
keywords: ["private inference", "ollama", "vllm", "pytorch", "huggingface", "self-hosted llm", "inference stack", "open-weight models"]
topic: "Architecture & Deployment"
last_modified_at: 2026-05-07
seo_title: "Ollama vs vLLM vs Managed Providers: The Private Inference Stack Explained"
related:
  - 40-private-inference
  - 02-deploy-simple-model
  - 04-cost-of-ml
  - 32-training-llm
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

## Layer 4: Managed private inference services

Above the self-hosted layer sit managed private inference services:
providers that run inference infrastructure on your behalf within a
defined, compliant boundary. The essential property is that your data
does not leave that boundary -- requests are not logged for training,
not processed by third-party telemetry, not visible to the model
provider's operations team. The provider's compliance posture (SOC 2,
ISO 27001, or sector-specific certifications) covers the infrastructure
rather than your own.

This matters in regulated environments. A healthcare organisation cannot
send patient data to a public API endpoint regardless of what the
provider's data processing agreement says. A law firm cannot route
confidential correspondence through an external service. A managed
private provider inserts a compliant infrastructure layer without
requiring the organisation to operate GPU hardware itself.

The tradeoff is that you depend on the provider's compliance posture
and infrastructure reliability rather than your own. For organisations
without a GPU operations capability, or where the compliance requirement
is the constraint rather than cost, this is often the correct trade.

[Marigold](https://marigold.run) operates at this layer,
adding typed pipeline definitions, a declarative workflow engine, and
an eval surface above the inference backend. Where a raw managed
inference API returns completions, Marigold defines tasks, composes
multi-step pipelines, measures outputs against labelled datasets, and
accumulates corrections from production runs. The inference layer and
the pipeline layer are separate concerns; Marigold addresses the second
once the first is in place.

## Choosing a layer

The choice follows from context rather than preference. A developer
testing locally uses Ollama. A production system with concurrent users
and volume runs vLLM. An organisation with data sovereignty requirements
and no GPU operations team uses a managed private provider.

Most production systems pass through more than one layer: Ollama in
development, vLLM or a managed service in production, with the same
application code throughout because the API surface is consistent. The
transition between layers is an operational decision.
