---
date: 2026-07-03
layout: article
title: "Model Choice Determines VLM Inference Cost"
seo_title: "VLM Output Length Bias and Inference Cost: A Benchmark of 4 Open-Weight Models"
description: "Vision-language models are biased toward a characteristic output length regardless of image content. Because cost tracks output length, model choice determines inference cost. Benchmark data from four open-weight VLMs across 4,004 requests, with per-request power and GPU telemetry."
keywords: ["vlm inference cost", "vlm output length bias", "vision language model benchmark", "model selection ai cost", "open weight vlm", "gpu inference cost"]
topic: "AI Systems"
related:
  - 25-llm-evaluation
  - 40-private-inference
  - 04-cost-of-ml
---

# Model Choice Determines VLM Inference Cost

Vision-language models accept an image and produce a text description, and each model is biased toward a characteristic output length regardless of what the image contains.
Idefics2 writes around 16 tokens for a photograph of two cats on a sofa, and around 16 tokens for a six-panel composite of pizza photographs.
LLaVA-NeXT writes around 195 tokens for both.
Inference cost tracks output length, so the model chosen sets the cost before a single image is processed.

This article presents measurements from a structured benchmark: four open-weight VLMs, 1,001 photographs, 4,004 requests, on a single NVIDIA RTX 3060 12GB.
Power draw and processing time were recorded on every request via NVML.
The data quantifies the output length bias and its effect on cost at scale.

