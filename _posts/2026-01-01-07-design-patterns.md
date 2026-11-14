---
date: 2025-02-21
last_modified_at: 2026-11-13
layout: article
title: "Machine Learning Design Patterns"
description: "Machine learning design patterns are defined by the shape of their output. Nine data tasks, from classification to generation, with how each is built and example models for each."
keywords: ["ml design patterns", "machine learning design patterns", "machine learning tasks", "classification", "regression", "sequence labelling", "clustering", "anomaly detection", "discriminative models", "generative models"]
topic: "AI Systems"
seo_title: "Machine Learning Design Patterns: Nine Data Tasks, How They Are Built, and Example Models"
related:
  - 116-ai-product-goals
  - 88-four-types-of-ml
  - 77-network-architecture
  - 46-labels-are-the-task
  - 73-ner-and-pii
redirect_from:
  - /07-design-patterns/
  - /07-design-patterns/index.html
---

# Machine Learning Design Patterns

This article sets out the main machine learning design patterns from the point of view of a data practitioner.
Each pattern is a data task, defined by what the model produces: a category, a number, a ranked list, a label for each word or pixel, a span of text, a group, an anomaly score, or new content.
For each task we describe how it is usually built and name models that do it.
(The product goals these tasks combine into, such as assistants, document search and triage, are covered in the companion piece, [AI product goals and the tasks behind them](/library/115-ai-product-goals.html).)

The term comes from building architecture by way of software, where a pattern is a recurring answer to a recurring problem, with the materials left to the particular case.
A classifier is a pattern in that sense; gradient-boosted trees, a logistic regression and a fine-tuned transformer are three ways of building one.

In the shorthand of [F(X) = Y](/library/88-four-types-of-ml.html), a data task fixes the shape of Y.
That shape decides whether labelled data is needed, how results are measured, and which family of model can produce them.
It holds for any X: a transaction table and a customer email pass through the same tasks, with a pretrained encoder in front of the text.

Eight of the nine tasks are discriminative: the model chooses, scores or labels in a single forward pass, and returns only the kinds of output it was built for.
The ninth, generation, composes new output one piece at a time.

## Classification

A classifier assigns each input to one of a fixed set of categories and returns a probability for each: fraudulent or legitimate, which product line a complaint concerns, whether a customer is likely to become a high-value spender.
Routing, intent detection and moderation are classifiers whose categories happen to be destinations, intents or verdicts.

