---
layout: article
title: "A Measurement Framework for Machine Learning Projects"
seo_title: "Machine Learning Measurement Framework: Eval Datasets and Scoring"
description: "A practical framework for defining, building, and maintaining
the measurement system that determines whether an ML project is working.
Includes scoring formulae, risk weighting, and a readiness checklist."
keywords: ["machine learning evaluation framework", "ml success metrics",
"how to evaluate machine learning model", "ml deployment criteria",
"machine learning measurement", "ai project evaluation", "ml eval dataset",
"machine learning readiness", "ml scoring framework"]
topic: "Product & Strategy"
last_modified_at: 2026-05-20
related:
  - 68-build-measurements
  - 46-labels-are-the-task
  - 67-swe-know-about-ml
  - 61-eval-datasets
  - 04-cost-of-ml
---

# A Measurement Framework for Machine Learning Projects

An ML project without a measurement framework is a project without acceptance criteria.
The model may run and it may even produce plausible outputs.
Whether it is doing what the business requires is a different question, and without a formal answer to that question the project cannot be signed off, cannot be defended to a regulator, and cannot be maintained after deployment.

This article sets out the components of a measurement framework and the order in which to build them.
It is the practical complement to [Don't Build Models, Build Measurements](/library/68-build-measurements.html), which covers the reasoning.
This article covers the implementation.

## Ground truth

The foundation of any measurement framework is a ground truth dataset:
a collection of labelled examples that formally state what correct output looks like for the task.

A labelled example has three parts: an input, the output a model produced, and a correction or confirmation from a domain expert.
The correction is the ground truth.
Accumulated corrections form the dataset.
The dataset is the specification.

Ground truth can come from several sources.
Production data with known outcomes is the most valuable -- these are real inputs with confirmed correct outputs, accumulated through normal business operation.
Historical records of failures and corrections (support tickets, rework queues, known issues lists) are the most immediately available.
Synthetic examples, constructed deliberately to cover edge cases and failure modes the production data does not represent, fill the gaps.
These are most useful for extremely unlikely events which need to accomodate.

A working eval dataset does not require large numbers.
Fifty  well-chosen examples with clear correct outputs will evaluate a model more reliably than a thousand ambiguous ones.
The quality of the ground truth determines the quality of everything built on top of it.

## Scoring

With a ground truth dataset in place, model performance becomes measurable.
The basic scoring function compares model outputs against ground truth across the dataset and produces an accuracy figure:

```
accuracy = correct_outputs / total_examples
```

Raw accuracy is a good starting point.
A model that scores 90% overall may be failing on the 10% of cases that carry the most business risk.
Weighted scoring accounts for this:

```
weighted_score = sum(example_weight x correct) / sum(example_weight)
```

Where `example_weight` reflects the business consequence of a failure on that example.
A misclassified high-value transaction carries more weight than a misclassified low-stakes label.
The weighted score captures what matters to the business rather than what is statistically convenient.

## Risk weighting

Assigning weights requires a taxonomy of failure modes.
As the ground truth dataset grows, classes of failure become visible -- routing errors, classification errors, extraction errors, boundary condition failures.
Each class has a characteristic consequence.

A simple risk weighting assigns a multiplier to each failure class based on business impact:

```
risk_weight = business_impact x failure_frequency
```

Where `business_impact` is assessed by the domain expert (financial cost, regulatory exposure, customer consequence) and `failure_frequency` is observed from the dataset.
High-impact, high-frequency failures carry the most weight and define the threshold the model must clear before deployment.

This is the same judgement a software team applies when deciding which failing tests block a release.
The structure is identical.
The inputs are different.

## The deployment gate

A deployment gate is a threshold: the model ships when it clears the weighted score on the cases that matter.
Below the threshold, it does not ship.

```
deploy = weighted_score >= threshold AND
         high_risk_accuracy >= high_risk_threshold
```

The two-condition gate is deliberate.
A model can clear the overall weighted score while still failing disproportionately on high-risk cases.
The second condition catches that. Both thresholds are set by the business before evaluation begins, not after results are known.

The deployment gate makes the acceptance criteria explicit and removes the ambiguity that derails most ML project sign-offs.
The question is no longer "does the team feel confident?" but "does the model clear the gate?"

## Retraining and improvement

A deployed model is not finished.
Performance often degrades as real inputs change slightly over time - known as "drift".
The measurement framework detects this: a scheduled eval run against the ground truth dataset will show whether the model's score is holding or declining.

When retraining becomes necessary, the cost is estimable:

```
label_cost = (n_labels / labels_per_day) x labeller_daily_cost
```

The expected improvement from new labels is also estimable:

```
gain = n_new_labels / n_total_labels
improved_accuracy = (1 + gain) x current_accuracy
```

These formulae do not produce exact predictions -- model improvement is not perfectly linear -- but they produce defensible estimates.
The business can assess whether the investment is worth the improvement, and when.
That is a calculable decision rather than a judgement call made under pressure.

## Synthetic data and the unhappy path

Production data is biased toward the cases the system was designed to handle.
Edge cases, malformed inputs, unusual volumes, encoding variants, and adversarial examples are underrepresented or absent.

Synthetic examples cover this gap deliberately.
Constructing inputs that exercise the boundaries of the system -- empty fields, duplicate records, inputs at the extremes of the expected distribution -- produces a more complete eval dataset and separates two specific questions: is the pipeline robust, and is the model accurate?
A pipeline can fail on a malformed input regardless of model quality.
Testing them separately produces cleaner diagnostics and clearer remediation paths.

## Readiness checklist

The following checklist identifies whether a project has the measurement foundations in place to proceed.
It is worth working through before model selection, infrastructure decisions, or budget sign-off.

Print it, work through it honestly, and note where the answers are uncertain.
The uncertain answers are the first deliverables.

```
GROUND TRUTH
[ ] We have identified the decision points in our process that the model will automate or support.
[ ] We can produce labelled examples of correct output for those decisions.
[ ] We have at least 50 labelled examples, or a plan to produce them before evaluation begins.
[ ] Our ground truth examples cover failure cases as well as success cases.

SCORING
[ ] We have defined what correct output means for each example in quantifiable terms.
[ ] We have assigned risk weights to different failure classes based on business consequence.
[ ] We have set a weighted score threshold the model must clear before deployment.
[ ] We have set a separate threshold for high-risk failure classes.

DEPLOYMENT
[ ] Our deployment gate is defined before evaluation begins, not after results are known.
[ ] We have identified who owns the go/no-go decision.
[ ] We have a plan for monitoring model performance after deployment.

RETRAINING
[ ] We know how we will detect performance degradation in production.
[ ] We have estimated the cost of a retraining cycle.
[ ] We have identified who will produce new labels and at what rate.

ORGANISATION
[ ] We have a domain expert who can confirm what correct output looks like.
[ ] That domain expert is allocated time to the project, not just consulted occasionally.
[ ] We have a plan for what happens when the model is wrong.
```

If more than a third of these are uncertain, the measurement framework is the first engagement, not the model.

([Get in touch](/contact.html) if you would like to work through this with someone who has done it before.)