The full benchmark, including per-request telemetry and methodology, is published at [marigold.run/blog/vlm-inference-benchmark/](https://marigold.run/blog/vlm-inference-benchmark.html)

## The models

Four models were benchmarked. Parameter counts include the vision encoder and projection layers alongside the language model backbone.

| Model | Family | Parameters | Quantisation |
|---|---|---|---|
| google/paligemma2-3b-mix-448 | PaliGemma | 3B | bf16 |
| qwen/qwen2.5-vl-7b-instruct | Qwen2.5-VL | 7B | NF4 4-bit |
| llava-hf/llava-v1.6-mistral-7b-hf | LLaVA-NeXT | 7B | NF4 4-bit |
| huggingfacem4/idefics2-8b | Idefics2 | 8B | NF4 4-bit |

Each model received 1,001 COCO val2017 images with the prompt "Describe this image." and a 256-token output cap.
Images were pre-loaded into memory as base64 data URIs; no per-request network fetch contributed to timing.

## Output token distribution

The benchmark records output token count on every request.

| Model | Mean output tokens | Cap hits (of 1,001) |
|---|---|---|
| Idefics2-8B | 16.3 | 0 |
| PaliGemma2-3B | 61.1 | 1 |
| Qwen2.5-VL-7B | 108.6 | 1 |
| LLaVA-NeXT-7B | 195.7 | 112 |

These distributions hold across image content, as the cats-and-pizza comparison above shows.
Each model carries a trained predisposition toward outputs of a characteristic length.
This predisposition is stable across inputs.
Because it does not vary with image content, the model chosen determines per-image inference cost more than the image does.

## The same image, four responses

The image below is a composite of two photographs of open suitcases placed side by side, with a "baggage" watermark at the lower right.
The four responses to this image show the output length bias directly.

*Idefics2-8B (14 tokens)*

"An open suitcase with the word baggage next to it."

*PaliGemma2-3B (142 tokens)*

"A silver suitcase lies on the floor, its contents spilling out. The suitcase contains a red bag with items neatly packed inside, including a brown bag with a white tag, a small white bottle, a brown bag on the right with a red zip, and a brown pillow with a leopard print cover. A black backpack sits on the floor next to the suitcase, while a small black bag with a long strap and a brown bag with a white tag are also visible. The floor is made of wood and tiled, and the light shines on the suitcase, reflecting off the shiny tile. The word 'baggage' is written in yellow on the photo, and the overall mood is one of organisation and clutter."

*Qwen2.5-VL-7B (162 tokens)*

"The image shows two photographs side by side, both depicting a suitcase filled with various items. The left photograph shows the suitcase open on a tiled floor, with its contents neatly organised. Inside the suitcase, there are several compartments and bags containing personal items such as toiletries, medications, and other essentials. A small bag is placed on top of the suitcase, possibly for additional storage or as a travel pillow. The right photograph provides a closer view of the suitcase's contents, focusing on the items inside. It includes bottles, tubes, and other personal care products, suggesting that the suitcase is being packed for travel. The word 'baggage' is written in yellow text at the bottom right corner of the right photograph."

*LLaVA-NeXT-7B (182 tokens)*

"The image is a composite of two photographs placed side by side, each showing a suitcase with its contents spilled out onto a tiled floor. The left side shows a black suitcase with various items, including a bottle, a toothbrush, and a pair of shoes, among other things. The right side shows a red suitcase with similar items, including a bottle, a toothbrush, and a pair of shoes, as well as other personal care items. At the bottom of the image, there is a watermark with the text 'baggage' in a stylised font, suggesting that the image may be related to luggage or travel. The focus is on the contents of the suitcases, which are typical of travel items."

The range is 14 to 182 tokens.
PaliGemma2 introduces a leopard print pillow and a wooden floor that are not present in the image.
Idefics2 identifies the watermark text and stops.
Qwen2.5-VL and LLaVA-NeXT both identify the composite structure and describe each photograph separately.
The descriptions differ in accuracy, structure, and length.

## Throughput

Mean inference time per image and median output tokens per second:

| Model | Mean inference time (s) | Median tok/s |
|---|---|---|
| PaliGemma2-3B | 2.01 | 28.8 |
| Idefics2-8B | 3.44 | 4.6 |
| Qwen2.5-VL-7B | 6.62 | 16.5 |
| LLaVA-NeXT-7B | 14.75 | 13.4 |

The throughput ordering does not follow parameter count.
PaliGemma2 at 3B produces 28.8 tok/s; Idefics2 at 8B produces 4.6 tok/s.
Inference time follows the output token bias: the model that produces the fewest tokens per image completes each request fastest.

Idefics2 is the exception to a simple tokens-in, tokens-out cost model.
Its mean inference time of 3.44 seconds is higher than PaliGemma2's despite producing fewer output tokens.
The additional parameter count accounts for the difference.

## Energy

GPU power draw was sampled continuously via NVML during each request.
Total inference energy across 1,001 images per model:

| Model | Energy (Wh) | Cost at 24.67p/kWh |
|---|---|---|
| PaliGemma2-3B | 43.1 | 1.06p |
| Idefics2-8B | 132.7 | 3.27p |
| Qwen2.5-VL-7B | 229.5 | 5.66p |
| LLaVA-NeXT-7B | 566.9 | 13.97p |

LLaVA-NeXT and Qwen2.5-VL share the same parameter count, the same quantisation, and the same hardware.
LLaVA-NeXT costs 2.5 times as much to run per 1,001 images.
The difference is the output token bias: 108.6 tokens per image against 195.7.

At scale this compounds.
Processing 100,000 images requires approximately 410 GPU-hours with LLaVA-NeXT against approximately 56 with PaliGemma2, on identical hardware, with the same prompt.

The electricity cost at UK domestic rates for the full 4,004-request benchmark across all four models was 24.1 pence.

## Vision encoding

A secondary cost factor is the number of tokens the vision encoder produces per image, which sets the amount of computation in the language model's attention layers before any output token is generated.

PaliGemma2 and Idefics2 use fixed-grid encoders that produce an identical token count per image regardless of content or resolution (1,030 tokens and 338 tokens respectively).
Qwen2.5-VL uses a dynamic encoder that produced a mean of 370 tokens across the benchmark, ranging from 73 to 554.
LLaVA-NeXT's anyres tiling strategy produced a mean of 2,229 tokens, ranging from 1,277 to 2,943.

LLaVA-NeXT's long inference time compounds high input tokens with high output tokens.

Dynamic encoders preserve more image detail than fixed-grid encoders at the cost of variable and potentially high input token counts.
COCO val2017 natural photography does not stress this trade-off; document and chart imagery, where small text must remain legible, would produce a different throughput ordering.

## Practical implications

A model's output length bias is a deployment characteristic, measurable in advance on a representative sample of task inputs, and it should sit alongside accuracy and capability assessments in a model selection process.

A model with a long output bias incurs higher GPU time and energy per request whether or not the additional output tokens carry useful information for the task.
Product tagging, accessibility alt-text, and content labelling at volume favour a short-output model, which returns results faster and at lower energy cost per image.
Spatial analysis and structured enumeration of scene contents favour a long-output model, which returns more complete results at correspondingly higher cost.

Selecting a model for a VLM task means matching its output length bias to the length the task actually needs.

## Data

The benchmark harness is published under `img2txt-providers` in the `marigold-benchmarks` repository.
Images are sourced from COCO val2017 via a generator function with MD5-keyed local caching.
The raw results CSV, conversion script, and per-request telemetry are included.

Full benchmark with interactive charts: [marigold.run/blog/vlm-inference-benchmark/](https://marigold.run/blog/vlm-inference-benchmark/)

(If VLM deployment cost is a live question for your team, [get in touch](/#contact-us).)
