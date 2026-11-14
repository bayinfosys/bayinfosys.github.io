---
date: 2026-04-15
last_modified_at: 2026-11-14
layout: article
title: "What Is Private AI Inference?"
seo_title: "What Is Private AI Inference? Running AI on Your Own Servers"
description: "Private AI inference runs a model on infrastructure you control, so prompts and documents never reach a model provider. How it works, where it runs, who provides it, how personal data is protected, and what it costs."
keywords: ["private inference", "private ai inference", "what is private inference", "private cloud inference", "private ai deployment", "secure ai inference", "on-premise ai", "open weight models"]
topic: "Architecture & Deployment"
cta: private-inference
related:
  - 117-private-ai-server
  - 87-inference-infrastructure
  - 63-private-inference-stack
  - 65-why-private-inference
  - 95-private-inference-costs
  - 72-private-inference-fhe
  - 64-marigold
---

# What Is Private AI Inference?

Private inference means running an AI model on infrastructure you control: your own servers, your own cloud account, or a dedicated deployment run for you inside an agreed boundary. Prompts and documents go to the model and the answers come back without passing through an external model provider such as OpenAI or Anthropic. (For organisations deciding where their models should run, [sovereign and on-premise AI](/sovereign-ai.html) sets out the options and how Bay Information Systems helps.)

(In research, "private inference" also names cryptographic methods that let a model compute on data it cannot read. Those are covered in [why private inference is not fully private yet](/library/72-private-inference-fhe.html). This article uses the operational meaning.)

Regulated sectors are often required to have this. If a team builds a prototype on a cloud API, legal or compliance reviews the architecture and cannot allow the prototype into production. Typically this is due to data controls, but may also be for jurisdicational oversight or disaster recovery plans. Health data under NHS frameworks, financial data under FCA conduct rules and client data under confidentiality agreements cannot go to an external API endpoint.

## How does private inference work?

A cloud AI API bundles the model and the infrastructure. A request travels to the provider's servers, runs against the provider's model, and comes back.

Open-weight models separate these two issues. Llama, Mistral, Qwen and others publish models weights (binary files that make up the model), which any organisation can download and run on its own hardware. The model then runs alongside the data. The provider drops out of the arrangement and governance and regulatory issues are greatly simplified.

The software that serves the model usually speaks the same HTTP interface as the OpenAI API. vLLM, Ollama and marigold all expose OpenAI-compatible endpoints, so an application written against a hosted API moves to private inference by changing the address it calls. (The serving options are compared in [how to self-host an LLM](/library/63-private-inference-stack.html).)

## Where can private inference run?

Private inference runs in one of three places:

| Where | Hardware Owner | Jurisdiction | Suits |
|---|---|---|---|
| Your own premises | You | Yours alone | Data that cannot leave the building; steady, high volume |
| Your cloud account | Your cloud provider, inside your network | The provider's, as well as yours | Teams that already run in AWS, Azure or Google Cloud |
| A dedicated deployment run for you | A supplier, in a region you agree | The supplier's and its cloud provider's | Sovereignty requirements without a GPU operations team |

**On your own premises**, the model runs on a private AI server: a machine with one or more GPUs, sufficient memory, and serving software. It needs an internet connection to download the models, and after that it can run with none. No cloud provider is involved, so no third party holds the data. ([What is a private AI server](/library/117-private-ai-server.html) covers the hardware, the software and the costs.)

**Private cloud inference** means deploying the model inside your own cloud account. On AWS that is a Virtual Private Cloud (VPC): the same network boundary that already governs the organisation's databases, application servers and storage. On Azure it is a resource group with similar controls. A prompt containing patient data, transaction history or confidential correspondence stays inside that boundary, and so does the response. The work is familiar: choose a model, provision GPU instances with enough memory for its weights, containerise the inference server and deploy it inside the network. The cloud provider's jurisdiction is still relevant.

**A dedicated deployment** is the managed version: a supplier runs the model on infrastructure reserved for you, in a region named in the contract. (Choosing between owned servers and cloud instances is covered in [AI inference infrastructure](/library/87-inference-infrastructure.html).)

