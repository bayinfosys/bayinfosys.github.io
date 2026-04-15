---
title: "Software Engineering Solved Governance"
description: "Single source of truth, idempotency, rollback, least privilege -- software engineers formalised governance problems that other institutions still handle by convention."
keywords: ["software engineering", "governance", "single source of truth", "idempotency", "data governance"]
topic: "Perspectives"
last_modified_at: 2025-01-01
---

# Software Engineering Solved Governance

Software engineers spend a lot of time solving problems that look, on the surface, like technical problems. They are not. They are governance problems. The technical layer is just where they became impossible to ignore.

Consider what happens when two systems need to agree on the same fact. A customer's address exists in the CRM, the billing system, and the delivery platform. Each has a slightly different version. Which one is correct? This is not a database problem. It is an authority problem: who owns this information, and whose version governs when they conflict? Software engineers formalised the answer as "single source of truth" -- one system holds the canonical record, others defer to it. The concept is not inherently technical. It applies wherever the same fact needs to be consistent across multiple parties, which is to say everywhere.

Software engineering is full of concepts like this. They look like technical solutions because they were developed by engineers working on technical systems. But the underlying problems -- accountability, reversibility, authority, consistency -- are problems every institution faces. Most institutions have not solved them with the same rigour, because the consequences of not solving them are slower and more diffuse than a system crash.

## What the Concepts Are

**Single source of truth.** One authoritative record. All other representations are derived from it and updated when it changes. The concept imposes clarity about ownership: someone has to be responsible for the canonical version.

**Immutability and append-only records.** Rather than modifying a record when something changes, you add a new record noting what changed and when. The history is preserved. You can reconstruct the state at any point in the past. Accounting has worked this way for centuries -- the ledger is append-only. Most other record-keeping has not.

**Change events.** When something changes, a signal is emitted that other systems can observe and respond to. Nobody polls for updates. Systems react to what has happened rather than repeatedly asking whether anything has changed. The design question is who gets to know what, and when.

**Idempotency.** Applying an operation multiple times produces the same result as applying it once. If a payment instruction is processed twice due to a network error, the money moves only once. The system is designed to be safe under repetition. This is a property of how bureaucratic processes fail -- and how they are rarely designed to recover.

**Rollback.** Any change can be reversed. You do not fix a mistake by applying a correction on top of it; you restore the prior state. This requires that prior states be preserved, which requires immutability, which is why these concepts tend to cluster together.

**Least privilege.** Every actor in a system has access only to what they need for their specific role. Not more. Access accumulates naturally if left unmanaged -- people change roles, inherit permissions, accumulate access over time. The principle is that access should be granted explicitly and reviewed regularly rather than assumed to be correct because it has not caused a problem yet.

## The Pattern

Across all of these, the same structure recurs. A problem of human coordination -- who is responsible for this fact, what happened and when, who is allowed to do what, what do we do when something goes wrong -- has been given a formal solution. The solution imposes discipline that convention and goodwill were meant to provide but reliably did not.

Software engineers did not invent these problems. They encountered them at a scale and speed where the informal solutions broke down visibly and immediately. A distributed system with a thousand services cannot rely on people checking with each other to keep data consistent. It needs a protocol. The protocol encodes, as a technical constraint, what human institutions are supposed to enforce through culture and process.

The enforcement gap is where institutions tend to fail. A government department has a single source of truth policy and three systems that do not talk to each other. A regulated firm has change management processes and no way to audit what changed when. A large organisation has access control policies and credentials that have not been reviewed since the person who held them left three years ago. These are not failures of policy. They are failures of enforcement, and enforcement is exactly what formal systems are designed to provide.

## What Would Change

Applying these concepts to institutions is not a new idea. Some of them appear in accounting standards, data protection regulation, and governance frameworks under different names and with varying degrees of rigour.

What would change is treating them as engineering problems rather than policy problems. Policy states what should happen. Engineering makes it structurally difficult for anything else to happen. The difference is whether the discipline is enforced by convention -- people doing the right thing because they are supposed to -- or by design -- systems that cannot record a change without logging it, cannot process a transaction twice without detecting the duplication, cannot grant access without an explicit authorisation.

Most institutions rely on the former and are occasionally surprised by the consequences.

Software engineering's contribution is not a set of answers. It is a vocabulary for questions that other fields have not finished asking: who owns this, what happened, who is allowed, and what do we do when it goes wrong?
