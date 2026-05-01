---
layout: article
title: "How to Evaluate an AI Pipeline"
description: "A reference guide to evaluation datasets, metrics, and methodology organised by output type and professional domain."
keywords: ["llm evaluation", "ai benchmarks", "evals", "task specification", "gdpval", "legalbench",
           "financebench", "medqa", "swe-bench", "ragas", "marigold"]
topic: "AI Systems"
last_modified_at: 2026-05-01
seo_title: "How to Evaluate an AI Pipeline: Datasets and Metrics by Task Type"
related:
  - 46-labels-are-the-task
  - 25-llm-evaluation
  - 23-business-goals
  - 24-cross-validation
---

# How to Evaluate an AI Pipeline

OpenAI's GDPval benchmark covers 44 occupations across the top nine sectors of US GDP. Each task was built from actual work product by professionals with an average of 14 years of experience; tasks took seven to nine hours for a domain expert to complete. The primary evaluation metric is blind pairwise comparison by other domain experts.

The engineering effort went into specifying the tasks correctly. A labelled dataset is a formal statement of what correct looks like; without it, there is no definition of success and no way to measure whether the model produces it. (The longer version of this argument is in [Task Specification is the Primary Artefact](/2026-01-01-46-labels-are-the-task).)

Herein, we provode a reference guide to evaluation datasets, metrics, and methodology, organised first by output type and then by professional domain. For each category, the question is the same: what does correct look like, and how do you measure the distance from it?

