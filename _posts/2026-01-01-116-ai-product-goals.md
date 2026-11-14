---
date: 2026-11-13
layout: article
title: "AI Product Goals and the Tasks Behind Them"
description: "AI products are named for what users see: assistants, document search, triage, personalisation. Each is a short pipeline of machine learning tasks. Twelve product goals, the pipelines that achieve them, and example models."
keywords: ["ai product", "ai use cases", "ai product architecture", "rag", "document extraction", "ticket triage", "personalisation", "ai agents", "machine learning tasks"]
topic: "Product & Strategy"
seo_title: "AI Product Goals: The Machine Learning Tasks, Pipelines and Models Behind Them"
related:
  - 07-design-patterns
  - 97-what-is-rag
  - 101-what-are-agents
  - 73-ner-and-pii
  - 46-labels-are-the-task
---

# AI Product Goals and the Tasks Behind Them

We take twelve common AI product goals, from conversational assistants to agents, and break each into the data tasks, the pipeline and example models that achieve it.
This is the companion to [machine learning design patterns](/library/07-design-patterns.html), which describes those tasks one at a time.
Product goals are named for what a user sees: an assistant that answers questions, a search box that understands documents, a queue that sorts itself.
A goal on its own names no model, no training data and no test; the breakdown supplies all three.
Most of these pipelines contain at most one generative step, and several contain none.

## Conversational assistant

An assistant answers questions from customers or staff in natural language, in a chat window or a messaging channel.
A classifier first reads each message for intent and routes anything out of scope, or anything that needs a person, away from the automated path.
In-scope questions trigger retrieval: embedding search over a knowledge base, followed by reranking.
A generative model writes the reply from the retrieved passages, and safety classifiers check both the incoming message and the outgoing reply.
The reply is the only generative step.

