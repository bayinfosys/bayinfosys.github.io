---
date: 2026-05-27
layout: article
title: "Why Private Inference Is Not Fully Private (Yet)"
description: "Self-hosted AI solves the data egress problem. It does
not solve the computation problem. Fully homomorphic encryption is the
missing piece -- and it explains why 'private inference' is currently
an architectural approximation rather than a cryptographic guarantee."
keywords: ["homomorphic encryption", "private inference",
"fully homomorphic encryption", "fhe machine learning",
"encrypted inference", "data sovereignty ai", "private ai",
"confidential computing", "encrypted computation"]
topic: "Infrastructure"
seo_title: "Why Private AI Inference Is Not Fully Private: The FHE Problem"
related:
  - 40-private-inference
  - 65-why-private-inference
  - 66-open-weights-separate-concerns
  - 63-private-inference
  - 64-marigold
---

# Why Private Inference Is Not Fully Private (Yet)

Private inference -- open-weight models running inside a controlled network, with data never crossing to a third-party server -- is a genuine improvement over public providers.
The word "private" is still doing more work than the architecture justifies, though.
The model performs inference on plaintext.
The infrastructure operator can observe what passes through.
The boundary is contractual, not mathematical.

Fully Homomorphic Encryption (FHE) would make the claim mathematically true: computation on encrypted data, without decryption, with a guarantee that holds regardless of who operates the hardware.
It is not currently practical for large language model inference.

