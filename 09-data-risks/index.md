# Security Risks in AI Systems with Public Access

Modern AI systems deployed for public use (such as chatbots and generative AI services) bring immense value but also introduce significant **security risks** which must be addressed.

Below is a streamlined breakdown of key risks in publicly accessible AI systems.


## **1. Data Risks**

- **Poisoning**: Malicious actors can inject biased or deceptive data into training pipelines, skewing model behavior. This is especially dangerous in models that incorporate user feedback into retraining.
- **Inference Leakage**: Sensitive data from training can inadvertently surface in AI outputs. Attackers may extract private details through systematic queries (*e.g., membership inference*).
- **Model Inversion**: Attackers can reconstruct private training data by analyzing AI responses, potentially exposing confidential information (*e.g., reversing vector embeddings*).
- **Dataset Exposure**: Misconfigured storage or APIs can accidentally leak training data, exposing proprietary datasets, personal records, or trade secrets.


## **2. Prompt Risks**

- **Prompt Injection**: Attackers craft inputs that override system instructions, leading the AI to ignore policies or generate unintended outputs.
- **Prompt Exposure**: Hidden system prompts (e.g., developer instructions) can be extracted, revealing internal mechanisms and security settings.
- **Prompt Overriding**: Specially designed prompts (e.g., jailbreak techniques like *Do Anything Now*) can bypass AI safeguards, producing restricted content.


## **3. In-Loop Database Risks**

Many AI systems integrate external knowledge bases or persistent memory (e.g., RAG models, AI agents with long-term recall), creating new vulnerabilities:

- **RAG Data Leakage**: AI systems retrieving external documents may surface private or unauthorized content in responses.
- **Agent Memory Corruption**: Attacks like **MINJA (Memory Injection Attack)** manipulate AI memory persistence, causing misinformation to persist across sessions.
- **Persistence-Based Attacks**: Gradual injection of deceptive data can subtly alter the AI’s long-term responses, similar to an *Advanced Persistent Threat* in cybersecurity.


## **4. Other AI Security Risks**

- **Model Extraction**: Adversaries use API queries to approximate proprietary models, effectively cloning them without access to the original training data.
- **Adversarial Attacks**: Small, imperceptible input modifications can cause AI models to misclassify data or produce misleading outputs (*e.g., perturbing images for misrecognition*).
- **Denial-of-Wallet Attacks**: Attackers deliberately flood AI services with high-cost queries, running up operational expenses (*e.g., generating long responses to increase API costs*).


## **Summary**

As public AI adoption grows, these risks demand serious attention. From **data exposure** and **prompt-based exploits** to **resource abuse**, AI’s attack surface is vast and evolving. Businesses must integrate **security audits, monitoring, and proactive risk mitigation** to ensure their AI systems remain both effective and secure.
