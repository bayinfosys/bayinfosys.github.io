---
date: 2026-05-27
last_modified_at: 2026-11-14
layout: article
title: "Why Private Inference Is Not Fully Private (Yet)"
seo_title: "Encrypted AI Inference: Homomorphic Encryption and Confidential Computing"
description: "Self-hosted AI still computes on plaintext. How homomorphic encryption would close that gap, why it is not yet practical for LLMs, and what confidential computing offers meanwhile."
keywords: ["homomorphic encryption", "fully homomorphic encryption", "encrypted inference", "private inference cryptography", "fhe machine learning", "homomorphic encryption llm", "confidential computing", "confidential computing gpu"]
topic: "Infrastructure"
related:
  - 40-private-inference
  - 65-why-private-inference
  - 117-private-ai-server
  - 63-private-inference-stack
  - 73-ner-and-pii
  - 64-marigold
---

# Why Private Inference Is Not Fully Private (Yet)

"Private inference" has two meanings. In operational use it means running an open-weight model inside a boundary you control, so data never reaches a third-party server ([what private AI inference is](/library/40-private-inference.html)). In cryptography it means computing on data the server cannot read at all. The first is available today. The second is not yet practical for large language models, and the gap between them is the subject here.

Under the operational meaning the model still computes on plaintext, and whoever operates the hardware can observe what passes through. The boundary rests on architecture and contract. Fully homomorphic encryption (FHE) would make it rest on mathematics: computation on encrypted data, with a guarantee that holds whoever runs the hardware. We set out how that works, why transformer inference is the hard case, and what confidential computing offers in between.

## Computation on encrypted data

Encryption normally works in one direction: plaintext in, ciphertext out, and decryption before the data can be used. To compute `1+1` on encrypted values, a server decrypts them, adds, and encrypts the result. Anyone with access to the server's memory at that moment can read the inputs and the answer.

Homomorphic encryption removes the decryption step. The ciphertext is structured so that certain operations on it produce the same result as the corresponding operations on the plaintext.

## The arithmetic

Modular arithmetic carries the intuition. Working modulo 17, numbers wrap around at 17 the way a clock wraps at 12:

```
2 + 3 = 5,   and 5 mod 17 = 5
10 + 12 = 22, and 22 mod 17 = 5
```

Different inputs give the same output, so the output alone does not reveal the inputs. The property homomorphic schemes depend on is that addition survives the reduction:

```
(a + b) mod n = ((a mod n) + (b mod n)) mod n
```

If an encryption scheme maps plaintext into this kind of structure while preserving addition, then adding two ciphertexts gives the encryption of the sum. A third party can do the addition without knowing the values.

A toy scheme makes it concrete. It is insecure and exists only to show the shape: n = 23, secret offset k = 7.

```python
n, k = 23, 7

def encrypt(x):
    return (x + k) % n

def add_ciphertexts(a, b):
    return (a + b) % n

def decrypt_sum_of_two(c):
    return (c - 2 * k) % n

a, b = 5, 9
ea, eb = encrypt(a), encrypt(b)   # 12, 16
ec = add_ciphertexts(ea, eb)      # 5, computed without knowing k
assert decrypt_sum_of_two(ec) == a + b   # 14
```

Decryption here needs to know how many values were added, because each carries one copy of `k`. Real schemes avoid that by building on lattice problems, where encryption adds structured noise that decryption removes cleanly as long as the noise stays within bounds.

Craig Gentry's 2009 construction showed that fully homomorphic encryption (supporting arbitrary computation, beyond addition) was possible, using lattices, at a cost that made it impractical. Practical schemes followed. CKKS (2017) handles approximate arithmetic over real numbers, which is the arithmetic neural networks perform. Microsoft SEAL, OpenFHE and HElib are maintained library implementations.

## Why transformer inference is the hard case

Neural network inference is addition and multiplication at enormous scale, and under FHE multiplication is the expensive operation. Each multiplication grows the noise in a ciphertext. After a limited number of them (the scheme's multiplicative depth), the noise must be reset by bootstrapping, a costly operation that dominates FHE workloads. Non-linear functions such as softmax and GELU have no direct encrypted form and are replaced by polynomial approximations, which add more multiplications.

The result is an overhead of several orders of magnitude, depending on the model and scheme. Small, shallow models for classification are approaching practicality in research settings. Large language model inference at useful sizes is far from it. GPU acceleration of FHE is narrowing the gap for specific operations, and hybrid designs that combine FHE with other techniques are active research.

## Confidential computing

Between plaintext inference and FHE sits confidential computing. A trusted execution environment (TEE) is a hardware-enforced enclave: code and data inside it are isolated from the host operating system and hypervisor, and memory is encrypted outside the processor. Intel SGX and TDX and AMD SEV provide this on CPUs. NVIDIA's data-centre GPUs from the H100 onwards add a confidential computing mode, which extends the protection to the GPU and makes it relevant to LLM inference.

The host cannot see inside the enclave even with full control of the operating system, and remote attestation lets a client check what code is running before sending data. The computation still runs on plaintext inside the enclave, and the guarantee rests on the hardware manufacturer's implementation, the same kind of trust placed in the secure element that holds keys in a phone.

## What a private deployment can add today

An operator can also limit what it is able to read afterwards. Marigold's API accepts an optional `encrypt` field on a request, carrying the client's public key (ECIES over secp256k1 with AES-256-GCM).
<!-- CHECK BEFORE PUBLISHING: the current marigold source defines the encrypt field (package/src/api/models.py) but no handler appears to use it. Confirm output encryption is implemented in the release this article describes, or remove this section. -->
The output is encrypted with that key before it leaves the inference boundary, and the platform never holds the private key. The operator sees the input in plaintext, runs the model, and returns ciphertext it cannot read.

For a threat model centred on a later breach or export of stored results, that keeps outputs unreadable at rest. It also allows a pattern between parties: one submits a prompt with another's public key, and only the second can read the result. Legal proceedings, clinical trials and information sharing between parties that do not fully trust each other fit that pattern.

## Where that leaves private inference

Cryptographically guaranteed inference for large language models is solved in theory and unsolved in performance. Until the overhead falls, private inference means three things: the data stays inside a defined boundary, the operator works under contractual and technical constraints, and outputs can be encrypted so the operator cannot read them. Confidential computing strengthens the second with hardware. When FHE becomes practical for transformers, the guarantee will move from the operator's conduct to the mathematics. (For the infrastructure side of a private deployment, see [what a private AI server is](/library/117-private-ai-server.html).)
