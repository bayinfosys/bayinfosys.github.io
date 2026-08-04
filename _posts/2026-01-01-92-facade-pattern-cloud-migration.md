	---
date: 2026-04-25
layout: article
title: "The Facade Pattern Is What Makes a Cloud Migration Survivable"
seo_title: "Facade Pattern for Cloud Migration: Isolating Vendor SDKs"
description: "The cost of a cloud migration is rarely the infrastructure move itself. It is finding every place in the codebase that calls a vendor SDK directly and changing it correctly. The facade pattern moves that risk into a single file."
keywords: ["facade pattern", "cloud migration", "boto3", "azure blob storage", "software architecture", "vendor lock-in", "dynawrap"]
topic: "Architecture & Deployment"
related:
  - 51-dynawrap
  - 15-saas-architecture-101
  - 30-facebook-db
  - 52-fastapi-aws
  - 29-platforms-vs-pipelines
---

# The Facade Pattern Is What Makes a Cloud Migration Survivable

The pain in a cloud migration is finding every place in the application code that talks directly to a vendor SDK, and changing all of them, correctly, without missing one.

## The Problem in Practice

A codebase that calls `boto3` directly, in twelve files, in forty places, wherever someone needed to read or write a file, has to be found and changed in twelve files, in forty places, when the underlying storage moves from S3 to Azure Blob.
Every one of those call sites is a chance to get the semantics slightly wrong: a different default for content type, a different way of handling a missing key, a different exception type that the calling code was never written to catch.

One symptom shows up early in a migration like this: a module named `s3utils.py` whose functions all call Azure Blob utilities internally.
Not a functional problem, but it will confuse anyone reading the code cold.

The naming is a symptom. The cause is treating the storage SDK as something business logic talks to directly, instead of through an interface owned by your own code.

## The Fix Is Old and Boring: A Facade

The facade pattern predates cloud computing by decades, and it is exactly the right tool here.
Define your own functions, `read_object`, `write_object`, `list_objects`, whatever the domain needs, and route every part of the application through those, never through the vendor SDK directly.
The vendor SDK lives behind the facade, in one file, in one place.

When the backend changes, you change one file.
Everything that called `read_object` does not know or care that the implementation swapped from `boto3.client('s3').get_object()` to `BlobServiceClient().get_blob_client().download_blob()`.
The interface did not move.

A codebase built this way turns "migrate the storage layer" from a search scattered across the entire application into a rewrite of a single utility module. Every call site is untouched.

## Applying to Other Backends: Databases, Queues, Anything Swappable

The same reasoning applies anywhere a vendor-specific client sits between your logic and a resource: queues, secrets managers, even the database driver if you are disciplined about it.
The question worth asking of any new integration is what interface your own code should see, regardless of which vendor sits behind it.

That discipline shows up in small decisions as much as large ones.
Reusing an existing facade function for a slightly different calling convention, rather than adding a parallel one, is the pattern holding under time pressure.
The alternative (a second function that does almost the same thing, called from one place) is how facades erode back into the twelve-files-of-direct-calls problem they were meant to prevent.

## Where We've Taken This Further

This is the premise behind [dynawrap](/library/51-dynawrap.html), a library built around this problem for DynamoDB: define access patterns on a class, and swap the backend implementation, DynamoDB or PostgreSQL when AWS is not available, without touching the code that calls it.
DynamoDB in particular punishes you for skipping this discipline, because `boto3` enforces none of the access-pattern thinking the database actually needs.
The facade is where that discipline has to live, if it is going to live anywhere.

If a migration is on the horizon and the code talks to a vendor SDK directly from business logic, that is the first thing to fix.
The infrastructure move is usually the easy part once it is in place.

(If a migration like this is a live problem in a project you are building, [get in touch](/#contact-us).)
