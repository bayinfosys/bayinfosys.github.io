---
date: 2026-04-15
layout: article
title: "What Is Private AI Inference?"
seo_title: "What Is Private AI Inference? Running AI on Your Own Servers"
description: "Private inference runs AI models on infrastructure you control, so prompts and documents never reach a model provider. How it works, what a private AI server is, and what it costs."
keywords: ["private inference", "private ai inference", "private ai server", "private ai infrastructure", "self-hosted llm", "on-premise ai", "open weight models", "aws vpc"]
topic: "Architecture & Deployment"
cta: private-inference
related:
  - 63-private-inference-stack
  - 65-why-private-inference
  - 87-inference-infrastructure
  - 66-open-weights-separate-concerns
  - 72-private-inference-fhe
  - 64-marigold
  - 80-falling-token-prices
---

# What Is Private AI Inference?

Private inference means running an AI model on infrastructure you control: your own servers, your own cloud account, or a dedicated deployment run for you. Prompts and documents go to the model and the answers come back without passing through a model provider such as OpenAI or Anthropic. (For organisations deciding where their models should run, [sovereign and on-premise AI](/sovereign-ai.html) sets out the options and how we help.)

Regulated sectors need it most. A team builds a prototype on a cloud API, legal or compliance reviews the architecture, and the prototype stops there, because the data cannot leave the organisation. Health data under NHS frameworks, financial data under FCA conduct rules and client data under confidentiality agreements cannot go to an external API endpoint, whatever the provider's data processing agreement says.

## How does private inference work?

A cloud AI API bundles the model with the infrastructure it runs on. A request travels to the provider's servers, runs against the provider's model, and comes back.

Open-weight models separate the two. Llama, Mistral, Qwen and others publish their weights (the files that make up the model), and any organisation can download them and run them on its own hardware. The model then runs where the data already is, and the provider drops out of the arrangement.

## What is a private AI server?

A private AI server is a machine you own, on your own premises, running open-weight models. A server with one or two GPUs runs the smaller models that handle most document work; the largest open-weight models need several GPUs. It needs an internet connection only to download the models, and after that it can run with no connection at all. No cloud provider is involved, so no third party holds the data. (Sizing guidance: [GPU options for self-hosted inference](/library/78-gpu-market-2026.html).)

## Private inference in your cloud account

On AWS, private inference means deploying the model inside a Virtual Private Cloud (VPC): the same network boundary that already governs the organisation's databases, application servers and storage. A prompt containing patient data, transaction history or confidential correspondence stays inside that boundary, and so does the response. The cloud provider's jurisdiction still applies.

The work is familiar: choose a model, provision GPU instances with enough memory for its weights, containerise the inference server and deploy it inside the existing VPC. It is the same architecture as any compute-heavy internal service.

## What does it cost?

Cloud APIs charge a few dollars per million tokens. Private inference swaps that for a fixed cost: hardware you buy, or GPU instances billed by the hour whatever the query volume. At low or irregular volumes, the API costs less. At steady workloads above a few million tokens a day, private inference usually costs less, often by a wide margin. The break-even depends on the workload and is worth calculating. ([What private inference costs](/library/95-private-inference-costs.html) measures one.)

## Are open-weight models good enough?

For well-defined tasks, usually. The smaller Llama, Mistral and Qwen models handle classification, extraction, summarisation and question-answering over documents with results comparable to much larger models, and the largest open-weight models come close to frontier quality. Model choice should follow the task: a document extraction pipeline on a fine-tuned 8B model inside a VPC is compliant and cheap to run.

## What private inference leaves unsolved

Moving the model inside the boundary settles where the data goes. Output governance (audit trails, error handling, human review) remains its own problem, and someone has to operate the GPU infrastructure. Both are ordinary engineering work. Neither is worth starting until the data question is settled.

(The rest of the private inference series: [The Private Inference Stack](/library/63-private-inference-stack.html) covers the tooling, from raw framework code to managed providers; [Why Private Inference](/library/65-why-private-inference.html) sets out the risks that drive the decision; [Open Weight Models and the Separation of Concerns](/library/66-open-weights-separate-concerns.html) covers what open weights change about compliance. [marigold](https://marigold.run) is our open-source platform for running open-weight models on your own infrastructure.)
