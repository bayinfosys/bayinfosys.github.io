# LLM Training Fundamentals: From Tokens to Human Preference

Large language models are trained in stages, each with different objectives and measurement approaches. Understanding how these stages relate to evaluation helps explain why certain behaviours (like sycophancy or excessive politeness) emerge in chat models despite appearing nowhere in the base training data.

This article examines the mathematical foundations of language model training and how human preference ranking introduces qualities that cannot be captured by statistical metrics alone.

## Part 1: Base Training - Mathematical Foundations

### Tokens: The Atomic Unit

Language models operate on tokens, not words. A token is a discrete index in a fixed vocabulary (typically 50,000-100,000 tokens). The word "running" might be token 5234, while "run" is token 8891 and "runs" is token 3402.

At this level, there is no notion of similarity. Token 5234 has no inherent relationship to token 8891. They are simply different integers in the vocabulary.

This discreteness matters because the model must learn all relationships through usage patterns rather than relying on structural similarity. "Run" and "running" appear similar to humans, but to the model they are as different as "run" and "elephant" until training reveals their contextual patterns.

### Embeddings: Learning Similarity

The first layer of a language model converts token indices into dense vectors (embeddings). During training, tokens that appear in similar contexts develop similar embedding vectors.

For example, if the model frequently sees:
- "The cat **ran** across the road"
- "The dog **ran** across the field"
- "The cat **running** across the road"

The embeddings for "ran" and "running" will naturally become closer in vector space because they appear in comparable syntactic positions and semantic contexts.

This is **learned similarity**. The model doesn't know these words share a morphological root. It discovers their relationship through distributional patterns in the training data. Embeddings capture semantic and syntactic properties that emerge from usage, not from explicit rules.

### Log Probabilities: Measuring Confidence

When predicting the next token, the model outputs a score for every token in its vocabulary. These raw scores (logits) are converted to probabilities using the softmax function.

Before softmax, we often examine log probabilities. For next word of "The cat sat on the..." if the model assigns:
- Token "mat": log probability = -0.5
- Token "rug": log probability = -1.2
- Token "theorem": log probability = -8.3

The model is much more confident about "mat" than "theorem", but it assigns non-zero probability to both. Log probabilities allow us to measure how strongly the model prefers certain continuations over others.

This flexibility matters because language is inherently ambiguous. Given "The cat sat on the...", multiple completions are plausible ("mat", "rug", "chair", "floor"). Log probabilities let us quantify the model's uncertainty across these alternatives.

### Softmax: Strong Penalties for Wrong Predictions

During training, the model sees ground truth text. For "The cat sat on the mat", the ground truth next token after "the" is "mat".

The cross-entropy loss function measures how much probability mass the model assigned to the correct token:

Loss = -log P(correct_token | context)

If the model assigned:
- P(mat) = 0.7, then loss = -log(0.7) ≈ 0.36
- P(mat) = 0.1, then loss = -log(0.1) ≈ 2.30

The loss grows exponentially as the model assigns lower probability to the correct token. This creates strong pressure to concentrate probability mass on plausible continuations.

The softmax function ensures this:
- Correct tokens should get high probability
- Plausible alternatives get moderate probability
- Implausible tokens get very low probability

### A Note on Standard Methods

The softmax function and cross-entropy loss are not specific to language models. These are standard techniques in machine learning, used across image classification, speech recognition, and countless other prediction tasks. Any model that needs to output a probability distribution over discrete classes uses similar approaches.

What makes language models distinctive is not the mathematics but the scale (billions of parameters, trillions of tokens) and the sequential nature of the task (each prediction depends on all previous predictions). The core training objective remains the same: maximise the probability of observing the ground truth sequence.

## Part 2: From Base Models to Chat Models

Modern chat models typically progress through three distinct training phases:

1. **Base training**: Next-word prediction on large text corpora (discussed in Part 1)
2. **Instruction tuning**: Supervised learning on instruction-response examples
3. **Preference optimisation**: Learning from human preference comparisons (RLHF or similar)

Models released after only Phase 1 are called **base models** (such as GPT-J, LLaMA base, or Mistral base). They predict plausible text continuations but don't follow instructions reliably. Models that complete Phase 2 and 3 are called **instruct models** (such as GPT-4, Claude, or LLaMA-2-Chat). They respond to user queries appropriately.

This article focuses on the contrast between Phase 1 (base training with mathematical metrics) and Phase 3 (preference optimisation with human judgment), as this best illustrates how different training objectives produce different model behaviours.

### The Limitation of Statistical Metrics

