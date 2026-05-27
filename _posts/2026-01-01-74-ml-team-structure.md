---
date: 2026-05-27
layout: article
title: "How to Structure an ML Team"
description: "Four roles, four types of competence, and one constraint:
the team's ceiling is its weakest function. What each role owns, how
they interact, and what happens when one is absent."
keywords: ["ml team structure", "machine learning team roles",
"data scientist vs ml engineer", "ai team structure",
"machine learning team", "how to build an ml team",
"machine learning roles and responsibilities", "ml team",
"ai team roles", "machine learning team size"]
topic: "AI Strategy"
seo_title: "How to Structure an ML Team: Roles, Responsibilities, and What Success Looks Like"
related:
  - 18-mle-vs-swe
  - 04-cost-of-ml
  - 17-data-maturity
  - 05-what-data-do-i-need
---

# How to Structure an ML Team

A successful ML project has four roles which must be occupied, and at particular points in the project, the competence of each determines the outcome.
The roles can be distributed across four people, collapsed into two, or carried by one person at reduced effectiveness across the board.
What they cannot do is disappear without consequence. The team's operational ceiling is its weakest function.

## The roles

### Data Scientist

The data scientist finds opportunity in data and defines the problem precisely.
They identify what the data actually contains versus what the organisation believes it contains, propose the right approach for the task, set measurement criteria before any model is built, and own the research loop -- hypothesis, experiment, evaluation -- that precedes further commitment.

The data scientist does not own production.
Their output is a validated approach, a defined task specification, and a measurable definition of success.
What they hand to the ML engineer is a solved problem at research scale.
A notebook that demonstrates an approach is a legitimate output.

### ML Engineer

The ML engineer takes the data scientist's output and makes it run reliably inside a system.
This requires competence across databases and data access patterns, API design, model implementation, deployment, and monitoring.
The MLE owns the production system: its performance, its failure modes, its maintenance, and its measurement under real data at real load.

The MLE is not reimplementing the data scientist's research.
They are translating it -- from a validated approach on a sample to a system that operates on full data, under load, with observable behaviour and recoverable failure states.
The gap between those two things is where most ML projects stall.

(The distinction between ML engineering and software engineering is covered in [MLE vs SWE](/library/18-mle-vs-swe.html).)

### Infrastructure Engineer

The infrastructure engineer owns the hardware boundary.
In practice this means the cloud estate -- instance selection, networking, storage, permissions, and billing -- or at larger scale, physical hardware and the operational practices that keep it running.

Infrastructure decisions constrain what the ML engineer can build and what the data scientist can explore.
A cloud estate configured for cost over performance shapes model selection.
A storage architecture that makes certain access patterns expensive shapes what questions are practical to ask.
Infrastructure is an input to system design, not a consequence of it.
The bill should be understood and predictable.
The environment should be reproducible.

### Domain Expert

The domain expert explain the data.
They justify or refute the assumptions present in a dataset, identify when a model output is plausible but wrong, and articulate what the business actually needs for operational reality.

This is the least transferable skill.
A data scientist can learn a new modelling technique; an ML engineer can learn a new infrastructure stack; but the domain expert's knowledge is accumulated through direct experience with the domain -- its edge cases, its history, its informal rules, and what the data actually means when it looks anomalous.
None of that transfers from another domain or another organisation.

It is also the role that never appears in a job description for an ML team.
Organisations assume they have this competence distributed across the business.
Sometimes they do.
More often, the people who hold it are not close enough to the project to influence it, or are close enough but not empowered to question the data scientist's assumptions.
In small companies the domain expert is frequently the CEO or a comparable executive.
The success of the project is then determined entirely by their engagement. 

## At small scale

One or two people may perform multiple roles.
An MLE working alone covers infrastructure, implementation, and some of the data science.
A data scientist working alone can stand up a notebook, connect it to a data source, and produce something that functions as a product -- a business backed by a Google Sheet is a real and sometimes profitable thing, and there is no failure in it as a starting point.

The constraint at small scale is not the competence within the roles.
A solo data scientist with genuine insight has no path to production without MLE capability.
A solo MLE with a solid system has no guarantee it measures what matters without domain expertise.
A team covering DS and MLE but without infrastructure competence hits a scaling wall the first time the notebook needs to serve real load.

One person can fill multiple roles.
The project's risk profile changes to reflect whichever competence that person carries least confidently -- the chain is only as strong as its' weakest link.
That is a manageable position if it is understood.

## Embedded versus centralised

Centralised ML teams develop strong technical practice and enable productive internal discussion between specialists.
They also develop systematic distance from the products they serve, which tends to produce models that are technically sound and practically underused.

Embedded ML capability shapes the product directly.
The cost is reduced headcount available to any one problem and fewer opportunities for the technical discussion that improves the work.

The model that resolves this most effectively in small organisations is the secondment:
a specialist moves into a product team for the duration of a specific objective, helps shape the next set of goals alongside the product team, and returns to a central function when the objective is met.
The product team gains capability shaped to their context; the specialist avoids permanent isolation from technical peers.

## The missing role

A team without infrastructure competence hits a scaling wall.
A team without MLE competence produces research that never reaches production.
A team without data science competence builds systems that optimise confidently for the wrong outcome.

A team without domain expertise does all of the above correctly and still builds the wrong thing.
That failure is the hardest to diagnose because everything looks right until the system meets the data it was never designed to handle, or the edge case the domain expert would have flagged in week one.

The domain expert cannot be hired from outside the domain.
They need to be present at the beginning.

---

(Bay Information Systems works as an embedded function for defined engagements -- moving into a team, shaping the next set of goals alongside it, and leaving a system the organisation can operate.
[Get in touch](/contact) if that model fits what you are building.)
