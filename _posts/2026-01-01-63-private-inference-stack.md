---
date: 2026-05-07
last_modified_at: 2026-11-14
layout: article
title: "How to Self-Host an LLM: llama.cpp, Ollama, vLLM or a Managed Endpoint"
seo_title: "Self-Hosted LLMs: llama.cpp, Ollama, vLLM or a Managed Endpoint?"
description: "How to self-host an LLM, layer by layer: llama.cpp and Ollama for development, vLLM for concurrent traffic, a platform for several applications on one GPU, or a managed private endpoint."
keywords: ["self hosted llm", "how to self host an llm", "self-hosted llm", "ollama vs vllm", "llama.cpp", "vllm", "local llm server", "private llm", "open-weight models"]
topic: "Architecture & Deployment"
related:
  - 40-private-inference
  - 117-private-ai-server
  - 87-inference-infrastructure
  - 64-marigold
  - 78-gpu-market-2026
  - 72-private-inference-fhe
---

# How to Self-Host an LLM: llama.cpp, Ollama, vLLM or a Managed Endpoint

Self-hosting an LLM means choosing a layer of the stack to work at. The layers run from raw framework code, through inference servers that run on a laptop or a GPU server, to managed services that host open-weight models inside a boundary you define. Each layer trades control for convenience, and each has a natural home in a particular kind of project.

| Layer | Tools | Concurrent users | Hardware | Best for |
|---|---|---|---|---|
| 1. Framework code | PyTorch and Hugging Face `transformers` | You build it | Any GPU | Research, fine-tuning, access to model internals |
| 2. Local inference server | llama.cpp, Ollama | A few | Laptop, workstation, CPU or GPU; quantised GGUF models | Development, prototypes, single-user tools |
| 3. Production inference server | vLLM | Many | GPU server with room for weights and KV cache | APIs with concurrent users, bulk processing |
| 3a. Self-hosted platform | marigold | Queued, shared across applications | One or more GPU hosts | Several applications and model types on the same GPUs |
| 4. Managed private endpoint | Hugging Face Inference Endpoints, Baseten, AWS SageMaker | Many | Supplier's dedicated infrastructure | Sovereignty requirements without a GPU operations team |

All of these build on PyTorch, which absorbed or outlasted the earlier frameworks (Caffe, TensorFlow's static graphs, MXNet), and most draw their weights from Hugging Face Hub. That shared base is why application code moves between layers with little change.

## Layer 1: Framework code

The lowest layer is direct use of PyTorch with the Hugging Face `transformers` library. Hugging Face Hub hosts weights from most open-weight families (Llama, Mistral, Qwen and many others) alongside the code to load and run them. A few lines of Python load a model and run inference:

```python
from transformers import pipeline
pipe = pipeline("text-generation", model="meta-llama/Llama-3.2-3B-Instruct")
result = pipe("Summarise the following document:")
```

This layer gives complete control: custom sampling, direct access to logits and attention weights, integration with training pipelines. It also gives complete responsibility. Batching, memory management, concurrency and serving are all yours to build. It is the right layer for researchers, for fine-tuning, and for anything that needs the model's internals.

## Layer 2: llama.cpp and Ollama

llama.cpp is a C++ inference library that runs models in GGUF format. GGUF stores quantised weights in a structure that loads quickly and runs efficiently, often without a GPU. A Llama 8B model that needs around 16GB of GPU memory at full precision fits in 5 to 6GB as a 4-bit GGUF.

Ollama wraps llama.cpp and distributes models from its own library, repackaged from Hugging Face. Installation is one command, and pulling a model is `ollama pull llama3.2`. It exposes an OpenAI-compatible HTTP API on localhost, so code written against the OpenAI SDK runs against Ollama unchanged.

This layer suits local development and low-volume deployment. Ollama handles a few requests in parallel (the number is configurable), and it was built for one person's machine: throughput falls away as concurrent load grows. It is the right tool for a developer building a prototype, a single-user application, or a workflow under test before a production decision.

## Layer 3: vLLM

vLLM is a production inference server. It loads models from Hugging Face Hub in standard PyTorch format and serves them through an OpenAI-compatible API. Its central contribution is PagedAttention, a way of managing the key-value cache that lets one GPU hold many concurrent requests efficiently. With continuous batching (adding requests to the running batch as they arrive), vLLM sustains much higher throughput than llama.cpp-based servers on the same hardware.

The cost is operational. vLLM is a service to deploy, monitor and maintain, and it expects a GPU with room for the model's weights at full or bfloat16 precision plus the cache. GPU instances on AWS (g5, p4) or a private AI server are its natural home. ([What a private AI server is](/library/117-private-ai-server.html) covers the hardware.)

The boundary between Ollama and vLLM is workload. Development and testing sit comfortably on Ollama. A production service with concurrent users, a pipeline processing documents in bulk, or an application with latency targets at scale warrants vLLM. Application code moves between them without changes, because both expose the same API.

### A platform over the serving layer: marigold

[marigold](/library/64-marigold.html), Bay Information Systems' open-source platform, sits over this layer for teams running more than one application or model type on the same hardware. Requests join a queue in Postgres, each worker loads one model at a time and serves whichever model has the deepest queue, and adding a GPU host adds a worker. Models are declared per application and downloaded once into a shared cache, and the platform covers embeddings, image, speech and evaluation models as well as text generation, composed into typed pipelines. It exposes OpenAI-compatible chat and embedding endpoints. For one chat model under heavy concurrent load, vLLM serves more users per GPU.

## Layer 4: Managed private endpoints

Above the self-hosted layers, managed services host open-weight models on GPU infrastructure and expose them through an API. They divide into two categories, separated by where the data goes.

**API inference providers** (Together AI, Groq, Cerebras, DeepInfra, Fireworks AI) serve open-weight models over a shared API. Your data passes through their servers. Because the models are public weights, the claim that they do not train on your data is checkable: the same weights run locally should give matching outputs. These providers compete on speed, and they suit organisations that want API convenience with the option of moving to self-hosting later. They do not suit work where the constraint is data egress itself.

**Private deployment services** (Hugging Face Inference Endpoints with private networking, Baseten with region-locked HIPAA and SOC 2 Type II deployments, Scaleway for EU-only residency) run inference on dedicated infrastructure within a defined boundary. Your data shares no infrastructure with other customers and stays in the agreed region. The provider's compliance posture stands in for your own, which helps organisations with real sovereignty requirements and no GPU operations team. The cloud providers offer equivalents: AWS SageMaker with private VPC endpoints, Azure AI in a managed VNet.

With an API inference provider, your data travels to their infrastructure. With a private deployment service, it stays within a boundary set by contract. For regulated sectors, that distinction usually decides the matter. ([What private AI inference is](/library/40-private-inference.html) sets out the boundary and who provides it.)

## Choosing a layer

The choice follows from context. A developer testing locally uses Ollama. A production system with concurrent users runs vLLM. Several applications sharing one GPU, or pipelines that mix model types, suit a platform such as marigold. An organisation with sovereignty requirements and no GPU operations team uses a managed private endpoint.

Most production systems pass through more than one layer: Ollama in development, vLLM, a platform or a managed service in production, with the same application code throughout because the API is the same. Moving between layers is an operational decision, which leaves the application free to follow the workload. (Sizing the hardware for any of them is covered in [AI inference infrastructure](/library/87-inference-infrastructure.html).)