Base models trained on next-token prediction can generate fluent text, but they don't necessarily produce helpful, harmless, or honest responses to user queries. Instruction tuning improves this, but preference training refines it further.

Consider two responses to "What is the capital of France?":

Response A: "The capital of France is Paris, a city known for its history and culture."

Response B: "The capital of France is Paris. France is a country in Europe with a rich history spanning thousands of years, from the Gauls through the Roman Empire to the modern republic. Paris became the capital in 987 CE under Hugh Capet..."

Both responses are:
- Grammatically correct (low perplexity)
- Factually accurate (could verify with knowledge base)
- Coherent (embeddings would show semantic consistency)

Yet Response B is worse. It's unnecessarily verbose for a simple factual question. But how do we measure "unnecessarily verbose" with log probabilities or embedding distances? We cannot. These metrics evaluate fluency and coherence, not appropriateness or user satisfaction.

### Human Preferences as Ground Truth

Instead of trying to define quality mathematically, preference training uses human judgments directly:

1. Generate multiple responses to the same prompt
2. Show pairs of responses to human raters
3. Raters choose which response they prefer
4. Record: "Response A preferred to Response B"

This is a **binary comparison**. No numerical score. No rubric. Just a simple judgment: which response is better?

### Elo Rating: From Pairwise Comparisons to Rankings

With enough pairwise comparisons, we can construct a ranking using the Elo rating system (borrowed from chess). This approach is based on the Bradley-Terry model from statistics, which estimates quality ratings from pairwise preference data.

Each model response starts with a base rating (e.g., 1500). After each comparison:
- If higher-rated response wins: small rating change
- If lower-rated response wins: large rating change
- Ratings converge to reflect win rates

For example:
- Response A (1500) vs Response B (1500): A wins
- New ratings: A (1516), B (1484)
- Response A (1516) vs Response C (1520): C wins
- New ratings: A (1500), C (1536)

After thousands of comparisons across many prompts, responses with consistently preferred characteristics accumulate higher ratings. The model learns to generate responses that humans prefer **without ever defining what "preferred" means mathematically**.

### Where Bias Enters

This is where behaviours like sycophancy and excessive agreeableness originate:

If human raters consistently prefer:
- Responses that agree with the user ("You're absolutely right...")
- Responses that flatter the user ("That's an excellent question...")
- Responses that are apologetic ("I apologise if my previous response...")

Then the model learns to produce these patterns because they win pairwise comparisons, even when more direct or challenging responses might be more helpful.

The bias doesn't come from the training data (the base model learned from internet text). It comes from the aggregated preferences of human raters, which reflect their own biases, social expectations, and rating contexts. **This preference training phase is where we "align" the model** - and alignment necessarily encodes particular cultural, political, and ideological values.

Examples of alignment in practice illustrate this clearly:

**GPT-4chan**: Yannic Kilcher fine-tuned GPT-J-6B on 4chan's /pol/ board data (continued pre-training with next-word prediction objective). The resulting model was extremely offensive, reflecting the statistical patterns in its training corpus. However, because it received no preference training or alignment, it exhibited none of the hedging, apologetic, or agreement-seeking behaviours typical of aligned models. The offensiveness came from the base training data. The directness and lack of sycophancy came from the absence of alignment.

**Google Gemini**: Early versions produced images with historically implausible demographic compositions (such as ethnically diverse Nazi soldiers), reflecting alignment preferences that valued representation without sufficient historical context constraints. The preference data encoded particular values about diversity that the base model had not learned from training text alone.

**Chinese LLMs**: Models like Ernie Bot and Qwen are aligned to Chinese Communist Party policies. They refuse to discuss Tiananmen Square, refer to Taiwan as part of China, and avoid politically sensitive topics. The base models were trained on internet text (which includes discussion of these topics), but the preference training phase enforced ideological alignment.

These examples demonstrate that alignment is not neutral. It encodes the values, biases, and priorities of whoever creates the preference dataset and defines the rating criteria. **We align the model through human preference data, not through the training corpus.**

Crucially, we cannot detect this bias with perplexity, log probabilities, or embedding similarity. A sycophantic response can be perfectly fluent (low perplexity) and semantically coherent (good embeddings) while still being problematic.

### The Measurement Problem

This raises a fundamental question: **how else could we measure response quality?**

We could attempt to define rubrics:
- Accuracy (but many questions have no single correct answer)
- Conciseness (but sometimes detail is valuable)
- Helpfulness (but what does this mean formally?)

Each rubric introduces new definitional problems. What makes a response "helpful"? Who decides? The same issues that plague human preference data.

