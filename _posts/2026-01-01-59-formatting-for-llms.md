---
layout: article
title: "Format Choice and LLM Performance: A Taxonomy"
seo_title: "JSON vs XML vs Plain Text for LLMs: Format Choice and Performance"
description: "The format you use to pass data to a language model affects reliability
and cost more than most practitioners expect. This is a taxonomy of the main options
and the conditions under which each performs well."
keywords: ["llm prompt format", "json vs xml llm", "prompt engineering formats",
"structured output llm", "llm input format", "yaml json xml plain text llm",
"llm token efficiency"]
last_modified_at: 2026-04-28
related:
  - 25-llm-evaluation
  - 19-rag-strategy
  - 22-encoding
  - 50-content-negotiation
---

# Format Choice and LLM Performance: A Taxonomy

The same task, the same model, different input format: performance swings of 200-300%
are routine. This is not a well-publicised finding, and most teams discover it by
accident when a pipeline that works in development behaves differently under a format
change made for unrelated reasons. The effect is large enough to be worth understanding
before building, not after.

There is no universal best format. The right choice depends on the structure of the
data, the nature of the task, and the constraints on the context window. What follows
is a taxonomy of the main options and the conditions under which each performs well.

---

## Plain text

Plain text is the format models train on most heavily. Narrative structure, labelled
fields in prose, line-delimited records: all of these are natural to a model in a way
that structured formats are not. For tasks where the model needs to reason over content
rather than parse structure -- summarisation, classification of unstructured input,
question answering over documents -- plain text is often the most reliable format and
the most token-efficient.

The weakness is ambiguity. Plain text has no schema. A model inferring field boundaries
from prose is doing extra work, and that work introduces variance. For extraction tasks
where the output needs to be parsed programmatically, the ambiguity in the input tends
to produce ambiguity in the output.

---

## JSON

JSON is the default choice for structured data, and a reasonable one when the data
is genuinely hierarchical. Nested objects, arrays of records, key-value pairs with
clear relationships: JSON represents these naturally, and models have seen enough JSON
in training to handle it competently.

The cost is tokens. JSON is verbose relative to its information content. Quoted keys
repeated across every record, brackets and braces as structural overhead, no way to
express a simple list without wrapping each element. For large payloads in a constrained
context window, the token cost of JSON structure can crowd out content.

JSON also degrades on deeply nested structures. A model asked to extract a field five
levels deep in a nested object makes more errors than the same model asked to extract
a field from a flat structure. Flatness, where the data allows it, improves reliability.

---

## XML

XML has become unexpectedly useful in LLM contexts, and for a specific reason: the
open/close tag syntax carries semantics that models parse reliably. `<reasoning>...</reasoning>`
and `<answer>...</answer>` as output delimiters give the model a clear structural frame
for its response, and give the parser unambiguous extraction targets.

```xml
<document>
  <title>Quarterly Review</title>
  <content>Revenue increased 12% year on year...</content>
  <classification>financial</classification>
</document>
```

This is now a common pattern in chain-of-thought prompting: ask the model to put its
reasoning inside `<thinking>` tags and its answer inside `<answer>` tags. The tags
serve as cognitive scaffolding as much as structural markers. Several frontier model
providers use this pattern in their own system prompts.

The token cost of XML is higher than JSON for the same data, and XML is unforgiving of
malformed output: a missing closing tag breaks a naive parser in a way that malformed
JSON often does not. For input data, JSON or plain text is usually preferable. For
structuring model output, XML's explicit delimiters often outperform JSON's implicit
structure.

---

## CSV

CSV performs well on tabular data with no nesting and a small, stable column set.
It is compact, models handle it competently, and the format is unambiguous for its
intended use case. The problems begin at the edges: values containing commas or
newlines require quoting conventions that models apply inconsistently, hierarchical
data cannot be represented without encoding it into a cell (which defeats the purpose),
and a header row repeated across many chunks wastes tokens.

CSV is the right format for genuinely flat tabular data passed as input. It is a
poor choice for output when downstream parsing needs to be robust, because the
quoting edge cases are where errors cluster.

---

## YAML

YAML is human-readable and reasonably compact, and models produce it with acceptable
reliability for configuration-style data. Its main advantage over JSON for input is
reduced syntactic noise: no quotes around keys, no trailing commas, cleaner multiline
strings. For small structured inputs where a human will also read the prompt, YAML
is a defensible choice.

The failure mode is indentation sensitivity. YAML's structure is encoded in whitespace,
and models generating YAML output occasionally produce incorrect indentation that is
syntactically invalid. For programmatic output parsing, JSON is more robust. YAML
earns its place as an input format and in configuration contexts; it is a risky choice
as a required output format in a production pipeline.

---

## A working taxonomy

The choices reduce to a small set of conditions:

Tabular data with no nesting: CSV or labelled plain text. The choice between them
depends on whether downstream parsing or human readability matters more.

Hierarchical data with clear relationships: JSON. Keep nesting shallow where possible.

Structured model output requiring reliable parsing: JSON with a schema, or XML with
explicit delimiters. JSON is more compact; XML is more robust when the output includes
natural language alongside structured fields.

Chain-of-thought or multi-part output: XML. The open/close tag convention handles
mixed content (reasoning plus answer, analysis plus classification) more cleanly than
JSON.

Token-constrained contexts: plain text or CSV. Structure has a cost; pay it only when
the task requires it.

The decision is not permanent. A pipeline that passes data in JSON for clarity during
development may warrant a format review before production if the context window is
under pressure or if extraction reliability is below target. Format is a tunable
parameter, and treating it as one -- rather than a fixed implementation detail -- is
the practical takeaway.

(Bay Information Systems builds and optimises LLM pipelines for production. If format
choice is part of a wider reliability or cost problem, that is worth a conversation.)
