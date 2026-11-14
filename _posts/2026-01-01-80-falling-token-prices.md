---
date: 2026-06-29
last_modified_at: 2026-11-14
layout: article
title: "Falling Token Prices and the Cost of Inference You Already Own"
seo_title: "AI Token Prices Are Falling: What It Means for Self-Hosted Inference"
description: "AI inference prices at a fixed capability fall several-fold a year while usage grows faster. What that does to the break-even for owned hardware, and to what owned hardware can run."
keywords: ["ai token prices", "llm price per token trend", "falling cost of ai inference", "ai token economics", "llm inference price decline", "self-hosted inference cost", "open weight model efficiency"]
topic: "Infrastructure"
related:
  - 95-private-inference-costs
  - 40-private-inference
  - 117-private-ai-server
  - 90-aws-bedrock-costs
  - 70-training-commodity
  - 78-gpu-market-2026
---

# Falling Token Prices and the Cost of Inference You Already Own

Google processed 9.7 trillion tokens a month in May 2024, about 480 trillion a year later, and 3.2 quadrillion by May 2026, according to figures Sundar Pichai gave at Google I/O ([Digit](https://www.digit.in/features/general/google-io-2026-sundar-pichai-gave-numbers-to-explain-rapid-ai-adoption.html)). Over the same years the price of reaching a given level of capability fell faster than almost any price in computing. Usage is outrunning the price cuts, so total spending on inference keeps rising while each token gets cheaper.

For an organisation choosing between an API and its own hardware, those two trends pull in opposite directions. We set out how fast prices are falling, why cost per task can move differently from price per token, and what the trend does to the case for owned inference.

## How fast prices are falling

Epoch AI measured the price of reaching fixed benchmark scores and found it falling by between 9 and 900 times a year, depending on the task and the threshold. Reaching GPT-4's level on a set of PhD-level science questions became 40 times cheaper each year ([Epoch AI](https://epoch.ai/blog/llm-inference-price-trends)). A later Epoch analysis put the broad trend at roughly 5 to 10 times a year for reaching a given capability level ([Epoch AI](https://epochai.substack.com/p/how-persistent-is-the-inference-cost)).

Three things drive the fall: cheaper hardware per unit of compute, competition between providers, and algorithmic efficiency, meaning smaller or better-trained models reaching a capability that once took a larger one. A study isolating open models, to remove competitive pricing, and dividing out hardware price declines estimated algorithmic progress alone at around three times a year ([Gundlach et al.](https://arxiv.org/abs/2511.23455)).

## Price per token and cost per task

A falling price per token does not guarantee a falling bill. Reasoning models generate far more tokens per answer than the models they replace, agents make many calls per task, and cheaper tokens invite uses that were not worth paying for before. The price of a fixed capability falls; the cost of the work an organisation actually does can stay level or rise as it asks for more.

That is the large-scale pattern behind Google's figures, and it is hard to check from outside: the token counts are self-reported, and a provider's price per token is a commercial decision, which need not track its cost of generation. At the smallest scale the cost can be measured directly. On one RTX 3060, 14 open-weight models answered 1,204 requests for 226 watt-hours of electricity, about 5.6p ([what self-hosted inference costs](/library/95-private-inference-costs.html)).

## What falling prices do to owned inference

Falling API prices push out the break-even point for owned hardware. Whatever volume made a GPU server pay for itself last year, a lower API price raises it, because the daily saving shrinks while the hardware cost stays where it was. An organisation that self-hosts purely to save money is betting against a curve that has fallen several-fold every year.

The same efficiency gains reach owned hardware by another route. When a smaller open-weight model matches what a larger one could do a year earlier, a GPU already in the rack runs the better model at the same electricity cost. On an API, the gain arrives as a price cut, at the provider's discretion and with its margin. On owned hardware, it arrives as more capability on the same machine, whenever a better model is downloaded.

So the cost case for self-hosting weakens over time while the capability of owned hardware grows. The cases that do not depend on price (data that cannot leave the boundary, a model version that changes only when you decide, a cost that reads off a meter) are unaffected by either trend. ([What private AI inference is](/library/40-private-inference.html) covers those.)

Falling token prices make inference cheaper to buy and better to own, and leave the choice between the two to rest on control more than on cost.
