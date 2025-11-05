# LLM Evaluation Metrics

Evaluating large language models remains one of the more challenging aspects of deploying AI systems in production.
Unlike traditional software, where outputs are deterministic and testable through unit tests, LLM outputs are probabilistic and context-dependent.
This creates a need for structured evaluation approaches that can quantify model performance across different dimensions.

This article provides a reference framework for selecting and implementing evaluation metrics, with particular focus on fine-tuning workflows and retrieval-augmented generation (RAG) systems.
The structure and categorisation presented here draws from the `deepeval` library and its associated documentation, which provides practical implementations of these evaluation approaches.

## Why Metrics Matter

Metrics serve three primary functions in LLM development:

+ **Iteration guidance**: Metrics provide feedback during model development, indicating whether changes improve or degrade performance.
+ **Threshold setting**: Quantitative scores allow teams to define minimum acceptable performance levels before deployment.
+ **Monitoring**: Production metrics reveal model drift, degradation, or unexpected behaviour patterns over time.

Without appropriate metrics, teams risk deploying systems that appear functional in development but fail under production conditions.

## Core Evaluation Dimensions

Effective evaluation typically requires metrics across multiple dimensions.
The specific combination depends on the use case and system architecture, but most production systems benefit from coverage in these areas:

+ **Correctness**: Correctness measures whether the model's output aligns with factual truth or expected behaviour.
+ **Relevance**: Relevance assesses whether the output addresses the input query in a meaningful way.
+ **Hallucination**: Hallucination metrics detect when models generate information that is not grounded in either their training data or provided context.
+ **Contextual Fidelity**: Contextual fidelity measures whether the model's output is grounded in the retrieved context (particularly relevant for RAG systems).

## RAG-Specific Metrics

RAG systems introduce additional evaluation requirements beyond standard LLM metrics, as they involve both retrieval and generation stages.

**Relevancy** measures whether the retrieval component surfaces documents that contain information relevant to the query. This can be assessed through:

+ **Precision at K**: What proportion of the top K retrieved documents are relevant?
+ **Recall at K**: What proportion of all relevant documents appear in the top K results?
+ **Mean Reciprocal Rank (MRR)**: How highly ranked is the first relevant document?

**Utilisation** measures how effectively the LLM uses the provided context:

+ **Groundedness**: Are the LLM's claims traceable to the retrieved context?
+ **Citation accuracy**: If the system provides citations, do they correctly reference the source material?
+ **Context sufficiency**: Does the retrieved context contain enough information to answer the query?

**End-to-End** requires measuring the combined performance of retrieval and generation:

+ **Answer correctness**: Given ground truth answers, how accurate are the generated responses?
+ **Answer relevancy**: Do the responses address the queries appropriately?
+ **Latency**: What is the end-to-end response time, including retrieval?

## Fine-Tuning Evaluation

Fine-tuning workflows require metrics that can compare model versions and track improvement over iterations.

During fine-tuning, **standard training** metrics provide initial feedback:

+ **Loss curves**: Both training and validation loss indicate whether the model is learning and generalising.
+ **Perplexity**: Lower perplexity on held-out data suggests better language modelling.

These metrics are necessary but insufficient, as they do not directly measure task performance.

Fine-tuned models should be evaluated on the **specific task** they were trained for:

+ **Instruction following**: Does the model correctly interpret and execute instructions?
+ **Output format compliance**: For structured outputs, does the model maintain the required format?
+ **Domain accuracy**: For domain-specific fine-tuning, does the model demonstrate improved knowledge in that domain?

When fine-tuning for one capability, it is important to avoid intoducing **regressions**:

+ **Baseline task performance**: Maintain a test set of general tasks to detect capability loss.
+ **Safety metrics**: Ensure fine-tuning does not increase toxic or biased outputs.
+ **Multi-task benchmarks**: Standard benchmarks (such as MMLU or HellaSwag) can reveal unintended side effects.

## Responsible AI Metrics

Production systems require evaluation for potential harms:

**Bias** metrics assess whether the model produces systematically different outputs based on demographic or other sensitive attributes. This can be measured through:

