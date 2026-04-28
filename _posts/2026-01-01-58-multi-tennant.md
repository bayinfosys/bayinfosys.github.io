---
layout: article
title: "Multi-Tenant Architecture: A Practical Spectrum"
seo_title: "Multi-Tenant Architecture Patterns: From Shared Database to Full Isolation"
description: "Multi-tenancy is not a single pattern. It is a spectrum from shared tables
to fully separate infrastructure, and the right point on that spectrum depends on what
varies between tenants, where your operational complexity budget sits, and what failure
looks like."
keywords: ["multi-tenant architecture", "multi-tenancy", "saas architecture", "tenant isolation",
"database per tenant", "schema per tenant", "row-level security", "saas database design"]
last_modified_at: 2026-04-28
related:
  - 15-saas-architecture-101
  - 21-indirection
  - 29-platforms-vs-pipelines
  - 30-facebook-db
  - 27-schema-docs
---

# Multi-Tenant Architecture: A Practical Spectrum

The multi-tenancy problem usually arrives in a specific form. You have built something
for one customer. It works. A second customer wants the same thing, with minor differences.
A third and fourth follow. The differences accumulate. What started as one system is now
four systems held together by shared infrastructure and diverging assumptions, and the
question of how to manage that variation is urgent in a way it was not when there was
only one tenant.

The standard advice is to "pick a multi-tenancy strategy", as though there is a decision
to make once and then implement. In practice, multi-tenancy is a spectrum. Four patterns
sit at points along it, each with a different position on the trade-off between isolation
and operational simplicity. The right pattern -- or combination of patterns -- depends on
three questions: what actually varies between tenants, where your operational complexity
budget sits, and what failure looks like if tenants bleed into each other.

---

## The spectrum

**Pattern 1: Shared database, shared schema, tenant discriminator.**
Every tenant's data lives in the same tables. A `tenant_id` column distinguishes
records. Queries filter by `tenant_id`; application code is responsible for ensuring
that filter is always present.

```sql
CREATE TABLE documents (
    id          BIGSERIAL PRIMARY KEY,
    tenant_id   TEXT NOT NULL,
    content     TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Every query carries the filter
SELECT * FROM documents WHERE tenant_id = 'acme' AND ...;
```

This is the simplest pattern operationally. One schema to migrate, one database to back
up, one connection pool to manage. It scales to a large number of tenants without
multiplying infrastructure.

The failure mode is a missing filter. One query without `WHERE tenant_id = ?` exposes
every tenant's data to the requesting tenant. Row-level security (RLS) in PostgreSQL
eliminates this class of error by enforcing the filter at the database level rather than
the application level:

```sql
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON documents
    USING (tenant_id = current_setting('app.tenant_id'));
```

With RLS in place, a query that omits the filter returns an empty result set rather than
a full one. That is a bug, but a safe one.

The pattern breaks down when tenants need different schemas, when one tenant's query load
can degrade another's (no resource isolation), or when a tenant's data residency
requirements prohibit co-location with other tenants' data.

**Pattern 2: Shared database, separate schemas.**
Each tenant gets their own schema within a shared database. The tables are identical in
structure but physically separate. Migrations run per-schema; a schema-per-tenant
migration tool handles the fan-out.

```sql
CREATE SCHEMA tenant_acme;

CREATE TABLE tenant_acme.documents (
    id          BIGSERIAL PRIMARY KEY,
    content     TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

The isolation improvement over Pattern 1 is meaningful but bounded. Data is separated at
the schema level; there is no risk of a missing filter exposing cross-tenant data. Query
performance is not isolated: a large tenant running expensive queries shares the same
database process as all other tenants.

The operational cost is schema proliferation. At tens of tenants, manageable. At
hundreds, schema migration becomes a coordination problem. At thousands, this pattern
becomes impractical.

**Pattern 3: Separate databases.**
Each tenant has their own database instance, either on shared or dedicated infrastructure.
Connection management becomes non-trivial: the application needs to route each request to
the correct database, which typically means a connection pool per tenant or a proxy layer
that handles routing.

```python
def get_connection(tenant_id: str):
    config = tenant_registry.get(tenant_id)
    return psycopg2.connect(
        host=config.host,
        dbname=config.dbname,
        user=config.user,
        password=config.password
    )