## Who provides private inference?

Suppliers can run models inside a boundary and occaisionally send data to external servers.

| Supplier | Examples | Data egress? | Operator |
|---|---|---|---|
| Cloud providers' managed model services | AWS Bedrock, and the Azure and Google equivalents, in a region you choose | It goes to the provider's service, in your chosen region | The cloud provider |
| Private deployment services | Hugging Face Inference Endpoints with private networking, Baseten, AWS SageMaker private endpoints | No; dedicated infrastructure in an agreed region | The supplier |
| Your own team | Open-source serving software such as vLLM or Ollama | No | You |
| Consultancies and IT partners | Bay Information Systems deploys marigold, its open-source platform, on your servers or in your cloud account | No | You, after handover, or the partner |
| Open-weight API providers | Together AI, Groq, Fireworks AI, DeepInfra | Yes; requests go to their shared servers | The provider |

An open-weight API provider serves public weights, which makes its claim not to train on your data checkable, but the data still travels to its infrastructure. Where the constraint is data egress itself, it does not qualify.

An IT consultancy can deploy private inference for its own clients with the same software. marigold is released under the MIT licence, so a partner can install and operate it on a client's hardware or cloud account without a licence from Bay Information Systems.

## How is personal data protected during model serving?

Moving the model inside your trust boundary removes the model provider from the data flow. Remaining personal data that still needs the usual controls of any internal system.

**The boundary.** Prompts, documents and responses stay on infrastructure you control. Under UK GDPR, whoever operates that infrastructure for you acts as a processor, under a data processing agreement. ([Data controller or processor](/library/110-data-processor-or-controller.html) sets out the roles.)

**Logs and retention.** Inference servers and the applications log requests; a logged prompt containing personal data is personal data. Decide what is logged, who can read it and how long it is kept, as you would for any database.

**Redaction before the model.** Where a task does not need names, addresses or account numbers, remove them before the text reaches the model. Named entity recognition does this in the pipeline itself, at a fraction of the cost of the generation step. ([PII detection with named entity recognition](/library/73-ner-and-pii.html) covers the method.)

**Access control.** Give each application its own credentials for the model endpoint, behind the identity system the organisation already runs, so every call is attributable.

**Model versions.** An open-weight model is a set of files you hold. The version you tested stays the version you run until you change it, which keeps the behaviour you assessed in a data protection review the behaviour in production.

## What does it cost?

Cloud APIs charge a few dollars per million tokens. Private inference swaps that for the fixed cost of hardware, or GPU instances billed by the hour. At low or irregular volumes an API is cheaper. At steady workloads above a few million tokens a day, private inference usually costs less. The break-even depends on the workload and is worth calculating. ([What private inference costs](/library/95-private-inference-costs.html) measures one: 14 models and 1,204 requests on a single GPU for 5.6p of electricity.)

## Are open-weight models good enough?

For well-defined tasks, usually yes. The smaller Llama, Mistral and Qwen models handle classification, extraction, summarisation and question-answering over documents with results comparable to much larger models, and the largest open-weight models come close to frontier quality. The leading closed models usually keep an edge on the hardest open-ended reasoning and on long, multi-step agent tasks. Model choice should follow the task: a document extraction pipeline on a fine-tuned 8B model inside a VPC is compliant and cheap to run.

## What private inference leaves unsolved

Moving the model inside the boundary settles where the data goes. Output governance (audit trails, error handling, human review) remains, and the GPU infrastructure requires management. Both are ordinary engineering work.

(The rest of the private inference series: [what a private AI server is](/library/117-private-ai-server.html); [AI inference infrastructure](/library/87-inference-infrastructure.html) for hosting, hardware and serving at scale; [how to self-host an LLM](/library/63-private-inference-stack.html) for the software; [why private inference](/library/65-why-private-inference.html) for the risks that drive the decision. To see whether your data needs it, take the [private inference checklist](/checklists/private-inference.html).)
