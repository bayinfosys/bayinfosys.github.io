---
date: 2026-10-15
layout: article
title: "Durable Execution vs Workflow Orchestration: Two Questions That Separate the Tools"
seo_title: "Durable Execution vs Workflow Orchestration: Temporal, DBOS, Airflow, Prefect, LangGraph Compared"
description: "What is the difference between Temporal, DBOS, Airflow, Dagster, Prefect, Step Functions, LangGraph and runfox? Two questions sort them: when the shape of the work is fixed, and where progress is recorded. The answers decide recovery, repair and fit."
keywords: ["durable execution vs workflow orchestration", "workflow orchestration tools comparison", "difference between temporal and airflow", "dbos vs temporal", "prefect vs dagster", "langgraph durable execution", "step functions vs temporal", "runfox", "durable workflows"]
topic: "Developer Tools"
related:
  - 112-dbos
  - 44-static-vs-dynamic-planning
  - 54-runfox
  - 51-dynawrap
---

# Durable Execution vs Workflow Orchestration: Two Questions That Separate the Tools

Workflow tools are usually compared feature by feature: language support, user interface, pricing, the length of the integrations page.
Those lists grow with every release and say little about which tool suits a given job.
We can sort the tools more usefully with two questions.
When is the shape of the work fixed?
And where, and how, is the record of progress kept?
The answers decide the rules your code must follow, how a failed run recovers, how you repair one, and which problems the tool fits.

We apply both questions to eight tools: Apache Airflow, Dagster, Prefect, AWS Step Functions, Temporal, DBOS, LangGraph and [runfox](/library/54-runfox.html).
(runfox is our own library. It is included because it sits at an unusual point on both axes).
From the answers we build a procedure for choosing between them.

## Durable execution and workflow orchestration

We can trace the two terms to different communities, and they overlap heavily.
Workflow orchestration grew up around data pipelines: a scheduler runs a graph of tasks on a timetable, retries the ones that fail, and shows the history in a user interface.
Durable execution grew up around application code: a function records the result of each step as it runs, so a crash or a deployment interrupts it without losing its place.
(Our article on [DBOS](/library/112-dbos.html) covers that mechanism).
Every tool here does some of both, and the two questions locate the real differences more precisely than either label.

## Question one: when is the shape of the work fixed?

Some tools need the whole graph before anything runs.
Airflow parses a DAG file into tasks and dependencies; Dagster assembles a job from its ops or assets; Step Functions takes a state machine written in the Amazon States Language; runfox takes a YAML document.
Each allows some runtime variation inside the declared frame.
Airflow's dynamic task mapping creates a variable number of task instances from an upstream task's output, and Dagster's dynamic outputs do the same.
Step Functions has Choice and Map states.
runfox evaluates branch conditions against step outputs and expresses loops by resetting a step.
None of them lets the running work add a kind of step the definition did not declare, and an Airflow DAG cannot contain a cycle at all.

Other tools discover the shape by running ordinary code.
A Temporal workflow, a DBOS workflow and a Prefect flow are functions, and whatever steps they call, in whatever order and however many times, is the workflow.
Inngest, Restate and Hatchet's durable tasks follow the same model.
Hatchet offers both models and gives a plain rule for choosing: if the structure is not known before the workflow starts, or it contains loops, a DAG cannot express it.

LangGraph sits between the two.
A graph's nodes and edges are declared before it runs, but conditional edges choose the next node at runtime and cycles are allowed, which is what an agent loop needs.
Its functional API drops the declared graph in favour of ordinary functions.

A declared shape is information held before execution.
You can review a definition without running it, list the models or services it will call, estimate its cost, and store and version it as data.
A discovered shape is expressiveness: anything the language can express, including loops whose length depends on what a model says.
Agents fall almost entirely on the discovered side.
This is the distinction between [static and dynamic planning](/library/44-static-vs-dynamic-planning.html), seen from the infrastructure end.

## Question two: where, and how, is progress recorded?

The second question has three parts: who owns the store, what a record contains, and how much the tool asks of the store.

**A service owns the record.**
Temporal's history service writes an ordered event history for every workflow to its own database (Cassandra, MySQL, PostgreSQL or SQLite), and workers run code on its instruction.
Step Functions keeps execution history inside AWS for Standard workflows; Express workflows keep none.
Airflow's scheduler records task state in its metadata database.
Dagster records runs in its run storage, which can be Postgres, and hands step outputs between steps through IO managers.
Prefect reports run state to its API and keeps task results only when result persistence is switched on, which by default it is not.
In each case there is a service to operate or rent, and the record is reached through it.