+ Controlled experiments with matched inputs varying only in demographic references
+ Analysis of sentiment or quality scores across different demographic groups
+ Fairness metrics such as demographic parity or equalised odds

**Toxicity** metrics detect harmful, offensive, or inappropriate content. Common approaches include:

+ **Classifier-based detection**: Using trained toxicity classifiers (such as Perspective API)
+ **Lexicon-based methods**: Checking for known offensive terms or patterns
+ **LLM-as-judge**: Using instruction-tuned models to identify harmful content

## Implementation Considerations

Most production systems benefit from 3-5 core metrics rather than comprehensive coverage of all possible dimensions. The selection should be driven by:

+ **Use case requirements**: What matters most to end users?
+ **Failure modes**: What types of errors would be most damaging?
+ **System architecture**: RAG systems need retrieval metrics; fine-tuned models need regression testing.

Overly broad metric coverage adds complexity without necessarily improving insight.

Modern LLM evaluation increasingly relies on **LLM-as-judge** approaches, where a separate (often more capable) LLM evaluates outputs.
This is more flexible than traditional statistical methods (`BLEU`, `ROUGE`) but introduces considerations:

+ **Judge model selection**: More capable models (such as GPT-4) generally provide more reliable evaluations.
+ **Prompt design**: Clear, detailed rubrics improve consistency and accuracy.
+ **Cost and latency**: LLM-as-judge adds inference costs and time.
+ **Reliability**: Multiple samples or ensemble approaches can reduce variance.

Statistical methods remain useful for specific cases (exact match for classification, edit distance for correction tasks) but generally lack the semantic understanding required for open-ended text evaluation.

Metrics are most useful when compared against **baselines**, established from:

+ **Initial model performance**: Pre-fine-tuning or with basic prompts
+ **Human performance**: On the same evaluation set
+ **Previous system versions**: To track whether changes improve outcomes

## Practical Implementation

Modern evaluation frameworks provide pre-built metrics alongside the flexibility to define custom ones. The deepeval library (https://github.com/confident-ai/deepeval) offers implementations of many metrics discussed in this article, including correctness, hallucination, contextual relevancy, and bias detection. Such frameworks reduce implementation overhead while maintaining the flexibility to define task-specific evaluation criteria.

When implementing evaluation:

+ **Automate early**: Manual evaluation does not scale and introduces inconsistency.
+ **Version control**: Track both the evaluation code and the datasets used.
+ **Continuous evaluation**: Run metrics regularly as part of development and deployment pipelines.
+ **Monitor production**: Use a subset of metrics on production traffic to detect drift.

## Summary

Effective LLM evaluation requires selecting metrics that align with use case requirements and system architecture. For RAG systems, this means measuring both retrieval quality and generation quality. For fine-tuning, this means tracking task performance while monitoring for regression in other capabilities.

The specific metrics chosen matter less than the discipline of quantifying performance, establishing baselines, and using results to guide development decisions. Production-ready systems should include automated evaluation, clear performance thresholds, and ongoing monitoring.

---

## Quick Reference: Common Metrics by Use Case

### RAG Systems
+ Contextual relevancy (retrieval)
+ Answer correctness
+ Groundedness
+ Answer relevancy
+ Hallucination

### Fine-Tuned Models
+ Task-specific accuracy
+ Instruction following
+ Output format compliance
+ Baseline task performance (regression testing)

### General LLM Applications
+ Answer relevancy
+ Correctness
+ Hallucination
+ Toxicity
+ Bias

### Conversational Systems
+ Multi-turn coherence
+ Context maintenance
+ Task completion (for goal-oriented conversations)
+ Response appropriateness

This reference should provide a starting point for teams implementing evaluation pipelines. The specific implementation details will vary based on available tools and infrastructure, but the fundamental evaluation dimensions remain consistent across most production LLM applications.

## References

This article draws from the evaluation framework and documentation provided by the deepeval project:

+ deepeval library: https://github.com/confident-ai/deepeval
+ Confident AI evaluation guide: https://www.confident-ai.com/blog/llm-evaluation-metrics-everything-you-need-for-llm-evaluation
