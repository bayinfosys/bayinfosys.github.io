---
layout: article
title: "What Is Data Engineering? Two Jobs, One Title"
seo_title: "What Is Data Engineering? The Infrastructure vs Product Split Explained"
description: "Data engineering describes two distinct disciplines that require different skills
and produce different failures when confused. Understanding the split is the first step to
hiring and structuring a data team that actually works."
keywords: ["data engineering", "analytics engineer", "data infrastructure", "dimensional modelling",
"dbt", "data quality", "data pipeline", "data team structure"]
last_modified_at: 2026-04-28
related:
  - 05-what-data-do-i-need
  - 17-data-maturity
  - 08-org-sampling
  - 20-vector-db-deepdive
---

# What Is Data Engineering? Two Jobs, One Title

A client came to us with a forecasting problem. Their orders table contained 84 million rows.
Roughly 79 million were unusable: negative quantities, future dates, inconsistent keys where
`Sku_id` and `sku_id` referred to the same product in different parts of the system, records
with no foreign key relationship to anything else in the schema. Ninety-four percent noise.
The data pipeline was running on schedule. Processing was fast. Data moved reliably from
source to warehouse. The infrastructure was competent.

The product engineering had never happened at all.

---

Data engineering is a job title that covers two fundamentally different disciplines. Both are
valuable, both are difficult, and they require different skills, different instincts, and
different ways of thinking about failure. Treating them as one role -- which most job
descriptions do -- produces teams that are either very good at one and blind to the other, or
mediocre at both.

The first discipline is infrastructure engineering. Its subject is movement and reliability:
data arrives from sources, passes through pipelines, and lands somewhere downstream. The
tools are Kafka, Airflow, Spark, and their equivalents. The objective is throughput and
uptime. An infrastructure engineer measures success by whether the pipeline ran, how fast
it ran, and whether it will run again tomorrow. Failures are outages, latency spikes,
and resource exhaustion. The work is operational.

The second discipline is product engineering. Its subject is meaning and usability: data
has a structure, that structure encodes business logic, and downstream consumers -- analysts,
data scientists, product teams -- need to trust that the structure reflects reality
accurately and consistently. The tools are dimensional modelling, constraint definitions,
dbt, and the judgement to know which grain is right for which question. An infrastructure
engineer does not naturally think about grain. A product engineer does not naturally think
about throughput. Both are right not to, within their own domain.

Grain is the concept that separates the two disciplines most cleanly. It describes the level
of detail captured in a data model: whether each row represents a single transaction, a daily
aggregate, a weekly rollup, or the latest known state of an entity. A transaction grain table
supports detailed analysis. A daily aggregate supports trending. A latest-state table supports
operational dashboards. Each grain answers different questions, and the wrong grain does not
just limit analysis -- it actively misleads it. Summing a latest-state table produces
a wrong number. Joining a transaction table to a daily aggregate requires an assumption
about time boundaries that is usually implicit and often wrong. Product engineers define and
enforce grain explicitly. When they do not, the consequence is 79 million garbage rows that
took an afternoon to remove once someone sat down to do the dimensional modelling that should
have been done at schema design.

---

When infrastructure engineers do product work -- as they often do, because someone has to --
the result is recognisable. Wide flat tables appear: hundreds of columns, no relationships
between tables, designed to avoid joins because joins have overhead. Constraints disappear:
the application will handle validation, which means validation is implicit, invisible, and
inconsistent across every application that writes to the table. Generic schemas proliferate:
`attribute_1`, `attribute_2`, everything stored as a string because strings are flexible.
Each of these decisions is defensible from an infrastructure perspective. Performance,
simplicity, flexibility. From a product perspective, they are structural failures that
compound over time: analysts spend their day cleaning data rather than analysing it, models
train on garbage features, and dashboard numbers diverge by team because everyone applies
the cleaning logic differently.

When product engineers ignore infrastructure -- less common, but it happens -- the result
is different but equally dysfunctional. Normalisation becomes an end in itself: fifteen-table
joins for queries that should take seconds, beautiful schemas that are theoretically correct
and practically unusable at the query latencies they produce. Validation constraints so strict
that legitimate edge cases fail silently. Data models that no analyst has read because nobody
explained how to use them. The product is correct in isolation and useless in practice.

The balance is not a compromise between the two positions. It is a recognition that data must
be both structured meaningfully and moved reliably, and that these objectives are best served
by people whose instincts are suited to each.

---

The industry has been resolving this confusion slowly and imperfectly through the analytics
engineer role. An analytics engineer sits between infrastructure and analysis. They build
dbt models with tests and documentation. They define metrics, dimensions, and the
relationships between entities. They own data quality and business logic. They create
datasets that analysts and data scientists can actually trust, without having to understand
Kafka or Spark to do it.

Platform engineers continue to own the infrastructure layer: pipelines, queues,
orchestration, performance, monitoring. Data scientists consume the products that analytics
engineers build. The traditional "data engineer" either collapses into one of these
categories or attempts to cover all three, producing output quality that reflects
the dilution.

In practice, the right structure depends on scale. A team of three cannot support all three
roles as separate positions. But the distinction in thinking is still necessary at any size:
someone has to own the grain, define the constraints, and be accountable for whether the
data downstream is meaningful. That responsibility does not disappear because it is
inconvenient to separate.

The two questions that diagnose which problem you actually have are distinct. If data is
not arriving reliably, processing is too slow, or the system cannot handle volume, the
problem is infrastructure. If analysts spend their time cleaning, the same metric is
calculated differently across teams, or nobody trusts the numbers, the problem is product
engineering. Both can be true simultaneously. They have different solutions.

---

Defining grain is tedious. Documenting constraints is thankless. Writing validation rules
that cover edge cases without rejecting legitimate records requires patience and domain
knowledge that generates no conference talks. The work produces nothing that photographs
well. It is also what makes everything downstream function.

The client's forecasting model was deployable within a week of the dimensional modelling.
Not because the modelling was clever -- it was not; it was straightforward -- but because
94 percent of the noise had been removed, the remaining features had business meaning, and
the grain was defined so the model was training on what it was supposed to be training on.
The infrastructure had been working correctly the whole time. That was never the problem.

(Bay Information Systems runs data audits as Phase 1 of most engagements. If you are
uncertain whether your data problem is infrastructure, product, or both, we can provide answers.)