**A library writes the record into your database.**
DBOS writes workflow inputs, every step output and the final result into tables in a Postgres or SQLite database you own, from inside your own process.
LangGraph's checkpointers save snapshots of the graph's state to Postgres, SQLite or Redis, at a frequency set by its durability mode: on exit only, asynchronously while the next step runs, or synchronously before it starts.
runfox keeps one record per run through a Store, with in-memory, SQLite and DynamoDB implementations (the DynamoDB store is built on our [dynawrap](https://pypi.org/project/dynawrap/) library, which offers the same interface over Postgres).

Within the second group, the richness of the persistence interface varies most.
DBOS asks a great deal of its database: SQL, transactions, and a schema it migrates itself.
That buys exactly-once database writes (a step's outcome is recorded in the same transaction as the application's write) and a run history you can query and join directly, and it limits the database to Postgres or SQLite.
runfox asks almost nothing.
Its Store has two operations, load a run's record and write it back, so anything that can store a document by key can back it, and the same workflow definition runs in-process, against SQLite, or across DynamoDB and SQS without changes.
Features that need more from the store (queries across runs, transactions spanning a step and the application's own data) are absent from the core.
The design leaves room for them all the same.
An application that commits to one store can build them over the same record format with that store's native queries.
Capability grows by constraining the choice of store for one deployment, and the core stays portable for every other.

## How a failed run recovers

Recovery is where the two answers combine.

Tools that discover the shape recover by **replay**.
Temporal re-executes the workflow function against its event history, returning recorded results for completed steps and raising a non-determinism error if the code takes a different path.
DBOS does the same against its tables, and Inngest re-invokes the function with the memoized results of completed steps.
Replay is the reason these tools require deterministic workflow code: the record only means something if re-running the code makes the same calls in the same order.

Tools that declare the shape recover by **resuming from recorded state**.
There is no code to replay, so there is no determinism rule.
Step Functions can redrive a failed Standard execution from the failed state within fourteen days, keeping the results of the steps that succeeded.
Dagster re-executes a run from failure, skipping completed steps and loading their outputs through the IO manager.
Airflow retries failed tasks and lets an operator clear a task to run it again.
runfox rehydrates the run's record and advances from it, so a restarted process carries on from the last write.

Two tools fall between.
Prefect re-runs a flow and skips the tasks whose results it can load from its cache, which works only with persistence switched on.
LangGraph resumes from the start of the node that was interrupted, so the node's work is repeated unless its side effects sit inside tasks, and its documentation asks for deterministic, idempotent workflows for that reason.

Granularity matters as much as mechanism.
Replay and per-step state protect each step.
A per-node checkpoint protects each node, and a node that makes three model calls and fails on the third repeats all three.

Every tool also needs something to notice that a worker has died.
The services handle this centrally.
DBOS recovers a process's own workflows when the process restarts, and across several machines it relies on its Conductor service or on recovery calls you make yourself.
runfox, as of version 0.0.7, leaves this to the runner: a worker that dies without writing a result leaves its run waiting, so executors are expected to catch their own errors and return them as data.

## How a broken run is repaired

When the fault is a bug in the workflow itself, the two answers decide the repair.

In a code-defined workflow the bug can sit anywhere in the code, including the glue between steps.
The fix is a deployment followed by a re-run from the faulty step on the new version (Temporal's reset, DBOS's fork and rewind).
Recorded steps before that point are kept, so expensive work is not repeated, but every in-flight run that reaches the bug fails until the deployment lands.

In a declared workflow, a mistake in wiring or branching is a mistake in data, fixed by editing the definition without redeploying the executor.
The executor is still code, and a bug there needs a deployment like any other.
Declared definitions can also fail more quietly.
In expression languages such as JSON Logic, a reference to a missing field yields null, and a mistyped path can carry that null through to a wrong result with nothing raised along the way.

## Eight tools on two axes

| Tool | When the shape is fixed | Where progress is recorded | Recovery |
|---|---|---|---|
| Airflow | Parse time; runtime fan-out via task mapping; no cycles | Scheduler's metadata database | Task retries; clear and re-run |
| Dagster | Definition time; runtime fan-out via dynamic outputs | Run storage; outputs via IO managers | Re-execute from failure |
| Prefect | Runtime, as Python | Prefect API; task results only if persistence is on | Re-run, skipping cached tasks |
| Step Functions | State machine definition | AWS-managed history (Standard workflows) | Redrive from the failed state |
| Temporal | Runtime, as code | Event history in Temporal's database | Replay |
| DBOS | Runtime, as code | Tables in your Postgres or SQLite | Replay |
| LangGraph | Declared nodes; runtime routing and cycles | Checkpoints in your Postgres, SQLite or Redis | Resume at the start of the interrupted node |
| runfox | YAML definition; branches and loops | One record per run via a Store (memory, SQLite, DynamoDB) | Rehydrate the record and advance |

## How to choose

We can build a selection procedure from the two questions.

If the shape of the work is known before it starts and the work runs on a schedule over data, the declared orchestrators fit: Airflow for task pipelines with its large operator ecosystem, Dagster where the unit of thought is a data asset.
Step Functions fits the same declared shape when the steps are AWS services and someone else should run the orchestrator.
runfox fits it when the definition should be a portable document, executed by a library inside your own process against whichever store the deployment already has.

If the shape is decided while the work runs (agents, business processes that wait on people, anything with loops of unknown length), the replay family fits, and the second question chooses within it.
DBOS suits teams that already run Postgres and want no further service.
Temporal suits teams willing to operate or rent a service in return for multi-language workers and a long production record.
LangGraph's checkpointer suits agents already written in LangGraph, provided side effects are wrapped in tasks so that node-level resumption does not repeat them.
Prefect sits across the line: flows are ordinary code with a service alongside, and its durability is a result cache that has to be switched on.

The tools differ in many further ways, and those differences matter at the margins.
The important ones (determinism rules, recovery granularity, the shape of a repair, what must be operated) follow from where a tool stands on the two questions.

If you are making this choice for an AI system, [we can help](/#contact-us).
