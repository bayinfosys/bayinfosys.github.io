---
date: 2026-07-26
layout: article
title: "Evaluating RAG"
description: "RAG evaluation is not one number. It is four separate measurements, taken in pipeline order, because a fault at any stage produces the same symptom: a fluent, wrong answer."
keywords: ["rag evaluation", "ragas", "rag metrics", "how to evaluate rag", "rag monitoring", "retrieval quality", "hallucination detection rag", "rag drift detection"]
topic: "AI Systems"
seo_title: "How to Evaluate a RAG System: Metrics and Drift Detection"
related:
  - 97-what-is-rag
  - 19-rag-strategy
  - 98-rag-risks-and-costs
  - 99-rag-data-methods
  - 25-llm-evaluation
  - 61-eval-datasets
  - 68-build-measurements
---

# Evaluating RAG

A fluent answer and a correct one look identical from the outside. A model handed the wrong passage writes just as confidently as one handed the right one. So evaluation has to check each stage of the pipeline in order, since a fault at any stage produces the same symptom downstream: a well-formed answer with nothing underneath it.

## First, the embedding model

Before measuring retrieval, check that the embedding model separates your concepts at all. Build a small set of query-passage pairs from your own domain, ones you already know should sit close together and ones that shouldn't, and measure cosine similarity between them directly. A general-purpose embedding model trained on web text can genuinely fail to distinguish domain-specific concepts that look similar on the surface (two clauses that use the same words but mean opposite things contractually, say). If the embedding model can't separate these in a raw similarity test, nothing downstream will fix it. This is a one-off check, not something you re-run continuously, and it's worth doing before any of the following steps.

## Then, the chunking

Hold the embedding model fixed and vary chunk size or strategy against the same corpus. Context precision and context recall are the relevant pair here: precision asks whether the chunk returned actually contains the answer, recall asks whether the answer exists somewhere in the corpus but got split across a boundary and lost. A chunking strategy that scores well on precision but poorly on recall is cutting documents in the wrong places. This is measured by holding retrieval and generation constant and only changing chunk boundaries, so any change in score is attributable to chunking alone.

## Then, retrieval

With embedding and chunking settled, measure whether the right passages actually surface for a query. Precision at K: of the top K results, how many were relevant. Recall at K: of all relevant passages in the corpus, how many made it into the top K. Mean reciprocal rank: how high the first relevant result ranked, since a relevant passage at position 40 does little good if the model only reads the top ten. These three numbers are what most people mean when they say "RAG evaluation", but they only mean anything once the two steps above are already accounted for.

## Then, generation

Finally, check what the model did with what it was given. Faithfulness measures whether each claim in the answer traces back to the retrieved context, rather than being filled in from the model's general training. Answer relevancy measures whether the response addresses the question asked, a separate failure from faithfulness: an answer can be fully grounded and still not answer the question. Hallucination, in this specific sense, is a claim with no support in the retrieved context at all, and it is the failure a user is worst placed to catch, since it reads exactly like a correct answer.

## How RAGAS actually measures this

RAGAS is a framework, not a library of formulas or a single algorithm: it doesn't compute a fixed statistic so much as orchestrate a series of judge calls, each one a separate LLM prompt with a narrow task, and aggregate the results per metric. Two stages sit behind that.

**Building the dataset.** RAGAS generates synthetic question-and-answer pairs directly from your own source documents, using an LLM to write plausible questions and their correct answers from the actual content. This is what makes evaluation practical at scale; without it, someone has to hand-write hundreds of question-answer pairs before any of the above can be measured. Each row in the resulting dataset carries four fields: the question, the ground-truth answer, the contexts your pipeline actually retrieved, and the answer your pipeline actually generated.

**Scoring, metric by metric.** Each metric is computed with a separate judge-model call (a different LLM from the one that generated the answer), and the mechanics differ per metric rather than reducing to a single rating question.

Faithfulness is computed by decomposing the generated answer into individual claims, then checking each claim separately against the retrieved context for support. The score is the proportion of claims that pass. This claim-by-claim decomposition is why faithfulness catches partial hallucination: four true claims and one fabricated one scores 0.8, not a binary pass or fail.

Context precision looks at the ranked list of retrieved chunks and checks, position by position, whether each is relevant, weighting relevant chunks that appear earlier in the ranking more heavily than ones further down.

Context recall works in the other direction. It takes the ground-truth answer, breaks it into its constituent claims, and checks whether each claim can be attributed to something in the retrieved context. Missing context drops recall even when precision looks fine.

Answer relevancy takes the generated answer and asks the judge model to reverse-engineer plausible questions that answer would be responding to, then compares those reconstructed questions against the original question by embedding similarity. A relevant answer produces reconstructed questions close to the real one; an off-topic answer doesn't.

Each metric returns a score per row, aggregated across the dataset into a number per metric rather than one blended score, which is the design choice that matters most: a drop in one number tells you which stage of the pipeline broke, rather than telling you only that something, somewhere, is wrong.

LLM-as-judge is not a full substitute for human review. It can miss domain-specific errors a specialist would catch immediately (a subtly wrong dosage, a misstated clause, a transposed number that reads as grammatically fine), so treat RAGAS as the tool for continuous, high-volume measurement, with human review sampled in wherever a missed error is expensive.

## Drift detection in RAG

None of the four measurements above is a one-time gate. The corpus changes, documents get added, edited, retired, and a chunking or retrieval score measured at launch decays as the source material drifts from what was originally indexed, with no change to the model at all. This is drift specific to the retrieval side of the system, distinct from the model drift a standard ML deployment watches for, and it needs its own detection loop rather than an assumption that generation-side monitoring will catch it.

Re-run the four stages on a fixed schedule against the current corpus, and track retrieval metrics against a rolling sample of real production queries rather than only the original eval set, since real usage drifts away from whatever questions the system was tested against at launch. When a metric drops, it points at the stage responsible: falling context recall means revisit chunking, falling precision at K means revisit retrieval, falling faithfulness means revisit generation. The measurement tells you which part of the pipeline to touch, which is the entire point of measuring each stage separately rather than scoring the system as one number.

(If you're setting up drift detection for a RAG system already in production, [get in touch](/contact).)
