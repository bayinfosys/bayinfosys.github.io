---
layout: article
title: "The Embedding is the Message"
description: "AI communication inherited natural language from human communication. That constraint is not a technical necessity."
keywords: ["embeddings", "ai communication", "multimodal", "marigold", "llm", "content delivery"]
topic: "Perspectives"
last_modified_at: 2026-04-02
---

# The Embedding is the Message

[Venkatesh Rao](https://protocolized.summerofprotocols.com/p/have-your-factory-call-my-factory) has been developing an idea called intelligence media: AI not as a tool that makes existing communication faster, but as a new medium in its own right, one in which meaning circulates between human and machine agents in forms that have no clean prior analogue. His framing borrows from Marshall McLuhan -- the medium shapes the message, and intelligence media is a genuinely new medium, not a faster version of an old one.

The piece that crystallised this for me describes factories calling factories: personal AI infrastructures exchanging work-in-progress materials across shared interfaces, producing a new kind of collaborative production that looks nothing like email or Slack or any existing communication protocol. The unit of exchange is not a finished document. It is an intermediate -- a rough manuscript, a partial analysis, a structured output that another factory will process further.

That framing is already a significant shift. But I think it stops one level too high.

## What Language Is

When two people communicate, they encode meaning into language -- a shared symbolic system that both parties have learned to interpret. The encoding is lossy. What I mean and what I say are not the same thing. What you read and what I intended are not the same thing either. Language is a bottleneck we have learned to work around through context, convention, and the assumption of shared knowledge.

When two AI systems communicate in language, they are using the same bottleneck. One model generates text; another model reads it. The intermediate representation -- the text -- is still a lossy encoding of meaning into a human symbol system. The factories are exchanging finished-looking artifacts when they could be exchanging something more direct.

## The Embedding as Primitive

An embedding is a vector: a point in a high-dimensional space that encodes the meaning of something -- a sentence, a document, an image, a sound -- in terms of its relationships to everything else. Things that mean similar things sit near each other. Things that mean different things sit far apart. The space encodes meaning geometrically rather than symbolically.

This is not a representation designed for human consumption. You cannot read an embedding the way you read a sentence. But you can do things with it that you cannot do with a sentence: measure its distance from other meanings, find the things most like it, combine it with other embeddings, pass it to a model that will interpret it in a completely different modality.

The speculative extension is this: what if the intermediate exchanged between factories was not text but a vector? I send you an embedding that encodes intent, topic, emotional register, context. Your model interprets it. Not into the same thing I would have produced -- into whatever form is most useful given your infrastructure, your needs, your current state. One of your models renders it as a video. Another outputs code. If you are out for a run, it conditions an audio stream.

The message and the medium collapse into the same thing. The embedding is not a representation of meaning encoded for transmission. It is the meaning, in the only form that machines actually work with.

## Why This Is Not Science Fiction

The infrastructure for this already exists in pieces. Embedding models produce vectors. Generative models condition on them. LoRA adaptors fine-tune models for specific interpretive contexts without retraining from scratch. Multi-modal models translate between text, image, and audio. The missing layer is the protocol: a shared understanding of what an embedding exchanged between two parties means, what its dimensions encode, what the recipient is expected to do with it.

That protocol does not exist yet, and designing it is a hard problem. Embeddings from different models are not directly comparable -- the spaces are different, the distances mean different things. Establishing a shared embedding space across factories would require either a universal embedding standard (which does not exist) or a translation layer (which is an interesting engineering problem). Neither is simple.

But the direction is real. The current assumption that AI communication will be mediated by natural language is a constraint inherited from human communication, not a technical necessity. Language is the interface we built because humans needed to read the outputs. In a factory-to-factory world, where neither end of the exchange is a human reading a document, that constraint softens.

The medium is still being invented. The message may not be language at all.

*(Bay Information Systems is building infrastructure in this direction. https://bayis.co.uk/marigold)*