This shaped a design decision in [Marigold](https://marigold.run).
A cryptographic guarantee either holds or it does not -- there is no partial version.
We accepted that private inference today cannot offer one, and built within that constraint, described towards the end of this article.

## Computation on encrypted data

Encryption normally works in one direction: plaintext in, ciphertext
out; decryption is required before the data can be used. To run a
calculation, you decrypt first.
In this context the plaintext can be `1+1`.
To perform the calculation we must decrypt the ciphertext, perform the computation, and encrypt the result.
Anyone with access to system memory at that moment can read the submission and the result.

Homomorphic encryption changes this requirement.
The ciphertext is structured such that certain operations produce the same result as those on the plaintext: computation without decryption.

## The arithmetic

The intuition is clearer with numbers. Consider ordinary addition first.

```
2 + 3 = 5
```

Now consider addition in modular arithmetic -- sometimes called clock
arithmetic in schools, for the reason that a 12-hour clock wraps from
12 back to 1. We work with integers modulo some number n, where results
wrap around at n. In the ring of integers mod 17:

```
2 + 3 = 5, and 5 mod 17 = 5    (within range; same result)

10 + 12 = 22, and 22 mod 17 = 5    (wraps; same result, different inputs)
```

That second example is the interesting one.
The same output (5) can arise from different inputs (2+3, and 10+12).
This is a collision; it is not reversible.
Given the output 5, we cannot determine which pair of inputs produced it.

The property that matters for homomorphic encryption is different: that
addition distributes correctly over the modulus.

```
(a + b) mod n = ((a mod n) + (b mod n)) mod n
```

If your encryption scheme maps plaintext values into this ring in a way
that preserves the additive structure, then adding two ciphertexts gives
the same result as encrypting the sum of the plaintexts. A third party
can perform the computation for us without knowing the plaintext values.

A simple illustration, n = 23, secret offset k = 7:

```python
n, k = 23, 7

# Our FHE primitives
def encrypt(x):
    return (x + k) % n

def fhe_sum(a, b):
    return (a + b) % n

def decrypt_addend(c):
    return (c - k) % n

def decrypt_sum(c):
    return (c - k - k) % n

# The original values for Alice and Bob
a = 5
b = 9

# Alice and Bob each encrypt their values
ea = encrypt(a)   # 12
eb = encrypt(b)   # 16

# A server adds the ciphertexts, without knowing k
ec = fhe_sum(ea, eb)  # 5

# Alice decrypts
pc = decrypt_sum(ec)  # 14

# Check we have the correct result
assert pc == a+b
```

This works as an illustration. But notice our `decrypt_sum` function uses `k` twice because we had two encrypted values (to appearances of `k`).
The decryption procedure relies on knowing the shape of computation performed on the ciphertext --  which is not fully secure.
Real homomorphic schemes use algebraic structures where this problem does not arise: the noise introduced during encryption is designed to cancel cleanly on decryption.

Craig Gentry's 2009 proof established that a fully homomorphic scheme -- one supporting arbitrary computation, not just addition -- was achievable.
The construction used lattice-based cryptography and was impractical at the time, but it closed the theoretical question.
Practical schemes followed: CKKS (2017) handles approximate arithmetic over real numbers, which is the kind of computation neural networks actually perform.
Microsoft SEAL, OpenFHE, and HElib are production-quality library implementations.

## Why transformer inference is the hard case

The problem is computational overhead.
Addition under FHE is manageable.
Multiplication is expensive.
And neural network inference is "just" addition and multiplication on a massive scale.

Under CKKS, each ciphertext multiplication requires a bootstrapping
operation -- a procedure to refresh the noise budget before it overflows
and corrupts the result. Bootstrapping is the bottleneck.

A task that takes milliseconds in plaintext takes minutes or hours under
fully homomorphic encryption. For narrow, shallow models doing
classification, the gap is approaching practicality in research settings.
For large language model inference at any real scale, it is not close.
The overhead is between two and four orders of magnitude, depending on the task and scheme.

## Confidential Computing

The practical architecture for private inference today offers a set of guarantees that fall short of FHE but go beyond a purely contractual model.

The model runs inside infrastructure you operate or have contractually bounded.
No content is logged or retained.
The operator is not a party to your training pipeline.
Real properties but inference remains plaintext.

**Confidential computing** occupies a middle position with trusted execution environments -- Intel SGX, AMD SEV -- create hardware-enforced enclaves where code runs in isolation from the host operating system.
The host cannot observe what happens inside the enclave, even with full OS access.
This is a genuine privacy property, stronger than contractual assurance.
It is not FHE because the computation still happens on plaintext inside the enclave boundary.

Without FHE, ultimately, we rely on trust.
Confidential computing requires trusting the hardware manufacturer's implementation of the enclave guarantee.
The same structural issue appears in a more familiar form with secure elements in mobile devices -- the chip inside your phone that stores cryptographic keys is isolated from the main processor, but we are trusting the hardware manufacturer's claim that the isolation holds.

**Marigold's `public_key` parameter** addresses a specific slice of the
problem without requiring either FHE or a trusted execution environment.
You submit a public key with your request. The response is encrypted at
the point of generation, using that key, before it leaves the inference
boundary. Marigold never holds the private key and therefore cannot
decrypt the response. The operator sees the input in plaintext, performs
inference, encrypts the output with your key, and returns ciphertext it
cannot read.

The inference still happens on plaintext. The asymmetry is that the
operator has access to the input, not to the output in any persistent or
readable form. For threat models where the primary concern is a
future breach or export of server logs this enforces encryption outside the inference boundary.

The architecture also enables a specific multi-party pattern.
Party A submits a prompt.
The result is encrypted with a public key held by Party B.
Party B receives output they can read; Party A cannot.
Marigold sees the input and produces the output but cannot reconstruct the exchange without both the input record and the private key -- and the private key is never transmitted to Marigold.
Applications in legal proceedings, clinical trials, and competitive intelligence sharing between parties that do not fully trust each other are the natural fit.

GPU acceleration of FHE operations is an active area; early results reduce the overhead significantly for specific operation types.
Hybrid approaches -- some layers in a trusted enclave, FHE applied selectively -- are a pragmatic middle ground several research groups are exploring.

The honest position is that cryptographically guaranteed private inference for large language models is a solved theoretical problem with unsolved performance characteristics.
The contractual and architectural model is the best available production option.

When FHE overhead reaches practical levels for transformer inference, "private inference" will mean something different and stronger: not "trust the operator's policy" but "trust the mathematics."
That is a different category of assurance.
Until then, the honest description of what private inference provides is: your data does not leave a defined boundary, the operator has accepted contractual and technical constraints, and the response can be encrypted such that the operator cannot read it.

Substanially better than uploading sensitive data and disclosing information to a third party, but not yet a cryptographic guarantee.

---

See our [Marigold](https://marigold.run) platform for more options. For organisations working through the compliance architecture for a specific use case, [get in touch](/contact).
