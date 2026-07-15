---
date: 2026-07-04
layout: article
title: "Open Datasets for Training Vision-Language Models"
seo_title: "Open VLM Training Datasets: Sizes, Examples and Sources"
description: "The datasets behind open vision-language models, from 108,000 hand-annotated images to 12.8 billion web-scraped pairs. Observation counts, disk sizes, and what's actually downloadable versus URL-only."
keywords: ["vlm training data", "open image text datasets", "vision language model datasets", "laion dataset", "obelics dataset", "coco dataset size", "open dataset list ai"]
topic: "AI Systems"
related:
  - 61-eval-datasets
  - 46-labels-are-the-task
  - 25-llm-evaluation
---

# Open Datasets for Training Vision-Language Models

The datasets behind open vision-language models span five orders of magnitude in observation count, from 108,000 hand-annotated images to 12.8 billion pairs scraped from the open web.
They span a similar range in disk size, and a wide range in how directly they can be inspected: some are complete, downloadable image archives; others are tables of URLs and captions, with the images themselves fetched live from the web at training time (or not, if the URL has since died).
This is a reference for what these datasets actually contain, in what quantity, and what a download involves.

## Curated image-caption pairs

**COCO (2017), Common Objects in Context.** 118,287 training images and 5,000 validation images, each with five independent captions, for 616,767 captions total. A typical record pairs a photograph of an everyday scene (a kitchen, a street, a group of people) with a short factual sentence describing it. Images total 20.1GB (train, val, and unlabelled test combined); annotations add roughly 250MB more. Downloadable directly from cocodataset.org.

**Visual Genome.** 108,077 images, each annotated with an average of 42 region descriptions, 21 objects, and 18 pairwise relationships, for 5.4 million region descriptions in total. Rather than one caption per image, each image carries dozens of short descriptions of specific regions (a described patch of the image might read as a short phrase naming an object and its immediate context). Image archives total roughly 23GB; the JSON annotation files (objects, relationships, region descriptions, question-answer pairs) add several GB more per file. Downloadable from the Visual Genome site or the Hugging Face Hub.

**Conceptual Captions (CC3M and CC12M).** CC3M holds approximately 3.3 million image-alt-text pairs; CC12M relaxes CC3M's filtering to reach roughly 12.4 million pairs, with longer, noisier captions. Both are distributed as tab-separated URL-and-caption tables rather than image archives (the CC12M table itself is 2.1GB; the images have to be fetched separately and a portion of the URLs no longer resolve). A typical pair is a product or stock photograph with alt-text describing its subject in a single generic phrase, harvested from the HTML of the source page.

**WIT (Wikipedia-based Image Text).** 37.6 million image-text pairs drawn from Wikipedia across more than 100 languages, built from image captions, alt-text, and surrounding article context rather than a single caption type. Distributed as metadata tables; images are fetched from Wikimedia Commons.

## Web-scale filtered pairs

**LAION-5B.** 5.85 billion image-text pairs filtered from Common Crawl by CLIP similarity score (2.32 billion English-language, 2.26 billion in over 100 other languages, the remainder undetermined). The metadata alone (URLs, captions, similarity scores, NSFW and watermark scores) runs to 2.65TB; the full image set, if downloaded, is estimated at around 220TB. Withdrawn by LAION in December 2023 over CSAM findings in the metadata; re-LAION-5B, a filtered replacement, followed in August 2024.

**LAION-COCO.** A 600-million-pair subset of LAION, re-captioned using BLIP and CLIP rather than relying on the original alt-text, intended to read closer to COCO-style captions at web scale. Distributed the same way as LAION-5B: metadata table plus separate image fetch.

**DataComp CommonPool.** 12.8 billion image-text pairs collected from Common Crawl between 2014 and 2022, the largest public pool of its kind at release. DataComp-1B is a filtered subset of 1.4 billion pairs, benchmarked to outperform LAION-2B at the same training compute. Released as a URL table with face-blurring applied; a 2025 audit found personal documents and thousands of unblurred faces had passed the filters regardless.

## Dense and region-level annotation

**Open Images V7.** Approximately 9.2 million images, of which 1.9 million carry dense annotation: 16 million bounding boxes across 600 classes, 2.8 million segmentation masks, 675,000 localised narrative descriptions (a spoken description synchronised with a mouse trace over the image), and 66.4 million point-level labels. The full annotated set (1.74 million training images plus validation) totals roughly 561GB. Downloadable via Google's hosted archives or the FiftyOne dataset zoo.

## Interleaved documents

**OBELICS.** 141 million web documents containing 353 million images interleaved with 115 billion text tokens, extracted from Common Crawl. Rather than isolated image-caption pairs, each record preserves a whole web page's structure: paragraphs of text with images positioned where they appeared on the source page, which is what lets a model trained on it handle multiple images in one context rather than one image per prompt. Distributed with images referenced by URL: the text and metadata alone total 377GB as parquet; the full set with images embedded runs to roughly 715GB. HuggingFace's own documentation flags a meaningful proportion of pornographic and violent material inherited from the source crawl.

## Instruction and QA fine-tuning collections

**The Cauldron.** A curated collection of 50 existing vision-language datasets (VQA, OCR, chart and document understanding, visual reasoning) reformatted into a single multi-turn conversational structure, built for fine-tuning Idefics2. It is a repackaging layer over other datasets on this list rather than a new collection of images.

**Docmatix.** 2.4 million document images and 9.5 million question-answer pairs, generated from 1.3 million PDFs (sourced from the PDFA dataset) by transcribing each document and using a language model to generate Q&A pairs, then filtering roughly 15% as hallucinated. A 240x scale increase over the DocVQA dataset it was built to supplement.

**VQAv2.** 1.1 million questions and roughly 13 million answers over 265,016 images drawn from COCO, each question answered by multiple human annotators to capture disagreement. Reuses COCO's image files; the annotation and question files add under 1GB.

(If you're evaluating which of these underlies a model you're considering deploying, the practical question is usually narrower than "what was it trained on": whether the training data's licence, safety filtering, and content are appropriate for your use case. [Get in touch](/contact) if that audit would help.)
