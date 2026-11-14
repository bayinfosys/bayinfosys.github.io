---
date: 2026-05-10
last_modified_at: 2026-11-14
layout: article
title: "Why Private Inference? Three Risks of Sending Data to AI APIs"
seo_title: "ChatGPT Data Privacy for Business: Three Risks and Private Inference"
description: "Three risks decide whether business data can go to ChatGPT or another AI API: regulation, exposure through breaches, staff and retention, and training on the data. What each depends on, and what private inference removes."
keywords: ["chatgpt data privacy", "chatgpt data privacy for business", "ai data privacy risks", "is it safe to put confidential data into chatgpt", "ai api data training", "private inference", "gdpr ai", "data sovereignty"]
topic: "Infrastructure"
cta: private-inference
related:
  - 40-private-inference
  - 66-open-weights-separate-concerns
  - 117-private-ai-server
  - 110-data-processor-or-controller
  - 73-ner-and-pii
  - 72-private-inference-fhe
---

# Why Private Inference? Three Risks of Sending Data to AI APIs

Whether an organisation needs [private inference](/library/40-private-inference.html) comes down to three risks, and they behave differently. Regulatory risk is fixed from outside: a framework either allows a category of data to go to an external processor or it does not. Exposure risk is a probability the organisation sets for itself: what happens if sensitive data ends up somewhere it should not. Training risk is the chance that submitted data becomes part of a model and reappears elsewhere. The third depends heavily on which product the data goes through, and it is the one most often misjudged in both directions.

## Regulatory risk

Some data cannot go to an external processor whatever the provider promises. NHS data frameworks, FCA conduct rules, UK GDPR restrictions on international transfers and legal professional privilege all constrain where data may be processed, and a commercial AI API is an external processor. For data in these categories the analysis is usually short, and the answer is usually no.

Organisations in this position know it already. Their question is how quickly AI can be run inside the boundary, which is a question of infrastructure.

## Exposure risk

Most sensitive data is not regulated. Acquisition plans, unannounced products, client relationships and internal disputes fall outside any framework, and the damage from a leak is still severe. The question here is what happens if the data appears somewhere it should not, and three routes have each been demonstrated.

**Staff paste it into consumer tools.** In March 2023, engineers at Samsung's semiconductor division entered internal source code and meeting notes into ChatGPT within weeks of being allowed to use it, and Samsung restricted generative AI on company devices ([The Register](https://www.theregister.com/2023/05/02/samsung_generative_ai_ban/)). Most organisations have no visibility of what staff paste into the free versions of these tools.

**Retention changes for reasons outside the provider's control.** In May 2025, a US court in the New York Times copyright case ordered OpenAI to preserve ChatGPT and API content that would normally be deleted within 30 days, including chats users had deleted. The order covered API customers without a zero data retention agreement, and it ran until 26 September 2025 ([OpenAI](https://openai.com/index/response-to-nyt-data-demands/)). Data sent under a 30-day retention policy was held for months, by order of a court in another country.

**Providers are breached.** A processor's breach becomes the controller's problem: under UK GDPR the controller must assess it and, where it meets the threshold, report it to the ICO within 72 hours ([ICO guidance](https://ico.org.uk/for-organisations/report-a-breach/personal-data-breach/personal-data-breaches-a-guide/)). ([Data controller or processor](/library/110-data-processor-or-controller.html) sets out the roles.)

Exposure risk is a probability, which makes it easy to dismiss until one of these routes is used. An organisation that is uncomfortable sending certain data through a commercial API has usually judged the risk correctly.

## Training risk

Whether submitted data trains a model depends on the product it goes through, and the business and consumer products of the same provider take opposite defaults.

| Product | Training on your data by default |
|---|---|
| OpenAI API, ChatGPT Business and Enterprise | No, unless the customer opts in |
| Anthropic API and paid commercial services | No; the commercial terms prohibit it |
| Free and personal consumer chat products | Commonly yes, unless the user opts out in settings |

OpenAI states that business data from its API and business products is not used for training unless the customer explicitly opts in, and Anthropic's commercial terms state that it "may not train models on Customer Content from Services" ([Anthropic](https://www.anthropic.com/legal/commercial-terms)). For an organisation using those products under business terms, the training risk is small.

It returns in three places. Staff using personal accounts on consumer products send data under consumer terms, where training is often on by default. Defaults are terms of service, which providers revise. And models do memorise some of what they are trained on: in the New York Times case, the court cited "numerous" and "widely publicized" examples of ChatGPT producing material from the newspaper's articles when it allowed the claims to proceed ([Claims Journal](https://www.claimsjournal.com/news/national/2025/06/09/331014.htm)). Data that enters training can, under the right prompts, come back out.

## What private inference removes

Private inference runs an open-weight model on infrastructure the organisation controls, so no model provider receives the data. That settles all three risks at their source. The regulatory question becomes one about the organisation's own infrastructure, which its existing controls already cover. The exposure routes through a provider (retention orders, provider breaches) disappear, because there is no provider holding the data. And training risk ends, because a downloaded open-weight model is a fixed set of files: nothing sent to it becomes part of the next version.

What remains is internal. Staff can still paste data into consumer tools, so a private deployment works best alongside a short policy on what may go into hosted products, and an internal tool good enough that they have no reason to. Logs on the private deployment still hold whatever was sent to it, and need the retention and access rules of any internal system. ([What private AI inference is](/library/40-private-inference.html) covers how personal data is protected during serving.)

The three risks reach different data and fall on different people, and private inference removes the provider from each of them. (To see which of the three applies to your data, take the [private inference checklist](/checklists/private-inference.html).)
