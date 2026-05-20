---
layout: article
title: "Don't Build Models, Build Measurements"
seo_title: "Don't Build Models, Build Measurements: AI Project Evaluation"
description: "Most AI projects fail before the model is built. The question
that determines whether a project is viable is not which model to use,
but whether the organisation can define what correct looks like."
keywords: ["machine learning evaluation", "ai project success", "ml metrics",
"how to evaluate ai project", "machine learning success criteria",
"is my machine learning model good enough", "ai project failure",
"machine learning project management"]
topic: "Product & Strategy"
last_modified_at: 2026-05-20
related:
  - 04-cost-of-ml
  - 46-labels-are-the-task
  - 67-swe-know-about-ml
  - 18-mle-vs-swe
  - 61-eval-datasets
redirect_from:
  - /dont-build-models-build-measurements/
---

# Don't Build Models, Build Measurements

The first question in any AI engagement is not which model to use.
It is: how do you know when something has gone wrong?

Most organisations cannot answer this immediately.
Not because they lack rigour, but because the question has not been asked in this form before.
Software systems fail visibly -- an error is thrown, a page does not load, a transaction is declined.
ML systems fail silently.
A model that was accurate at deployment drifts as the world it was trained on recedes.
The outputs gradually become less right.

The organisations that succeed with AI are the ones that establish what correct looks like before they build anything.

## Walk me through what you do

The most productive opening to an AI engagement is not a technical audit.
It is a process walk. What does your customer see? What happens before that, and after?
Where does a human make a decision that the same human makes again tomorrow, and the day after?

These questions surface the decision points where automation is possible.
They also surface something more valuable: the implicit definition of correct that the organisation already holds but has not written down.
When a customer complaint gets escalated, someone decided it met a threshold.
When an order gets flagged for review, something triggered that judgement.
The criteria exist, they are just in people's heads rather than in a dataset.

## How do you know when something is wrong?

The second question is harder and more revealing.
Not "what do you measure" but "how do you know when the output is bad?"

Some organisations have this immediately. A returns rate. A re-work queue.
A score that appears on every processed item.
These are labels in waiting -- the organisation has been building its eval dataset without knowing it.

Some organisations feel the answer rather than measure it.
A senior person looks at the output and knows it is off.
That intuition is real and usually calibrated correctly.
It is also not a deployment gate.
A model cannot be evaluated against a feeling, and a budget cannot be justified by one.

The organisations who cannot answer this question at all are not ready for an AI project.
They must first deliver a measurement framework.

(This is also where resistance to AI projects tends to surface.
The person whose judgement currently fills the gap can see that formalising the criteria will automate the role.
The reframe is this: formalising the criteria makes their expertise legible, scalable, and durable; allowing the process to scale.
The expert will now own the standard and be in a more influential position as the owner of the business process.)

## What does correct look like?

Once the decision points are mapped and the failure signals are identified, the question becomes concrete: what does a correct output look like, and can we produce examples of it?

This is where the project becomes viable or does not.
A labelled example is an input, the output a model produced, and a correction or confirmation from someone who knows.
Accumulated examples form the eval dataset.
The eval dataset is the formal statement of what the system is required to produce.

Without it, there is no basis for model selection, no acceptance criteria, and no way to detect degradation after deployment.
With it, every subsequent decision -- which model, what threshold, when to retrain -- has a reference point.

The measurement framework does not need to be large to be useful.
Fifty well-chosen labelled examples, risk-weighted by the consequence of each failure type, will tell you more about a model's fitness for a task than any benchmark score on a general dataset.
A hundred examples is a working eval.
A thousand is a robust one.

## What this changes

A project scoped around measurement produces different milestones than a project scoped around model delivery.
The first milestone is not a working model -- it is a defined ground truth.
The second is not a deployed system -- it is a scored baseline.
Delivery is the point at which the model clears the measurement bar, not the point at which it runs without errors.

This changes the conversation with stakeholders.
Instead of "the model is 87% accurate" -- a number that means nothing without context -- the conversation is "the model clears our threshold on the cases that carry the most business risk": a defensible position.
It is also the only position worth being in when something eventually goes wrong, because something eventually goes wrong!

The measurement framework survives the model.
When a better foundation model is released, the eval dataset tells you whether it is actually better for your task.
When a prompt change is proposed, the eval dataset tells you whether it improves or regresses.
When a regulator asks how the system makes decisions, the eval dataset is the answer.

Build the measurement. The model lives inside it.

([The labels are the task](/library/46-labels-are-the-task.html) covers the technical structure of eval datasets.
If you are working through whether your organisation has the data foundation an AI project requires, [get in touch](/contact.html).)