```

This pattern gives genuine data isolation and, if databases are on separate instances,
genuine resource isolation. It is the right choice when tenants have different data
residency requirements (tenant A's data must stay in the EU; tenant B is US-only), when
regulatory requirements prohibit co-location, or when one tenant's workload is large
enough to justify dedicated resources.

The operational cost scales with tenant count. Each database needs its own backup,
monitoring, migration, and connection management. Automation is necessary at any
meaningful scale; manual database management per tenant is unsustainable past a handful.

**Pattern 4: Separate infrastructure.**
Each tenant runs their own deployment: separate application instances, separate databases,
potentially separate cloud accounts or VPCs. This is full isolation. One tenant's outage
cannot affect another. Customisation per tenant is unconstrained.

The operational cost is correspondingly high. Deployments multiply. Monitoring requires
aggregation across deployments. Upgrades must be coordinated across all instances.
On-call means being responsible for N systems rather than one.

This pattern is justified when tenants are large enterprises with their own security and
compliance requirements, when the contract includes an SLA that requires physical
isolation, or when the customisation required per tenant is substantial enough that a
shared codebase is impractical.

---

## The decision framework

The choice between patterns is not primarily a technical decision. It follows from the
answers to three questions.

**What varies between tenants?** If variation is only in data (each tenant has their own
records, identical schema), Pattern 1 or 2 is sufficient. If variation extends to schema
(different tenants need different fields, different tables), Pattern 3 becomes necessary
unless the variation can be encoded in a flexible schema (JSONB columns, EAV patterns)
within a shared structure. If variation extends to behaviour (different tenants need
different processing logic, different integrations), Pattern 4 may be unavoidable, or the
system needs a configuration layer that separates tenant-specific behaviour from shared
infrastructure.

**Where is your operational complexity budget?** A team of three cannot operate Pattern 4
across fifty tenants. The right question is not "what gives maximum isolation?" but "what
is the most isolation we can operate reliably given our current capacity?" The answer
changes as the team grows. Start with the simplest pattern that meets current requirements,
and evolve on real constraints rather than anticipated ones.

**What does failure look like?** A missing `tenant_id` filter in Pattern 1 is a data
breach. A schema migration that fails halfway through in Pattern 2 leaves half your
tenants on an old schema. A deployment failure in Pattern 4 affects one tenant, not all
of them. The failure modes differ in severity and blast radius. For applications handling
sensitive data, the blast radius of a shared-schema failure may be disqualifying
regardless of the operational simplicity it offers.

---

## Processing multi-tenancy

Data storage and processing isolation are separate questions, and teams often resolve them
at different points on the spectrum. A shared-database architecture (Pattern 1 or 2) may
still need per-tenant processing isolation if tenants have different SLAs or if one
tenant's background jobs can delay another's.

The standard approach is queue-based isolation: each tenant's work items go into a
tenant-specific queue or a queue partition, and workers are allocated proportionally to
tenant tier. A premium tenant gets dedicated workers or higher queue priority. A free-tier
tenant shares workers with others.

```sql
CREATE TABLE work_queue (
    id          BIGSERIAL PRIMARY KEY,
    tenant_id   TEXT NOT NULL,
    tier        TEXT NOT NULL,  -- 'premium', 'standard', 'free'
    payload     JSONB NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    claimed_at  TIMESTAMPTZ
);

SELECT * FROM work_queue
WHERE tier = 'premium' AND claimed_at IS NULL
ORDER BY created_at
LIMIT 1
FOR UPDATE SKIP LOCKED;
```

This is driven by SLA rather than data architecture. A tenant on Pattern 1 storage can
still have Pattern 4-equivalent processing isolation if their queue partition is serviced
by dedicated workers. The two axes are independent.

---

## Evolving between patterns

Migration from one pattern to another is possible but expensive. The direction is almost
always toward more isolation as tenants grow larger or requirements become stricter.

Moving from Pattern 1 to Pattern 2 requires extracting each tenant's data into a separate
schema: a data migration with a cutover, manageable with tooling. Moving from Pattern 2
to Pattern 3 requires provisioning new databases and migrating data across database
boundaries: more involved, but routine with automation. Moving from Pattern 3 to Pattern
4 is the most complex, touching CI/CD, monitoring, and on-call rotation.

Start with the simplest pattern that meets current requirements, and have a clear picture
of the migration trigger before it arrives. Every team that starts with Pattern 4
"because we'll need it eventually" spends the first year operating complexity their tenant
count does not justify. Every team that stays on Pattern 1 indefinitely eventually has a
compliance failure or a data breach.

(If you are working through a multi-tenancy decision for a system currently serving one
tenant and expecting more, that is a common point for an architecture review. Bay
Information Systems runs those as a fixed-scope engagement.)
