---
date: 2026-07-26
layout: article
title: "Serverless on AWS vs Azure: The Real Differences"
seo_title: "AWS Lambda vs Azure Functions: What Actually Changes in a Migration"
description: "Serverless migrations between AWS and Azure look symmetrical on paper. Lambda's one-function-one-deployment model and Azure's Function App grouping are not the same shape, and that gap costs more time than any other part of the move."
keywords: ["aws lambda vs azure functions", "serverless migration", "azure function app", "cloud migration aws to azure", "cognito vs entra id", "serverless architecture comparison"]
topic: "Architecture & Deployment"
related:
  - 02-deploy-simple-model
  - 15-saas-architecture-101
  - 29-platforms-vs-pipelines
  - 01-docker-deep-dive
---

# Serverless on AWS vs Azure: The Real Differences

Most serverless comparisons stop at the marketing layer: Lambda versus Functions, API Gateway versus API Management. The differences that change how you actually build something only surface once you have deployed on both platforms. Here they are, mapped directly.

## The core services

| AWS | Azure | Equivalent? |
|---|---|---|
| Lambda | Function App | Not quite (see below) |
| API Gateway | API Management / Function App routing | Depends on scale |
| Cognito | Entra ID (Azure AD) | Yes, broadly |
| S3 | Blob Storage | Yes |
| RDS (Postgres) | Azure Database for PostgreSQL Flexible Server | Yes |
| SQS | Storage Queues | Yes |
| Step Functions | Logic Apps | Loosely |

Most of that table is a fair trade. The first row carries the weight, and it's the row that catches migrations out.

## Lambda vs Function App

AWS Lambda treats each function as an independent unit: one function, one deployment, one ARN. Azure Functions work differently. A Function App is a container for several related functions, sharing a runtime, a host process, and a deployment unit.

The naming looks trivial. The architecture underneath it isn't. Migrate a set of Lambdas by creating one Function App per Lambda and you end up fighting Azure's deployment model at every step: provisioning overhead per function, cold-start multiplication, an infrastructure layer that assumes grouping and gets none. The fix is to group related endpoints (search, chat, ingest, whatever the domain boundaries are) into a small number of Function Apps, each exposing several routes.

One project migrating around two dozen Lambdas built two dozen separate Function Apps first, then consolidated down to a handful once the mismatch surfaced. Twice the infrastructure work, for one architectural assumption carried over from the wrong platform.

## Auth: Cognito vs Entra ID

This is a clean swap, provided the migration uses MSAL rather than mapping Cognito concepts onto Entra ID directly. The practical shifts:

- Cognito user pools map to Entra ID app registrations, but the mental model moves from "users in a pool" to "users in a tenant, scoped by app registration and API permissions."
- Token acquisition on the frontend moves from Amplify's `signIn()`/`fetchAuthSession()` pattern to MSAL's `acquireTokenSilent()`/popup flow.
- On the backend, JWT validation swaps Cognito's token verification for Entra ID's `allowed_audiences` and issuer checks: conceptually identical, different libraries.
- Pre-authorising your own client application avoids forcing every user through an admin consent screen. Miss this and the login flow looks broken rather than merely unconfigured.

## Storage

S3 to Blob Storage is close to a drop-in swap at the API level. Buckets become containers, keys become blob names, and the SDK change (boto3 to azure-storage-blob) is mechanical rather than conceptual. This is the part of the migration that behaves as advertised.

## Database

Postgres with pgvector on RDS moves to Azure Database for PostgreSQL Flexible Server on close to a connection-string change. `pg_dump`/`pg_restore` cross the boundary without drama, provided the target extensions (pgvector, uuid-ossp, whichever the project uses) exist before the restore runs.

## The effort curve

Plot actual migration effort against the marketing comparison and the picture is uneven. Storage and database are close to free. Auth is a moderate, well-trodden path. Compute (the part everyone assumes is easy, because "it's serverless either way") is where the architectural rework lives.

Scope a serverless migration with that curve in mind. The services that sound the same are not always structured the same, and the row that reads like a rename is usually the one that costs the most. (Migrating and want a second opinion on the Function App boundaries before you build them? Get in touch.)