*([Marigold](https://www.bayis.co.uk/marigold/) runs pipelines against labelled datasets, scores outputs, and accumulates corrected production outputs into a persistent task specification -- the artefact that makes a pipeline transferable and improvable. https://bayis.co.uk/marigold)*

## Classification and Extraction

The most tractable case. The output is a label, a value, or a structured record. Correct is unambiguous.

**Metrics.** Precision and recall are the core measures -- the proportion of positive predictions that are correct, and the proportion of actual positives the model found. F1 is their harmonic mean. For multi-class problems, macro-F1 averages across classes, which surfaces underperformance on rare labels that aggregate scores conceal. Exact match applies to structured extraction (dates, entity spans, amounts) where partial credit is not meaningful.

**Datasets.** For most classification tasks, the right dataset is your own labelled examples. Generic benchmarks like [GLUE](https://gluebenchmark.com) and SuperGLUE can test whether a model understands language generally, but they do not tell you whether it classifies your documents correctly. For named entity recognition, CoNLL-2003 (newswire, four entity types) is the standard English reference. For document classification, Reuters-21578 and AG News are widely used. These are useful for model calibration and comparison but less useful for domain-specific labelled data.

**Methodology.** Hold out a test set before any model sees the data. Evaluate on it once. Confusion matrices reveal which classes the model confuses; a high aggregate F1 can mask systematic failure on a specific category that matters. Track performance by label.

## Retrieval-Augmented Generation

RAG pipelines have two components -- retrieval and generation -- and both require evaluation. A pipeline that retrieves irrelevant context but generates fluent text will score well on surface quality and fail on correctness. (Detailed metric definitions are in [LLM Evaluation Metrics](https://www.bayis.co.uk/library/25-llm-evaluation.html).)

**Metrics.** For retrieval: precision at K, recall at K, and mean reciprocal rank. For generation: faithfulness (are claims traceable to the retrieved context?), answer relevancy, and context precision and recall. Hallucination -- claims not grounded in the provided context -- is the failure mode that matters most in production.

**Datasets.** [RAGAS](https://github.com/explodinggradients/ragas) is the standard open-source framework for RAG evaluation. It generates synthetic question-answer pairs from your source documents, removing the need for manual annotation on the retrieval side and allowing evaluation against your actual corpus. The framework handles faithfulness and relevancy scoring via LLM-as-judge.

Google DeepMind's [FACTS Benchmark Suite](https://www.kaggle.com/benchmarks/google/facts) evaluates factuality across four dimensions: parametric knowledge, search-augmented generation, multimodal inputs, and document grounding. The grounding benchmark alone covers 1,719 examples. The suite is genuinely useful as a calibration instrument; note that Google's own models lead its leaderboard, which is worth bearing in mind when interpreting results.

[TruthfulQA](https://github.com/sylinrl/TruthfulQA) tests factual accuracy on questions humans often answer incorrectly. It is not a RAG benchmark specifically, but it surfaces hallucination patterns in base models that transfer to RAG systems.

**Methodology.** Automated RAGAS metrics are a practical starting point. They do not fully replace human evaluation -- LLM-as-judge can miss domain-specific errors -- but they scale. Calibrate automated metrics against a small human-judged set to understand where they diverge.


## Open-Ended Generation

Reports, summaries, drafts, analyses are where most enterprise pipelines operate, and where evaluation is hardest. The output space is large, multiple responses can be correct, and the difference between adequate and good is a matter of judgement that automated metrics cannot reliably capture.

For GDPval, OpenAI chose blind pairwise expert comparison as the primary metric precisely because automated scoring lacks the semantic understanding to distinguish adequate from good on open-ended deliverables. BLEU and ROUGE measure surface overlap and are not useful here; they penalise legitimate paraphrasing and reward fluent near-misses.

**Metrics.** For automated evaluation, LLM-as-judge with a detailed rubric is the current best option. The rubric must be specific: not "is this a good summary?" but "does this summary include the risk factors from sections 2 and 4, and does it characterise the financial exposure as conditional rather than certain?" Vague rubrics produce inconsistent scores. For high-stakes outputs, blind pairwise human comparison is the right methodology -- two outputs prepared without identifying which is model-generated, judged by a domain expert.

**Datasets.** GDPval's open-source gold subset ([220 tasks](https://huggingface.co/datasets/openai/gdpval)) covers knowledge work across 44 occupations. Its primary value as a reference is methodological: the tasks are well-specified, the rubrics are explicit, and the construction process -- domain experts building tasks from real work product -- is the template for building your own.

[MT-Bench](https://huggingface.co/datasets/HuggingFaceH4/mt_bench_prompts) evaluates multi-turn instruction following across eight categories including writing, reasoning, and coding. For news summarisation, CNN/DailyMail and XSum are standard references.

For most production tasks, the right dataset is one you build from real cases. Fifty to a hundred labelled examples, with explicit rubrics specifying what correct and incorrect look like, is enough to start measuring. The set accumulates value as corrected production outputs are added; after several months of use it will be a more precise statement of the task than anything written before deployment.

**Methodology.** Build the eval set from real tasks, not synthetic ones. Synthetic tasks cluster around the easy cases; real production outputs reveal actual failure modes. Start with the category of error that matters most -- factual errors, missing caveats, wrong structure -- and make sure the rubric is specific enough to catch them.


## Agentic and Multi-Step Tasks

An agent receives a goal and produces a sequence of actions -- tool calls, code execution, web searches, file operations -- to reach it. Evaluation requires specifying not just the final output but what constitutes task completion.

**Metrics.** Task completion rate is the primary metric. Pass@k -- the probability that at least one of k independent runs succeeds -- is useful when a single failure may be a stochastic event rather than a capability gap. Step-level accuracy reveals where in a pipeline agents tend to fail. Cost (tokens, API calls, wall time) matters operationally and also indicates whether an agent is using a sensible strategy.

**Datasets.** [SWE-Bench](https://github.com/princeton-nlp/SWE-bench) contains 2,294 real GitHub issues from 12 Python repositories; the task is to generate a patch that resolves the issue and passes the associated tests. SWE-Bench Verified is a curated subset with confirmed-correct solutions. Execution-based evaluation -- the patch either passes the tests or it does not -- makes this unusually clean. Current top models resolve roughly 50-60% of verified instances.

[MLE-Bench](https://github.com/openai/mle-bench) evaluates agents on 75 Kaggle machine learning competitions run offline, comparing submissions against the original human leaderboard. It covers the full ML engineering workflow: understanding a problem, selecting and training models, evaluating and submitting results.

[GAIA](https://huggingface.co/datasets/gaia-benchmark/GAIA) tests general assistant capability on 450 real-world questions requiring reasoning, web browsing, tool use, and multi-modal handling. Questions are graded on final answer correctness. GAIA comes from Meta FAIR and HuggingFace -- not from a lab with a direct commercial interest in the leaderboard.

[METR's](https://metr.org/) [RE-Bench](https://github.com/METR/RE-Bench) measures ML research engineering tasks -- fitting scaling laws, optimising GPU kernels -- with human expert baselines from 71 attempts. It covers the upper end of the task difficulty curve.

**Methodology.** Where execution-based evaluation is possible, use it. It removes the subjectivity problem entirely. Where it is not -- which is most knowledge work -- task completion must be defined explicitly before the eval runs, not inferred from the output afterwards.

# Domain-Specific Benchmarks

The benchmarks above organise by output type. A parallel body of work organises by professional domain: legal, financial, medical. These are useful for model selection within a sector, but most carry a significant limitation -- they test knowledge rather than work product. A model that passes a legal reasoning benchmark can classify evidence as hearsay; it may still draft a poor contract clause. The distinction matters when the task is not exam-style Q&A but professional deliverables.

GDPval's contribution, again, is that it tests the deliverable. Domain benchmarks have largely not yet made that shift. Where they have, they are noted below.

## Legal

[LegalBench](https://huggingface.co/datasets/nguha/legalbench) is the main open-source English legal reasoning benchmark. Built collaboratively by Stanford Law School and 40 contributors, it covers 162 tasks across six types of legal reasoning -- issue spotting, rule recall, rule application, interpretation, rhetorical understanding, and rule conclusion. Tasks span contracts, statutes, judicial opinions, and civil procedure. The tasks are hand-crafted by legal professionals, which makes the task specification unusually careful. Most tasks are classification or structured extraction; the benchmark does not cover open-ended drafting.

[LexGLUE](https://github.com/coastalcph/lex-glue) is the legal equivalent of GLUE: seven classification and multi-label classification tasks drawn from EU and US legal corpora, including ECtHR judgements and US contract clauses. Useful for comparing models on standard legal NLP tasks.

[CUAD](https://www.atticusprojectai.org/cuad) covers contract understanding: 510 commercial contracts annotated for 41 clause types by legal experts. It tests extraction and classification, not drafting. Produced by the Atticus Project.

## Finance

[FinanceBench](https://github.com/patronus-ai/financebench) tests question answering over real US public company filings -- 10-Ks, 10-Qs, earnings releases. Questions require extracting numerical values, reasoning across tables, and identifying relevant disclosures. The open-source sample contains 150 annotated examples with source evidence. Tasks are intentionally clear-cut, making FinanceBench a minimum performance standard rather than a ceiling.

[FinBen](https://github.com/The-FinAI/PIXIU) is a broader benchmark covering 42 datasets across 24 financial tasks: information extraction, textual analysis, question answering, summarisation, risk management, forecasting, and decision-making. The scope is wider than FinanceBench but the tasks are correspondingly more heterogeneous. Includes novel datasets for regulatory compliance and stock trading.

Both benchmarks test knowledge and information retrieval from financial documents. Neither tests whether a model can produce a financial analysis a fund manager would rely on -- that benchmark does not yet exist as a public resource.

## Medical and Clinical

[MedQA](https://github.com/jind11/MedQA) draws questions from the US Medical Licensing Examination (USMLE): 12,723 multiple-choice questions covering general medical knowledge and clinical reasoning. It is the standard reference for medical LLM evaluation in English, though it measures exam performance rather than clinical task completion.

MultiMedQA (from Google Research, paper: https://arxiv.org/abs/2212.13138) combines six existing medical QA datasets -- MedQA, MedMCQA, PubMedQA, LiveQA, MedicationQA, and MMLU clinical topics -- with a new dataset of health questions searched online. It introduced a human evaluation framework assessing factuality, comprehension, reasoning, potential harm, and bias. The framework is the more durable contribution; the specific datasets have since been superseded by harder benchmarks.

[PubMedQA](https://pubmedqa.github.io) tests biomedical literature comprehension: 1,000 expert-labelled question-answer pairs where each question is answered from a PubMed abstract. Useful for systems that retrieve and summarise research.

The medical domain has the most developed benchmarks of the three sectors listed here, partly because the stakes of clinical errors justify the investment in careful task specification. The shift from exam questions to clinical decision-making benchmarks (covering diagnosis, prescribing, procedure selection) is underway but not yet standardised.

## Practical starting point

The benchmarks above are calibration instruments. They show how models perform on tasks others have specified. That is useful for model selection and for understanding where current systems fail; it does not substitute for evaluating against your own task.

The first step on any engagement is to get labelled examples of the task you actually need to solve. Run the pipeline against them. Look at the failures. Add them to the set with corrections attached. The benchmark literature is evidence that specifying the task properly is the hard part. The teams who built the datasets above -- including GDPval, LegalBench, and FinanceBench -- treated it as primary engineering work, not as a step that happens after the model is chosen.

*(Marigold's eval surface runs any pipeline against a labelled dataset, scores outputs using a configurable judge, and accumulates corrected production outputs into a reusable task specification. https://bayis.co.uk/marigold)*
