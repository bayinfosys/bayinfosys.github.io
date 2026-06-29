---
date: 2026-06-29
layout: article
title: "Engineering in the Exponential Age"
description: "Capability is arriving faster than teams can absorb it. The engineering task becomes assembly, not construction: protocols and interfaces in place of bespoke services."
keywords: ["software engineering trends", "build vs integrate", "ai engineering skills", "composable systems", "decentralised identity", "engineering in the age of ai", "protocols vs platforms"]
topic: "Product & Strategy"
seo_title: "Engineering in the Exponential Age: Assembly Over Construction"
related:
  - 45-fat-protocols-for-ai
  - 42-software-engineering-solved-governance
  - 35-faster-horses
  - 71-friction-builders
---

# Engineering in the Exponential Age

Teams absorb capability at a linear rate. Evaluating a new tool, integrating a new API, benchmarking against production: each takes a fixed amount of attention, and attention does not scale fast enough.
Capability itself has been arriving at an exponential rate for several years. Foundation models, specialist inference APIs, edge compute, decentralised identity protocols:
each category improves and multiplies faster than any team can evaluate it, let alone build a custom version of it.
The gap between these two rates is the engineering constraint most organisations are working against.

The traditional response to a new requirement is to build a service for it: authentication, storage, compute, ML inference, each owned and maintained by the team that built it.
This works at linear scale, where requirements arrive slowly enough that a bespoke build is the cheapest way to meet them, and where owning the stack gives control over its failure modes.
Most software engineering practice assumes this is the default shape of the work.
At the rate capability now arrives, the assumption breaks.
By the time a custom auth service, a custom inference pipeline, or a custom retrieval layer reaches production, two or three better alternatives already exist outside the organisation.
The work is usually done correctly. It is simply aimed at a target that moved before delivery.

Engineering in the exponential age is the assembly of components, not the construction of them.
The building blocks have changed to match. SOLID-era object orientation organised systems around class hierarchy and inheritance: behaviour composed by extending a base class, overriding a method, slotting a new type into a hierarchy designed in advance, the way C++ and Java systems were built for two decades.
Protocols and interfaces do the equivalent job now, but the composition happens across systems rather than within one codebase's type system.
SOLID principles have not been abandoned so much as relocated. Outside API design, where the interface contract is still the explicit unit of composition, almost nobody discusses them anymore, because the class stopped being where composition happens.
The skill that matters is recognising which capabilities already exist in a usable form, and connecting them through a clean interface, faster than any team could rebuild the equivalent from scratch.

A large share of code has always served a single context and never needed to compose with anything: throwaway scripts, one-off pages, internal tooling nobody else will touch.
AI coding tools have made this category largely automatic.
That is a genuine lowering of the bar, but only for code that was never going to be load-bearing.
The bar for the integration layer itself, the part other systems depend on, has moved in the opposite direction: the easy work leaving the field makes what remains considerably more visible.

**Version control and delivery.** Git did not give engineers a new capability; version control already existed.
What it did was make branching and merging cheap enough that workflows previously too expensive to attempt became standard practice, without anyone needing permission to try them.
CI/CD followed the same logic in a different place: it did not change what software does, it changed the rate at which anyone could find out whether a change had broken something.
Both became infrastructure that other tools and workflows assembled around.

**Authentication.** A service-oriented team builds and runs its own auth system: user tables, session management, password resets, the usual surface area to patch and defend.
Decentralised identity turns this into a verification step.
An organisation checks a credential against a protocol nobody controls, rather than operating the system that issues and stores credentials.
The engineering work shrinks to implementing the interface correctly. Nothing is left running that needs to be scaled or defended on an ongoing basis.

**Pipeline orchestration.** AI pipelines that route between embedding, classification, and generation steps used to mean bespoke glue code at every junction, rewritten whenever the model in one step changed.
Treating the branching logic as data rather than code (the pattern behind tools like [runfox](/library/54-runfox)) turns the pipeline into something assembled from interchangeable parts.
The value sits in the orchestration layer that lets the parts interoperate, which is the same argument the fat protocol thesis makes about where value accumulates in any stack built from shared, thin applications.

Genuine engineering craft re-enters at the point of assembly: a capability the ecosystem does not yet have, or one that exists only inside something too large and coupled to be a reliable component.
Filling that gap is a different design problem from building for an end user.
The relevant question shifts from what the user needs to what the ecosystem needs, and that shift produces different systems: smaller, built to a clean interface, added without disrupting the flows already running around them.
The engineering properties that earn the trust to be assembled into something larger, immutability, idempotency, least privilege, append-only state, are the same properties that make a [system governable](/library/42-software-engineering-solved-governance).

Assembly is harder than it looks: recognising a genuine gap, judging which existing component deserves to be trusted, and building to a standard the next layer of engineers can rely on without needing to know you exist.
The exponential age does not make engineering skill obsolete. It raises the bar.