**Example models.** Fine-tuned ModernBERT for intent and routing; BGE-M3 and `bge-reranker-v2-m3` for retrieval; Llama, Qwen or a hosted model for the reply; Llama Guard for safety (itself an LLM fine-tuned to emit a safe or unsafe label, which makes it a generative model doing a classifier's job).

## Search and question answering over documents

Staff ask questions in plain language and get answers from policies, contracts, manuals and past correspondence.
The documents are parsed, split into passages, embedded and indexed ahead of time.
At query time the question is embedded, the nearest passages are retrieved, and a cross-encoder reranks them.
The answer is then either extracted as a span, which copies the source text exactly and suits compliance work, or generated from the passages with citations ([what is RAG](/library/97-what-is-rag.html) covers the generated route).

**Example models.** Docling for parsing; BGE-M3 for embeddings; MS MARCO MiniLM cross-encoders for reranking; `deepset/roberta-base-squad2` for extractive answers; an open-weight or hosted LLM for generated answers.

## Document processing and data extraction

The aim here is a structured record for every invoice, claim, contract or form.
A classifier identifies the document type.
OCR and layout analysis recover the words and their positions, and span extraction or token labelling pulls out each field.
Rules then check formats, and an anomaly score flags values out of line with history, such as an invoice total far above a supplier's usual range.
Low-confidence fields go to a person.
OCR-free models skip the OCR stage, reading the page image and writing the fields out as text directly.

**Example models.** LayoutLMv3 for layout-aware extraction; GLiNER for entities in running text; Donut as an OCR-free alternative; Docling for parsing; Isolation Forest for value checks.

## Triage and routing

Support tickets, leads, claims and inbound email need to reach the right team at the right priority.
Several classification questions run over each item in parallel: department, urgency, sentiment, whether it needs a human.
Token labelling picks out account numbers and product names, and calibrated confidence decides which items are routed automatically and which go to a review queue.
(Bay Information Systems builds triage and decision pipelines of this kind on private infrastructure: [get in touch](/contact.html).)

**Example models.** ModernBERT or DeBERTa-v3, fine-tuned, where the categories are stable; Jev, which takes the categories with each request, where they change often (it is in early access, and its published benchmarks are the vendor's own); `facebook/bart-large-mnli` as a zero-shot baseline; GLiNER for entities.

## Personalisation and recommendation

Recommendation shows each customer the products, content and offers most likely to suit them, and runs as retrieval followed by ranking.
Interface decisions (units, tone, layout, colour scheme) take a different shape: a classifier over host-supplied options reads the customer profile as its state and answers the application's questions.
The application receives answers and never sees the profile, which keeps personal data in one place.

**Example models.** Implicit ALS, two-tower networks and SASRec for retrieval; DLRM-style rankers; Jev, or a cross-encoder distilled from an LLM, for profile-based decisions.

## Content generation

Marketing copy, product descriptions, social posts and images can be produced at volume from a brief.
A generative model drafts from the brief and the product data.
Classifiers check each draft for brand safety, tone and regulated claims before publication, and entity extraction compares the product names, prices and dates in the draft with the source data.

**Example models.** Llama, Qwen, Mistral or a hosted LLM for text; Stable Diffusion and FLUX.1 for images; fine-tuned ModernBERT classifiers for tone and brand safety; GLiNER for the entity comparison.

## Translation and localisation

A business that sells in several languages needs its product, support and marketing content in each of them.
Language identification, a classifier, decides what each source text is.
A translation model, usually an encoder-decoder, produces the target text, with a glossary enforcing product names and approved terminology.
Prominent content goes to a human post-editor.

**Example models.** fastText `lid.176` for language identification; NLLB-200 and MADLAD-400 for translation; general LLMs, which handle tone and marketing register well in widely spoken languages.

## Transcription and meeting notes

Calls and meetings become searchable text, summaries and lists of actions.
Speech recognition, an encoder-decoder generative model, produces the transcript.
Speaker diarisation splits the audio into segments, embeds each one and clusters the embeddings by speaker, which makes it a clustering task.
Token labelling restores punctuation and capitals where the recogniser leaves them out.
A generative model writes the summary; action items can be generated too, or found by classifying each sentence.

**Example models.** Whisper for transcription; `pyannote.audio` for diarisation; `fullstop-punctuation-multilang` for punctuation; an LLM for summaries.

## Moderation and data protection

Harmful content has to stay off a platform, and personal data out of logs, prompts and third-party services.
Classifiers assign content to policy categories, and token labelling finds personal data and redacts it.
Both run before content is stored or sent to an external model, and again on anything a model returns ([NER and PII](/library/73-ner-and-pii.html) covers the detection side).

**Example models.** Llama Guard and fine-tuned classifiers for policy categories; Microsoft Presidio, which combines NER models with pattern-based recognisers; GLiNER for entity types specific to a domain.

## Forecasting and planning

Forecasts of demand, stock, staffing and revenue feed a planning dashboard.
Each is regression over time, one series per product, store or region, with known future events (promotions, holidays) as inputs.
Forecasts at different levels are reconciled, so that store totals add up to the regional figure, and the intervals around each forecast set safety stock and staffing margins.

**Example models.** Prophet for individual series; LightGBM with lag features; Chronos and TimesFM as pretrained forecasters.

## Fraud and risk monitoring

Fraudulent transactions, fake accounts and bot traffic need catching as they happen.
Anomaly detection flags unusual behaviour with no labels required, and a supervised classifier, trained on confirmed cases, scores known patterns.
The two scores combine with business rules, and the alert threshold balances customers wrongly blocked against fraud missed.
Investigators' decisions return to training as labels.

**Example models.** Isolation Forest and autoencoders for anomalies; XGBoost or LightGBM for the supervised classifier.

## Agents and workflow automation

An agent carries out multi-step work: processing a claim end to end, researching and drafting a reply, updating records across several applications.
A generative model writes the plans and tool calls.
At each step the system makes decisions (which tool, whether the result is acceptable, whether a person should approve, whether to stop), and each decision is a classification that a small discriminative model can make.
Extraction and validation steps come from the document-processing pipeline ([what are agents](/library/101-what-are-agents.html) covers the control loop).

**Example models.** An open-weight or hosted LLM with tool use for planning; Jev or distilled classifiers for decision points; LayoutLMv3 and GLiNER for extraction.

## Reading a goal as tasks

Classification appears in most of these pipelines, usually as the step that decides what happens next.
Generation appears in about half, and where it does, it sits between discriminative steps that prepare its input and check its output.
Writing a goal out as tasks names the models, and with them the labelled data each stage needs and the test each must pass.
Those are where most of a project's effort and risk sit.
