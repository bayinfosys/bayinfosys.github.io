---
layout: article
title: "Static vs Dynamic Planning in AI Pipelines"
description: "Most production AI workloads are high-volume and fixed-task. Dynamic planning adds cost and reduces auditability without adding anything a static pipeline cannot do."
keywords: ["ai pipelines", "static planning", "dynamic planning", "agentic ai", "workflow orchestration", "mlops"]
topic: "AI Systems"
last_modified_at: 2025-01-01
seo_title: "Static vs Dynamic Planning in AI Pipelines: How to Choose"
related:
  - 43-agent-alloys
  - 07-design-patterns
  - 29-platforms-vs-pipelines
  - 10-agent-memory
---

# Static vs Dynamic Planning

---

*I am building Marigold, a workflow orchestration platform for privately hosted AI models. These articles explore the design decisions behind it -- what I am learning, what I got wrong, and where the interesting problems are. Comments welcome, especially from people who have built production AI pipelines.*

---

Most of the written thinking about AI systems in 2025 concentrated on agents: systems where a model decides at runtime what to do next, calls tools, revises plans, and works toward a goal through iteration. The research is interesting, the demos are compelling, and the architectural questions are genuinely hard.

The distribution of actual production AI workloads looks different. A legal firm processing ten thousand contracts a month. A retailer running image quality checks across a product catalogue. A fintech classifying customer records against a reference set. These are not problems which benefit from a model deciding what to do next. The task is fixed, the input type is uniform, and the volume is high. What matters is throughput, cost predictability, and a clear record of what happened to each unit.

This is the split: dynamic planning and static planning.

In a dynamically planned system, the execution path is determined at runtime. The model receives a goal, decides which tools to call, acts on the result, and continues until the goal is met or an attempt limit is reached. The execution graph is not known before the job starts. This approach has deep roots: dynamic programming, formalised by Bellman in the 1950s, established the mathematical basis for optimal sequential decision-making, and modern agentic systems inherit both its power and its characteristic difficulty. A system that can reason about intermediate results and revise its plan is expressive; it is also harder to bound, harder to audit, and harder to debug when something goes wrong.

In a statically planned system, the execution path is declared before the job runs. Every step, its inputs, its dependencies, and the conditions under which it branches or halts are specified upfront. The executor fulfils the plan. This produces a known cost per run, a per-step audit trail with status, timing, and output, and precise failure identification.

The choice between them follows from the workload.

High-volume processing fits the static model. When the same pipeline runs across fifty thousand items, the execution path does not change based on what the model returns at each step (except at branch points that are themselves declared in the spec). The overhead of dynamic planning -- variable cost, a trace that requires interpretation, decisions distributed across model calls -- adds nothing here and removes the guarantees that make a nightly batch job operationally manageable. Static planning, by contrast, makes the plan an artefact: before a job runs, you can read the spec and know exactly what will happen to each unit. After it runs, the audit trail records what did happen.

Dynamic planning earns its overhead when the task requires it: research, code generation, anything where the right next step depends on what the previous step found. The expressiveness is the point. A system that cannot revise its plan mid-execution cannot handle those tasks well, and forcing them into a static spec produces brittle, over-specified pipelines that break on unforeseen inputs.

Most real systems need both, at different levels. A document processing pipeline might call an instruct model to classify ambiguous cases; that model call is dynamic in the sense that the output varies with the input, but the step itself is statically planned. The pipeline knows it will call the model; it does not know what the model will return. Confusing these two levels is where most of the unproductive debate around determinism comes from.

The interesting design question is not which approach to use but where to draw the boundary: which decisions are fixed in the spec and which are made at runtime. Drawing that boundary well is most of what workflow design actually involves.

*(Marigold is a typed inference platform for privately hosted models with a declarative workflow engine. https://bayis.co.uk/marigold)*
