---
date: 2026-05-10
layout: article
title: "Why Private Inference"
seo_title: "Regulatory and Exposure Risk: Why Private Inference for Compliance"
description: "The specific regulatory (NHS, FCA, GDPR) and exposure risks that make private inference necessary for regulated data, distinct from the general architectural case for self-hosting AI models."
keywords: ["private inference", "data sovereignty", "ai data risk", "private ai hosting", "gdpr ai", "open weight models", "self-hosted llm", "ai training data risk", "private cloud inference", "data leakage ai"]
topic: "Infrastructure"
related:
  - 40-private-inference
  - 63-private-inference-stack
  - 87-inference-infrastructure
  - 09-data-risks
  - 64-marigold
  - 72-private-inference-fhe
---

# Why Private Inference?

Whether private inference is necessary for your organisation usually
comes down to two different kinds of risk.
Regulatory risk is a binary constraint imposed from outside: a
framework either prohibits sending certain data to a third-party
processor or it does not. Exposure risk is a probabilistic one you set
for yourself: what happens if sensitive but unregulated data ends up
somewhere it shouldn't. A third, less discussed risk is that data submitted to a commercial API becomes training material, and reappears somewhere else entirely.

These three categories: Regulatory risk, Exposure risk, and Plagarism risk each behave differently.

## Regulatory risk - you know if you have this

Some organisations are not permitted to send certain categories of data
to external processors, regardless of the provider's assurances. NHS
data frameworks, FCA conduct rules, GDPR Article 44 restrictions on
international transfers, legal professional privilege: these are all
operational constraints.

Regulatory risk is characterised as binary and externally imposed.
Either the framework prohibits the data transfer or it does not.
Commercial AI APIs are external processors. The analysis is usually
straightforward, and the answer is usually no.

If you are in this category, you already know. The question is not whether
private inference is necessary but how quickly it can be made compliant.

## Exposure risk - you feel if you have this

Not all sensitive data is regulated. Competitive intelligence, acquisition
strategy, unannounced product development, client relationships, internal
disputes: none of this is necessarily covered by a regulatory framework,
but the consequences of it leaving the organisation are severe.

The relevant question is not "are we allowed to send this?" but "what
happens if this appears somewhere it should not?" A commercial API
provider suffers a breach. A disgruntled employee exports query logs.
A provider updates its data retention policy retroactively. These are
not hypotheticals -- each has happened to a major provider in the last
three years. [ref](https://www.cybersecurity-insiders.com/chatgpt-of-openai-hacked-and-data-leaked/)

Exposure risk is probabilistic rather than binary, which makes it easier
to dismiss. The organisation that dismisses it usually discovers,
too late, that the ICO's [definition](https://ico.org.uk/for-organisations/report-a-breach/personal-data-breach/personal-data-breaches-a-guide/#whatroledo)
of a reportable breach covers data sent to a third-party processor.
The provider's breach is your breach.

If you feel a degree of discomfort sending certain data through a
commercial API, that discomfort is calibrated correctly. The architecture
should match the instinct.

## Plagiarism risk - you might not know this

This is the least understood of the three categories and the one most
likely to affect organisations that have passed the previous two tests
and believe they are fine.

Commercial AI providers train on data. They train on data submitted
through their APIs. The opt-out mechanisms they offer vary in
effectiveness and are subject to change. More importantly, the
mechanism by which training data reappears in model outputs is
documented, demonstrated in court, and not fully under the provider's
control.

In 2023 the New York Times [demonstrated](https://hls.harvard.edu/today/does-chatgpt-violate-new-york-times-copyrights/)
GPT-4 could reproduce verbatim articles under certain prompting conditions.
The model had been trained on the content and could be induced to reproduce it.

The implication for any organisation that has submitted proprietary
content through a commercial API is direct, regardless of copyright issues.
A client's legal strategy, submitted as context for a drafting task.
A patient history, used to ground a clinical summarisation.
A board paper, provided as background for an executive communication.
Any of these could, under the right conditions, be reproduced in a response.

Could you defend that outcome to the client? To the ICO? To the board?

For Studio Ghibli the issue was wholly different. Hayao Miyazaki, the founder,
had stated publicly and repeatedly that AI image generation was "an insult
to human creativity". His position was not ambiguous. Still, OpenAI released
a Ghibli-style image filter that demonstrated, beyond reasonable doubt,
that the model had been trained on Studio Ghibli's work.
The owner's explicit objection had not prevented it.

The lesson applies to any organisation expressing a preference about use
of its data, and assuming the preference would be honoured.
Preferences are not contractual constraints, nor technical limitations.

---

Open-weight models separate this concern at the architectural level. The
weights are trained publicly, on declared datasets, before you use them.
When you run inference on open weights, you are consuming a fixed,
published model -- not contributing data to the next version of someone
else's. There is no feedback loop. What you send is processed and
returned. It does not become training material.

This is the separation of concerns that matters. Model training is one
activity, performed by specialists on declared data. Inference is another.
Keeping them separate is not a preference, it is architecture.

([Marigold](https://marigold.run) hosts open-weight models on infrastructure
we control. We do not train models. The ICO's guidance on
processor liability is at [ico.org.uk](https://ico.org.uk/for-organisations/report-a-breach/personal-data-breach/personal-data-breaches-a-guide/).)
