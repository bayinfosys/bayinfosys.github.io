---
layout: article
title: "What Software Engineers Already Know About Machine Learning"
seo_title: "What Software Engineers Already Know About Machine Learning"
description: "Eval datasets, scoring pipelines, and deployment gates for
ML systems are not new concepts. Software engineers have been doing this
for years under different names."
keywords: ["machine learning engineer", "software engineer", "mle vs swe",
"ml evals", "eval dataset", "ml testing", "mlops", "ci cd machine learning",
"ml deployment", "software engineering machine learning"]
topic: "Product & Strategy"
last_modified_at: 2026-05-10
related:
  - 18-mle-vs-swe
  - 28-coding-vs-programming
  - 42-software-engineering-solved-governance
  - 61-eval-datasets
---

# What Software Engineers Already Know About Machine Learning

The most common reaction when a software engineer first encounters a
production ML evaluation framework is mild surprise that it is not more
complicated. Bug tracker. Scoring function. Deployment gate. The
concepts are familiar. The names are different.

This is not a coincidence. The problems ML evaluation solves -- how do
you know the system is behaving correctly, how do you detect regression,
how do you gate a deployment on measured quality -- are the same problems
software engineering solved decades ago. The tooling is lighter. The
underlying logic is identical.

## The bug tracker you already have

Every organisation that has run software in production has a record of
failures. Support tickets, known issues lists, post-mortem notes, a CSV
someone started maintaining because the issue tracker felt like overkill.
Each entry has the same structure: what went in, what came out, what
should have come out instead.

That is a labelled dataset. Input, actual output, expected output. The
structure that ML evaluation requires already exists in the organisation,
accumulated through production use, before anyone has written a line of
model code.

The leap from "known issues list" to "eval dataset" is smaller than it
looks. The data is already there. What is missing is the recognition
that it is the most valuable artefact in the system.

## Taxonomy emerges from volume

A bug tracker with ten entries is a list. A bug tracker with two hundred
entries is a taxonomy waiting to be read.

As the dataset grows, classes of failure become visible. Some failures
are routing errors -- the system sent the input to the wrong handler.
Some are classification errors -- the system assigned the wrong category.
Some are extraction errors -- the system missed or mangled a field. Each
class has a different character and a different business consequence.

A routing error that sends a complaint to a sales queue costs more than
a classification error on a low-stakes label. Weighting the scoring
function by business consequence turns a flat accuracy measure into
something the organisation can reason about. A new model that scores
93% overall but fails disproportionately on high-risk classes is worse
than a model that scores 89% evenly. The weighted score captures that.
Raw accuracy does not.

This is not a novel insight. Software engineers weight test severity
by impact. A failing test on a payment path blocks deployment. A
failing test on a tooltip does not. The same logic applies.

## CI/CD for model behaviour

A deployment gate in software engineering is a threshold: if the test
suite passes, the build ships. The same structure applies directly to
ML deployment.

A new model, a revised prompt, or a modified pipeline runs against the
weighted eval dataset before it reaches production. If it scores above
the agreed threshold on the classes that matter, it ships. If it does
not, it does not. The process is reviewable, repeatable, and
independent of whoever built the model.

This is what makes the eval dataset the primary artefact of an ML
system rather than the model itself. The model will change -- better
foundation models appear, prompts are revised, pipelines are refactored.
The eval dataset persists across all of those changes and provides the
consistent measure against which each version is judged. It is the
test suite. The model is the build.

(The [labels are the task](/library/46-labels-are-the-task.html) article
covers this in more depth from the data side.)

## The unhappy path

Production data is biased toward success. The system was designed to
handle the common case, so the common case is what appears in the logs.
Edge cases, malformed inputs, unusual volumes, encoding variants, empty
fields, duplicate records: these are underrepresented in organic data
because the system either handled them silently or failed in ways that
were not captured.

Software engineers recognise this immediately. A test suite that only
covers the happy path is not a test suite. The unhappy path requires
deliberate construction -- test cases written to exercise the boundaries,
not derived from production logs.

Synthetic data serves the same function in ML evaluation. Generating
examples that cover encoding edge cases, adversarial inputs, and failure
modes the production dataset does not contain is not a compromise. It
is the correct approach. It also separates two questions that are
consistently conflated: is the pipeline robust, and is the model good?
A pipeline can fail on a malformed input regardless of model quality.
Testing them separately produces cleaner diagnostics.

## What this means in practice

A software engineer joining an ML project does not need to acquire a
new conceptual vocabulary to contribute to evaluation. The concepts
transfer. The existing failure records are the starting dataset. The
risk-weighted scoring function is the test suite. The deployment gate
is the deployment gate.

What changes is the tolerance for imprecision. Software tests are
binary -- pass or fail. ML evaluation is distributional -- the system
is right some percentage of the time, and the question is whether that
percentage is good enough on the inputs that matter. That shift in
framing is the adjustment. The rest is already known.

The organisations closest to a production-ready ML evaluation framework
are often the ones that have been running software long enough to
accumulate a substantial record of failures. They have the dataset.
They have not recognised it yet.
