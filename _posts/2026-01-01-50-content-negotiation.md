---
layout: article
title: "Content Negotiation Was a Good Idea"
description: "HTTP content negotiation was designed to decouple content from form. It stopped at format selection. Generative inference completes the original intention."
keywords: ["content negotiation", "generative ai", "marigold", "device capability", "inference", "content delivery"]
topic: "Perspectives"
last_modified_at: 2026-04-17
---

**Content Negotiation Was a Good Idea**

When your browser requests a web page, it sends an `Accept` header: a declaration of what it can handle. `text/html`, `application/json`, `image/webp`. The server reads this and returns the best match from whatever it has. The mechanism is called content negotiation, and it has been part of HTTP since 1996.

It was designed to decouple content from form. In practice, it decouples content from format -- the same data in different serialisations. The server selects from pre-existing variants. It does not produce anything new. The gap between what content negotiation was designed to do and what it actually does has been papered over for thirty years by production pipelines: thumbnail generators, responsive image srcsets, video transcoders, mobile rewrites. Enormous engineering effort maintaining format variants that a different approach would handle automatically.

That approach is now available.

**The cache miss problem**

Pre-generated content systems have a hard failure mode: the variant does not exist. A device requests a format the pipeline never produced, and the server either returns the wrong thing or nothing. A cache miss is a failure.

In a generative system, a cache miss is a slower hit. The server has an inference backend -- an Ollama instance, a Marigold workflow, whatever sits behind the API -- and the capability declaration from the client determines what to generate, not which pre-existing file to retrieve. The failure mode converts into a latency event. This is familiar behaviour from ML systems generally: you trade hard failures for degraded-but-present results. The system does not break; it slows.

The cache still exists. Content generated for a device on first request is stored. Subsequent requests from the same device class are fast. The cache is no longer a production pipeline output maintained ahead of demand; it is a lazily populated artefact of actual demand. Devices that never request a given piece of content never generate a variant for it. You stop paying for content nobody consumes.

Model upgrades are handled cleanly. Invalidate the cache on model version change and let demand rebuild it. The cache reflects the current model's output rather than a snapshot from whenever the pipeline last ran. No migration strategy, no stale variants.

**What capability declaration actually means**

HTTP `Accept` headers describe format. A richer capability declaration describes the rendering surface: colour depth, audio support, display dimensions, interaction model, bandwidth. These are different questions, and the answers determine not just which file to serve but what to generate.

A teletype terminal is text only. Constrained bandwidth, no rendering, sequential output. The web's text-first assumptions descend directly from this era; the inheritance is visible in every plain-text fallback ever written. Content for a teletype is not a stripped version of something richer -- it is the argument, without any of the assumptions about what the reader's surface can do.

An e-ink reader sits differently. The xteink X4 can connect to a web service and make requests. It renders monochrome, handles static images, and is built for long-form reading. Video is useless to it. A transcript with considered image selection is not a degraded form of a video essay; it is the same content on the only surface that device offers.

A marketing display inverts the usual assumption. A 4K screen is not a limited device -- it is a specific capability profile: no audio, autoplay, must be legible at distance, often in a noisy environment. Subtitles are not optional; they must be baked into the generated output. Pre-generative pipelines handle this by commissioning a separate asset. Generative negotiation handles it by knowing the profile.

Each of these cases involves adapting content downward or sideways from some canonical form. The holographic display breaks that pattern entirely.

**The case that makes the argument**

Spinning-arm holographic displays and depth-enabled screens cannot receive existing content. Not in a degraded form -- at all. There are no cached variants because nobody has produced any. The pre-generative pipeline has no answer. A cache miss is not a slow hit; it is a permanent gap.

Marigold has an image-to-depth workflow. It converts video to 3D video and images to depth images, ready for rendering on depth-enabled devices. A request from a holographic display triggers that workflow. The content exists in one canonical form; the device capability declaration determines the generation path. The xteink gets a transcript. The marketing screen gets captioned video. The holographic display gets a depth render. None of these variants existed before the request. All of them are the same content.

This is what content negotiation was designed to do. The infrastructure to complete the original intention now exists.

**What changes**

Content, in the current model, is the artefact -- the video file, the article HTML, the image asset. In this model, content is the meaning, and the artefact is produced on demand for the device that receives it. One canonical source, one generation layer, one cache that populates on demand.

The production pipelines that maintain format variants -- the thumbnail generators, the responsive image tooling, the mobile rewrites -- solved a real problem with the tools available at the time. Nobody would design them from scratch today.

*(Marigold is a typed inference platform for privately hosted models with a declarative workflow engine. The image-to-depth workflow is in production. https://bayis.co.uk/marigold)*