Alternatively, we could use automated metrics:
- ROUGE scores for summarisation
- BLEU scores for translation
- F1 scores for question answering

But these correlate poorly with human judgments of quality for open-ended generation. A response can score well on ROUGE while being inappropriate, repetitive, or unhelpful.

The field has largely concluded that human preference data, despite its biases and limitations, provides the most robust signal for training chat models. The question becomes: whose preferences should we optimise for, and how do we mitigate systematic biases in those preferences?

## Open Source Datasets

### Next/Missing Word (Mathematical Metrics)

**The Pile** (EleutherAI)
- 825GB of English text from 22 sources
- Includes books, Wikipedia, academic papers, code
- Used for GPT-NeoX and other base model training
- Available: https://pile.eleuther.ai/

**C4 (Colossal Clean Crawled Corpus)**
- 750GB of cleaned Common Crawl data
- Used to train T5, UL2, and other models
- Focus on clean, English web text
- Available: https://huggingface.co/datasets/c4

**Wikipedia Dumps**
- Clean, well-structured encyclopedic text
- Multiple languages available
- Often used for evaluating perplexity
- Available: https://dumps.wikimedia.org/

**BookCorpus**
- 11,000 books (fiction and non-fiction)
- Used in BERT and GPT training
- Good for narrative and long-form text patterns
- Available: https://huggingface.co/datasets/bookcorpus

**RedPajama**
- Reproduction of LLaMA training dataset
- 1.2 trillion tokens across 7 sources
- Includes code, Wikipedia, books, academic papers
- Available: https://github.com/togethercomputer/RedPajama-Data

**GPT-4chan Dataset** (Yannic Kilcher)
- 3.3 million /pol/ posts from 4chan (2016-2019)
- Fine-tuned GPT-J-6B on this corpus (continued pre-training with next-word prediction)
- Video: "GPT-4chan: This is the worst AI ever" (Yannic Kilcher, YouTube)
- Code: https://github.com/yk/gpt-4chan

### Chat Response Human-Ranked Outputs

**Anthropic's HH-RLHF**
- 170,000 human preference comparisons
- Helpfulness and harmlessness rankings
- Each example: prompt + two responses + preference label
- Available: https://huggingface.co/datasets/Anthropic/hh-rlhf

**OpenAssistant Conversations**
- 161,000 messages across 66,000 conversation trees
- Multiple responses per prompt with human rankings
- Multilingual (English, Spanish, German, etc.)
- Available: https://huggingface.co/datasets/OpenAssistant/oasst1

**Stanford Human Preferences (SHP)**
- 385,000 collective human preferences
- Sourced from Reddit (18 communities)
- Natural preferences from upvotes/downvotes
- Available: https://huggingface.co/datasets/stanfordnlp/SHP

**WebGPT Comparisons**
- 20,000 comparisons for question answering
- Responses include web citations
- Human raters preferred responses with accurate citations
- Available: https://huggingface.co/datasets/openai/webgpt_comparisons

**Chatbot Arena Conversations**
- Ongoing collection from LMSYS Chatbot Arena
- Real user prompts with model comparisons
- Elo ratings computed from blind A/B tests
- Available: https://huggingface.co/datasets/lmsys/chatbot_arena_conversations

**UltraFeedback**
- 64,000 prompts with multiple model responses
- GPT-4 annotations (not human, but high-quality automated preference)
- Used to train Zephyr and other instruction models
- Available: https://huggingface.co/datasets/openbmb/UltraFeedback

## Summary

Language model training progresses through distinct phases, each with different measurement approaches:

**Base training** relies on mathematical metrics. Tokens are discrete. Embeddings learn similarity through context. Log probabilities measure confidence. Softmax penalises incorrect predictions. These metrics evaluate fluency and coherence.

**Preference training** relies on human judgment. Pairwise comparisons create rankings through Elo systems (based on the Bradley-Terry statistical model). This captures qualities (helpfulness, appropriateness, tone) that cannot be measured by statistical metrics alone. It also introduces systematic biases that reflect rater preferences and social expectations.

The challenge for researchers examining LLM behaviour is recognising which phenomena originate from base training (statistical patterns in text) versus preference training (aggregated human judgments). Sycophancy, verbosity, and apologetic tendencies typically emerge from preference data, not from mathematical optimisation of next-token prediction.

Understanding these distinct training objectives helps explain why certain model behaviours resist simple technical fixes. If a behaviour originates from human preference data, changing the base model architecture or training corpus will have limited effect. The bias is in the ground truth itself.
