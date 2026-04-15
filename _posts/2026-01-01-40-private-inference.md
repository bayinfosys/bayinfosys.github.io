---
layout: article
title: "Private Inference: Running AI Inside Your Own Infrastructure"
description: "Data egress is the constraint that kills AI projects in regulated sectors. Open-weight models deployed inside a VPC remove the objection before it reaches legal review."
keywords: ["private inference", "self-hosted llm", "aws vpc", "data sovereignty", "regulated sectors", "open source models"]
topic: "Architecture & Deployment"
last_modified_at: 2025-01-01
---

# Private Inference: Running AI Inside Your Own Infrastructure

The conversation that ends AI projects in regulated sectors tends to follow a predictable shape. Someone identifies a genuine use case. A team builds a prototype using a cloud API. Legal or compliance reviews the architecture. The prototype dies.

The objection is not to AI, rather it is to data leaving the organisation's infrastructure. Healthcare data governed by NHS frameworks, financial data covered by FCA conduct rules, client data protected by confidentiality agreements: none of this can flow freely to an external API endpoint, regardless of what the API provider's data processing agreements say. The constraint is real and, in most cases, non-negotiable.

## Separation of Concerns

Cloud AI APIs bundle two things that can be separated: the model and the infrastructure. When you call the OpenAI or Anthropic API, your data travels to their servers, runs against their model, and returns a result.

Open-weight models remove this coupling. Llama, Mistral, Qwen, and others publish model weights that any organisation can download and run on its own hardware. The model runs where the data lives.

On AWS, this means deploying inference within a Virtual Private Cloud -- the same network boundary that already governs databases, application servers, and storage. A prompt containing patient data, client transaction history, or confidential correspondence never crosses that boundary. It runs against a model deployed inside it, and the response returns inside it.

Selecting a model, provisioning GPU-backed EC2 instances with sufficient memory for the weights, containerising the inference server, and deploying within an existing VPC: this is the same architecture as any compute-intensive internal service.

## New Choices

Cloud API pricing runs at a few dollars per million tokens. Self-hosted inference trades per-token cost for fixed infrastructure: a GPU instance running a model continuously costs somewhere between two and eight dollars an hour depending on instance type and model size, regardless of query volume. At low volumes, cloud APIs cost less. At sustained workloads above a few million tokens a day, self-hosted inference typically costs less, often significantly. The break-even is worth calculating rather than estimating, but it exists.

Not all tasks require the largest available models. The smaller models in the Llama and Mistral families handle classification, extraction, summarisation, and question-answering over structured documents with results comparable to much larger models on well-defined tasks. The 70B parameter range produces output quality close to frontier models.

Model selection should follow task requirements. A document extraction pipeline running on a fine-tuned 8B model inside a VPC is both compliant and cost-effective.

## What Remains

Private inference does not resolve every constraint. Output governance -- audit trails, error handling, review processes -- is a separate problem. Operating GPU infrastructure is a genuine operational consideration.

These are all tractable engineering problems. They are also different problems from the data egress constraint. Until the architecture is compliant, nothing else in the project is worth discussing.

(Bay Information Systems designs and deploys private inference infrastructure for regulated sector clients. If the data egress constraint has blocked an AI initiative, the architecture conversation is the right starting point.)
