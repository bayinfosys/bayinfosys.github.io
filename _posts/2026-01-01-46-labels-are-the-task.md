---
layout: article
title: "Task Specification is the Primary Artefact"
description: "Foundation models changed the cost of the mechanism. They did not change the first question: where are the labels? A labelled dataset is a measurement instrument, not training fuel."
keywords: ["task specification", "labelled data", "llm evaluation", "evals", "ml pipeline", "foundation models"]
topic: "AI Systems"
last_modified_at: 2025-01-01
---

# Task Specification is the Primary Artefact

---

*I am building Marigold, a workflow orchestration platform for privately hosted AI models. These articles explore the design decisions behind it -- what I am learning, what I got wrong, and where the interesting problems are. Comments welcome.*

---

In classical machine learning, a labelled dataset is not raw material. It is a formal statement of the task. Labels encode the human judgement of correct behaviour -- which contracts are high risk, which images are defective, which customer records indicate churn. Without that judgement made explicit and attached to examples, you do not have a task, just a hope that the model will infer what you meant.

This was true before foundation models and it remains true now. What changed is the cost structure around it.

The ML practitioner's shorthand for a complete problem statement is *F(X) = Y*. A model *F*, applied to data *X*, producing output *Y*. In classical supervised learning, *F* is trained on a labelled dataset. Acquiring labels is expensive; training is expensive; deployment is expensive.

Foundation models change the cost of *F* dramatically. A capable instruction-following model arrives pre-trained, available at the marginal cost of inference, and requires no retraining for most tasks. The cost of building the mechanism falls by orders of magnitude. The cost of defining the task does not. *Y* still needs to exist before you can say whether *F(X)* produces it.

However, the role of the labelled data set has changed: It is no longer training fuel. It is a measurement instrument. Run the model against your labelled examples, compare outputs to labels. The result is a precise characterisation of the model on your specific task. The dataset persists as the definition of correct. Run it again after swapping the model. Run it against production outputs to find degradation. The labelled set allows measurement.

*Data + labels + model = evals*.

For anyone building AI pipelines, the first job on any engagement is "get labelled data". Not to select a model, not to design the workflow, not to provision infrastructure. Labels first, because that is the point at which the problem becomes tractable. A pipeline without a task specification is without a definition of success. Nobody can say whether the outputs are correct.

The specification also improves with use. Production runs generate outputs. Some of those outputs are wrong. Correcting them and adding them to the labelled set sharpens the definition of the task -- the model's failure modes become part of the measurement instrument. A task specification assembled from six months of corrected production outputs is a more precise statement of the task than anything that could have been written before deployment. The artefact accumulates value.

This is what twenty years of ML consulting practice looks like applied to the foundation model moment. The models got cheaper and more capable. The first question on any engagement did not change: where are the labels?

The artefact which makes a pipeline transferable is not the pipeline itself. Any competent engineer can reconstruct the workflow from a specification. What cannot be reconstructed without significant effort is the labelled set that defines "correct" and the accumulated corrections from actual usage. That is the intellectual property which belongs to the client.

*(Marigold's eval surface runs any pipeline against a labelled dataset, scores outputs using the same model registry, and accumulates corrected outputs from production runs into a reusable task specification. https://bayis.co.uk/marigold)*
