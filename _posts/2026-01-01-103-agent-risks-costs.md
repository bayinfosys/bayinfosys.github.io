---
date: 2026-07-26
layout: article
title: "Agent Risks, Costs, and Governance"
description: "RAG's main risk is data leaving the building. An agent's main risk is different in kind: it can take the wrong action, not just retrieve the wrong document, and its cost scales with steps rather than tokens."
keywords: ["ai agent risks", "agent cost", "denial of wallet attack", "agent governance", "agent memory corruption", "MINJA", "least privilege ai agents", "agent security"]
topic: "AI Systems"
seo_title: "Agent Risks and Costs: Governance, Denial-of-Wallet, and Exposure"
related:
  - 09-data-risks
  - 65-why-private-inference
  - 95-private-inference-costs
  - 42-software-engineering-solved-governance
---

# Agent Risks, Costs, and Governance

RAG's main risk is what leaves the building: documents and queries sent to a third party at the point of embedding, again at the point of generation. An agent carries that same exposure, since its intermediate reasoning and tool calls still transit whatever API is running the model, but exposure isn't the risk that should worry you most about an agent. An agent doesn't just read and surface information. It acts. That single difference changes the shape of both the cost problem and the governance problem, and makes governance the harder of the two.

## Cost: steps, not tokens

A RAG query's cost is bounded by the size of the retrieved context, which is bounded by how many passages you choose to retrieve. An agent's cost has no equivalent ceiling built in. A single task can trigger any number of tool calls, retries on failure, and sub-agent delegations, and the total is only known once the loop has actually terminated. A task that should take three steps and instead takes thirty, because a tool call keeps failing in a way the agent keeps trying to work around, is not a slow task. It's a cost incident, and it can run up a bill for hours before anyone notices, since nothing about a longer loop looks different from a working one until someone checks the total.

This has an adversarial version worth naming directly: a denial-of-wallet attack, where an attacker deliberately floods a system with queries engineered to be expensive to answer, running up operational spend rather than attempting to break anything. A publicly reachable agent with no cap on steps per task or cost per session is exposed to this in a way a fixed pipeline, whose cost per request is fixed by design, structurally is not.

The practical fix is a hard ceiling, not a soft one: a maximum step count and a maximum cost per task, enforced by the harness or framework rather than left to the agent's own judgement about when to stop, because an agent that hasn't succeeded yet has no internal signal telling it that it should give up.

## Governance: the read-versus-write line

RAG's governance gap is that retrieval can ignore permissions and surface a document to someone who shouldn't see it. That's a real failure, and it's a passive one: wrong information reaches the wrong reader. An agent's equivalent failure is active. An agent that ignores permissions doesn't surface the wrong record, it sends the email, deletes the row, executes the trade, merges the pull request. Read-versus-write is the axis that makes agent governance a different order of problem rather than a bigger version of the same one, because the failure is no longer something a human downstream might catch before acting on it. The agent has already acted.

The vocabulary for the fix already exists, and it isn't new to AI: least privilege, the principle that every actor in a system has access only to what its specific role requires, reviewed rather than assumed correct because it hasn't caused a problem yet. Applied to an agent, this means tool-level permissioning (an agent scoped to read a calendar should not also hold the credential to send on someone's behalf), approval gates on anything destructive or irreversible, and an audit trail that records which action was taken, on whose authority, and why, the same discipline software engineering already formalised for exactly this kind of accountability problem.

Memory introduces its own version of this risk, distinct from action-taking but compounding it. MINJA, a memory injection attack, manipulates what an agent's memory persistence layer stores, so that misinformation introduced once continues to shape the agent's behaviour across future sessions rather than being corrected the next time the topic comes up. An agent acting on corrupted memory isn't making a one-off mistake; it's repeating a wrong belief, with the authority to act on it, for as long as the corrupted entry survives in the memory store.

## Exposure: carried over, not new

The third risk is the one RAG already covers structurally, and it doesn't change much in the agent case beyond scale. An agent's intermediate reasoning, its tool call arguments, and the results those tools return, all transit a third-party API on every step of the loop unless the model is self-hosted. A multi-step agent task sends more data across that boundary than a single RAG query does, simply because there are more steps, each one a separate call carrying whatever the agent has accumulated so far. The argument here is the same one made in [Why Private Inference](/library/65-why-private-inference.html): a commercial API is, architecturally, a third-party processor, regardless of what its retention policy claims, and an agent multiplies the number of times that boundary gets crossed per task rather than introducing a new kind of crossing.

## What this changes about the build

The cost and exposure problems share the same structural fix as they did for RAG: running the model on infrastructure you control removes the third party from the loop entirely, and turns a metered cost that scales with steps into compute you already own. This is the argument for [runfox and Marigold](/library/54-runfox.html) in the agent context specifically, a static-planning engine and a self-hosted endpoint mean an agent's tool calls never leave the host, and a runaway loop costs electricity rather than an unbounded API bill.

Governance doesn't have an infrastructure fix in the same way. Least privilege, approval gates, and audit trails are design decisions that have to be made regardless of where the model runs, and they're the one item on this list that self-hosting doesn't solve for you.

(If you're scoping the permission model or cost ceiling for an agent build, [get in touch](/contact).)
