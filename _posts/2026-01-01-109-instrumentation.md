---
date: 2026-09-04
layout: article
title: "Instrumentation Is the Deliverable"
seo_title: "AI Pipeline Observability: What Debug Logs Reveal About Your Process"
description: "The records written to debug a generation pipeline describe the process the pipeline replaced. That description is the artefact most organisations lack, and it can be produced before any model is bought."
keywords: ["ai observability", "pipeline instrumentation", "process mining", "ai pilot failure", "audit trail", "llm pipeline debugging"]
topic: "AI Systems"
related:
  - 69-measurement-framework
  - 44-static-vs-dynamic-planning
  - 43-agent-alloys
  - 68-build-measurements
---

# Instrumentation Is the Deliverable

[PopStory](https://popstory.co.uk) writes illustrated short stories in several
languages, each graded to a reading level. Ten or so model calls stand between a
chosen theme and a finished story, and when one of them goes wrong the story
arrives wrong without an error. So every stage writes a record:
which model ran, under what instruction, on what input, how long it took, what it
cost, and whether it failed.

Rendered, those records became a page. Each story now carries public production
notes showing the cast, the setting, the five-part plan behind the text, the
reference drawings, the models that ran and the bill for the run. The standing
objection to generated writing is that it shows no working. The page shows the
working.

The instruments that make a model pipeline debuggable are the same artefacts a
business process needs and rarely has.

## The questions a pipeline forces

To make a chain of model calls work you have to answer a short list of questions:
What are the steps? What does each one consume and produce? What does good look
like? Can we check? What does each step cost? What happens when a step fails? and how do you know it failed rather than "looked plausible"?

Ask those five questions of a process in your own organisation. Onboarding, a compliance
review, the route from a raised ticket to production code. Most organisations
cannot answer them.

This is because human processes degrade gracefully. Where there is a gap, somebody fills it: they
ask a colleague, they remember the exception, they find a document is out of date and work round it and so on.
The gap rarely gets written down because it doesn't cause enough of a problem.
Or at least, the cost of absorbing it is less than the cost of writing it down. (Humans are very good at that type of judgement)
Automation removes the absorber, and the gap surfaces immediately as a defect.
This is why so many automation projects are a major discovery process.

## The mapping

**Provenance** on every output, meaning the model, the exact instruction, the inputs
and the timestamp, is an audit trail. In regulated work it decides whether a
system can be procured at all, independently of how good the output is.

Cost per call, attributed to the step that incurred it, is **unit economics** at the
resolution of the work rather than the department. We know what a story costs,
that image generation dominates the bill, and what text generation failure costs.

Stage records across many runs are process mining. Duration by stage across a
batch shows where the time goes, and it is the **analysis** you would run over a
workflow tool's event log if anyone had kept one.

Evaluations are acceptance criteria that someone who did not do the work can
check. Ours is level compliance: a story graded to JLPT N4 either stays inside N4
and N5 kanji or it does not, and a script settles it. "Well written" hands the
standard back to the reviewer to supply.

Content addressing, where an output is keyed by a hash of the input that produced
it, is impact analysis. Change one clause of a source document and the keys tell
you which downstream outputs are now stale and which are untouched. Very few
organisations can provide that answer.

## The bug that makes the point

Our stage records wrote a cost on success only. A call that spent money and then
returned something unusable was recorded as free.

We found it when a degenerate loop cost roughly a hundred times a normal call and
the records showed nothing at all. The fix was small: the error carries the cost.

The same bug runs through most reported numbers. Rework, abandoned drafts, the
review that bounced three times, the ticket reopened twice, the document nobody
could use so they rewrote it themselves. All of it is spend, and none of it
reaches the figures that get reported upwards. The organisation knows the cost of
time, but not the cost of inefficient work.

No AI is needed to find that. Instrumentation is enough.

## What follows

Build an instrumentation habit. Ask who else would want to see it.
The data already exists, rendering it costs close to nothing, and the debug view
is often the thing a customer, an auditor or a reviewer will ask about.

Before automating a process, instrument the human version of it using a machine schema.
Record the steps, the inputs and outputs, the duration, the cost, and the failures, including the
ones somebody absorbed. People will be reluctant to do this because it is bureaucratic and tedious; exactly what machines love!

Automate, and you hold a specification of what and a baseline to measure against.

At this point, you hold a written description of a process, itemised costs, a specification for automation and a description of the risks and costs.

The failed AI pilots we have observed mostly fail because there was no coherent goal.
Instrumenting first moves that finding forward, from a write-off to the deliverable.
