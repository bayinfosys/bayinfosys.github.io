---
layout: article
title: "The Fat Protocol Thesis Applied to AI"
description: "Model weights are the fat layer -- general, beneath everything, available at marginal cost. Workflows are thin clients. Most AI infrastructure is built the wrong way round."
keywords: ["fat protocol", "ai infrastructure", "model weights", "workflow orchestration", "llm", "foundation models"]
topic: "Perspectives"
last_modified_at: 2025-01-01
---

# The Fat Protocol Thesis Applied to AI

---

*I am building Marigold, a workflow orchestration platform for privately hosted AI models. These articles explore the design decisions behind it -- what I am learning, what I got wrong, and where the interesting problems are. Comments welcome.*

---

In 2016, Joel Monegro wrote an essay called [Fat Protocols](https://www.usv.com/writing/2016/08/fat-protocols/) about the economics of blockchain networks. The argument was a reversal of how value had distributed across the web. On the internet, the protocol layer -- TCP/IP, HTTP, SMTP -- stayed open and unmonetised while value accumulated in the applications above it. Google and Facebook are worth trillions; HTTP is free. Blockchain, Monegro argued, would invert this. The protocol layer would capture most of the value, and applications would be thin clients sitting on top of a shared, appreciating foundation.

Whether that prediction held for crypto is a separate argument. The logic is sound and it applies to modern AI.

Model weights are the fat layer. A foundation model encodes a compressed representation of a significant fraction of human knowledge, trained at enormous cost, and then made available at the marginal cost of inference. The weights do not belong to an application. They sit beneath everything. An instruction-following model that can summarise a contract can also describe an image, classify a customer record, or generate a product description -- not because it was designed for any of these tasks specifically, but because the training distribution was wide enough to cover all of them. The fat layer is general.

The weights must be invoked. This is where typed operations become protocol primitives. A text embedding operation takes text and produces a vector. An image-to-text operation takes an image and produces a description. A text-to-speech operation takes text and produces audio. These are the minimal interface between a declared intent and the model that fulfils it. The operation type specifies input and output. The model is a parameter.

This matters more than it first appears. Because models are separate from operation types, models can be swapped without changing anything else in the system. A workflow that calls an image embedding step does not care whether the model underneath is CLIP, SigLIP, or something released next quarter.

Workflows are the thin clients. A workflow declares a sequence of typed operations, the dependencies between them, and the conditions under which it branches or halts. It states what it wants; the execution environment handles everything else.

A strong economic consequence follows: models are commodities available to workflows. The marginal value of the first model is high (the system only works if there is something to call). The marginal cost of each subsequent model falls (the infrastructure for loading, serving, and routing is already there). The marginal value delivered to existing workflows rises (more capable models become available without changing any workflow specs).

This is not how most AI infrastructure is built. Most pipelines are wired directly to specific models, specific APIs, specific vendors. The workflow and the model are coupled. Swapping the model requires changing the pipeline. Adding a new capability requires new infrastructure.

The fat protocol framing makes the design objective explicit: build the protocol, keep it stable, and grow the model catalogue, make it fatter. The applications -- the workflows -- stay thin.

*(Marigold is a typed inference platform for privately hosted models with a declarative workflow engine. https://bayis.co.uk/marigold)*