On tabular data the standard build is gradient-boosted trees over engineered features.
On text, a pretrained transformer encoder reads the input and a small classification head maps its representation to the categories; a few thousand labelled examples usually suffice for a narrow task.
Two variants take the categories as input with each request.
Zero-shot classifiers built on natural-language inference score each candidate label as a hypothesis about the text.
Decision models such as Jev, released in early access by TypeSafe AI in September 2026, accept a block of state, a question and a list of permitted answers, and return a calibrated distribution over those answers (its published benchmarks are the vendor's own).

**Example models.** XGBoost, LightGBM and CatBoost for tabular data; ModernBERT or DeBERTa-v3, fine-tuned, for text; `facebook/bart-large-mnli` for zero-shot labels; Jev for host-supplied choices.

## Regression and forecasting

A regression model returns a number: a price, a delivery time, next month's spend for each customer.
Forecasting is regression over time, where the input is a history and the output is the next values in the series, ideally each with an interval.

Tabular regression uses the same gradient-boosted trees as classification, trained against a different loss.
Forecasting has two routes.
Classical statistical models fit each series on its own and model trend and seasonality explicitly.
Pretrained time-series models learn from many series at once, splitting each into tokens or short patches, and forecast new series without retraining.

**Example models.** LightGBM for tabular regression; Prophet and ARIMA for individual series; Chronos (Amazon) and TimesFM (Google) as pretrained forecasters.

## Ranking and recommendation

Recommendation is ranking with a customer as the query: next purchase, next article, which offer to show.
Search is ranking with a typed query.
In both, a model scores a set of candidates and returns them in order.

Production systems usually run in two stages.
A retrieval stage narrows millions of items to a few hundred, using matrix factorisation or a two-tower network that embeds users and items in one space and looks up nearest neighbours.
A ranking stage then scores those candidates with a heavier model that can use every available feature.
Search uses the same structure: an embedding model retrieves passages, and a cross-encoder, which reads query and passage together, reorders them.

**Example models.** Implicit ALS and LightFM for collaborative filtering; two-tower retrieval with DLRM-style rankers; SASRec for sequence-aware recommendation; `bge-reranker-v2-m3` and the MS MARCO MiniLM cross-encoders for search.

## Sequence labelling

Some tasks need a label for every element of the input: every token in a sentence, every pixel in an image, every step in a time series.
Named entity recognition, PII detection and slot filling are token labelling.
Image segmentation, such as marking tissue types in a medical scan, is the same task with pixels in place of tokens.

The build is an encoder with a classification head applied at each position.
Several tasks that look generative reduce to this shape.
GECToR (Omelianchuk et al., 2020) corrects grammar by tagging each token with an edit (`KEEP`, `DELETE`, `REPLACE_x`, `APPEND_x`) and then applying the tags.
Punctuation and capitals in speech-recognition output, missing accents and sentence boundaries are restored the same way.
The output can only edit the input.

**Example models.** spaCy transformer pipelines and GLiNER (which takes entity types as input) for named entities; GECToR for grammar correction; `fullstop-punctuation-multilang` for punctuation; U-Net and Segment Anything (SAM 2) for images.

## Span extraction

Some answers sit verbatim in the input: the delivery address in an email, the termination clause in a contract, the policy number on a claim form.
A span extractor finds them by pointing to a start and an end position, so its answer is always a copy of text the input contained.

The build is an encoder that reads question and passage together and predicts, for each token, the probability that the answer starts or ends there.
For scanned documents, layout-aware encoders add the position of each word on the page, so a field's location (top right, next to "Invoice no.") counts as evidence.

**Example models.** `deepset/roberta-base-squad2` for extractive question answering; LayoutLMv3 for forms and invoices.

## Clustering and segmentation

Clustering finds groups in data without labels: customer segments by spending behaviour, themes in feedback, families of similar products.
Nobody defines the groups in advance, so there is no Y to score against.
A customer segmentation is judged by whether someone can act on it.

The pipeline is a representation followed by a grouping algorithm.
For behavioural data the representation is a scaled table of features; for text and images it is an embedding from a pretrained encoder, often reduced in dimension before clustering.
K-means suits compact groups of similar size.
Density-based methods such as HDBSCAN find groups of irregular shape and leave outliers unassigned.

**Example models.** k-means and HDBSCAN in scikit-learn; BERTopic, which chains sentence embeddings, UMAP and HDBSCAN into topic discovery for text.

## Similarity and embedding

An embedding model maps each input to a vector so that similar inputs land close together.
The vector is the output; its uses are nearest-neighbour search, deduplication, finding related influencers or complementary products, and the retrieval stage of search and recommendation.

Text embedding models are encoders trained with contrastive objectives on pairs that should match, such as a question and its answer or a query and a clicked result.
Multimodal models are trained the same way on image-caption pairs, which places pictures and text in one space.
The vectors go into an approximate nearest-neighbour index for search at scale.

**Example models.** `all-MiniLM-L6-v2` and BGE-M3 for text; CLIP for images and text together.

## Anomaly detection

An anomaly detector learns what normal looks like and scores how far each new observation sits from it: bot traffic, account takeover, a drifting sensor, a sudden change in what customers complain about.
A threshold on the score turns it into an alert.

Most anomalies arrive without labels, so the methods are largely unsupervised.
An isolation forest measures how few random splits it takes to separate a point from the rest.
An autoencoder learns to reconstruct normal data and flags the inputs it reconstructs badly.
For time series, the gap between a forecast and the observed value serves as the score.
Once enough confirmed incidents accumulate, a supervised classifier usually joins the detector.

**Example models.** Isolation Forest in scikit-learn; the PyOD library of detectors; autoencoders; forecast residuals from Prophet or Chronos.

## Generation

Generation produces content that is neither present in the input nor drawn from a list: a translation, a summary, a draft, an image, a transcript.
It is the one task here that a discriminative model cannot do.

Text generation uses decoder-only transformers, which predict one token at a time, or encoder-decoder models, which read the whole input before writing (the usual structure for translation and speech recognition).
Images come from diffusion models, which start from noise and remove it step by step under the guidance of a text prompt.

**Example models.** Llama, Qwen and Mistral open-weight models for text; NLLB-200 and MADLAD-400 for translation; Whisper for speech recognition; Stable Diffusion and FLUX.1 for images.

## Tasks before models

A fraud classifier from 2005 and a ticket router from 2026 share an output shape, a need for labelled examples and a measure of success.
Most of the tasks above are supervised, and the labelled set both defines the task and measures the result ([task specification](/library/46-labels-are-the-task.html) covers why that set is the primary artefact of a project).
(Bay Information Systems builds models for these tasks on private infrastructure: [get in touch](/contact.html).)
Naming the task first settles the model family, the training data and the test before a vendor is chosen.
