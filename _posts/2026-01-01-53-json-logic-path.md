---
layout: article
title: "Why JSON Logic Needs JSONPath: Adding the vars Operator"
seo_title: "How to Use JSONPath Variables in JSON Logic Rules"
description: "Standard JSON Logic resolves single values via dot notation. When rules need to match against lists -- model outputs, tag arrays, multi-value fields -- dot notation is the wrong tool. json-logic-path adds a vars operator backed by JSONPath."
keywords: ["json logic", "jsonpath", "python", "rules engine", "json-logic-path", "vars operator"]
last_modified_at: 2026-04-01
related:
  - 44-static-vs-dynamic-planning
  - 54-runfox
  - 27-schema-docs
  - 12-alignment
---

# Why JSON Logic Needs JSONPath: Adding the vars Operator

[JSON Logic](https://jsonlogic.com/) is a small, portable rules language.
Conditions are expressed as JSON data structures and evaluated against a data context.
A rule like `{"<": [{"var": "temp"}, 110]}` checks whether a value in the data context is below a threshold.
The format is consistent throughout: one key per rule object, the key is the operator, the value is the arguments.
No `eval()`, no side effects, deterministic output.

The design makes rules serialisable and portable.
A rule stored in a database can be sent to the front end and evaluated in the browser, or evaluated on theserver, or passed to a third system -- without any code transfer.
This property has made JSON Logic common in JavaScript-heavy environments: feature flag systems, dynamic form validation, workflow engines, low-code platforms.
The [reference implementation](https://github.com/json-logic) is in JavaScript, and mature implementations exist for [PHP, Ruby, Go, Java, .NET, and others](https://jsonlogic.com/).
The [json-everything .NET implementation](https://docs.json-everything.net/logic/basics/) gives a clear account of the standard behaviour and its edge cases, and is worth reading alongside the reference docs even if you are working in Python.

Python has a reference implementation at [nadirizr/json-logic-py](https://github.com/nadirizr/json-logic-py).
When we needed JSON Logic in a Python 3.11+ environment, that library had not been updated for modern Python and would not run cleanly.
The fix was a fork -- and once the fork existed, it became practical to add the feature that had motivated reaching for JSON Logic in the first place.

## The Problem with Lists

The `var` operator resolves a single value from the data context using dot notation. `{"var": "user.name"}` returns one string.
The design suits scalar lookups well.

The constraint surfaces when the data context contains lists.
A classification model returns a list of candidate labels with confidence scores.
A document has an array of extracted entities. Standard `var` with dot notation returns the list as an opaque value.
You can retrieve it, but you cannot ask "does any item in this list satisfy this condition" within the rule itself -- that logic falls back to the caller, in Python, where it is no longer a portable rule.

The concrete case that motivated this library was workflow branching in [runfox](https://www.bayis.co.uk/library/54-runfox.html).
A pipeline step calls a classification model; the next step depends on what the model returned.
The branching condition needs to evaluate whether any label in the model's output exceeds a confidence threshold.
`var` cannot express this.
Writing the branch condition in Python defeats the point of having portable, data-defined workflow logic.

`json-logic-path` adds one operator to solve this: `vars`.
This operator is not part of the JSON Logic standard; it is an extension specific to this library.

## How It Works

The library forks `json-logic-py`, updates it for Python 3.11+, and adds `vars` alongside the existing `var`.
The two are deliberately distinct and do not interact.

`var` is unchanged: dot notation, single value, returns `None` (or a supplied default) if the path does not exist.

`vars` resolves multiple values using a JSONPath expression via `jsonpath-ng`.
It always returns a list. An empty list is falsey in Python, so a failed match behaves correctly in boolean branch conditions without special-casing.

```python
from json_logic_path import jsonLogic

# var: unchanged single-value behaviour
jsonLogic({"var": "user.name"}, {"user": {"name": "Alice"}})
# "Alice"

jsonLogic({"var": ["missing.field", "default"]}, {})
# "default"

# vars: JSONPath multi-value resolution
data = {
    "labels": [
        {"text": "cat", "score": 0.92},
        {"text": "dog", "score": 0.41}
    ]
}

rule = {
    "if": [
        {"vars": "$.labels[?(@.score > 0.8)].text"},
        "confident",
        "unsure"
    ]
}

jsonLogic(rule, data)
# "confident"

# empty match is falsey
rule2 = {
    "if": [
        {"vars": "$.labels[?(@.score > 0.99)].text"},
        "very confident",
        "unsure"
    ]
}

jsonLogic(rule2, data)
# "unsure"
```

## The Design Decisions

`vars` always returns a list, even when the JSONPath matches exactly one item.
A consistent return type means simplifies processing and empty-list-as-falsey contract holds in either case.

The alternative would have been introducing a custom wildcard syntax on top of `var`, creating a novel mini-language with no external documentation or tooling.

Keeping `var` and `vars` as distinct operator keys with no shared resolution logic means existing JSON Logic rules work without modification.
The library is a drop-in replacement for `json-logic-py` for any code that only uses `var`; `vars` is purely additive.

Because `vars` is not part of the JSON Logic standard, rules that use it are not portable to other implementations.
The tradeoff is deliberate: within a Python system that controls both the rule storage and the rule evaluation, the constraint does not apply.
If cross-implementation portability matters for a given use case, the branching logic belongs in the caller rather than in the rule.

## What It Enables

The immediate use is workflow branching in runfox, where branch conditions written as JSON Logic can now reference list-valued step outputs directly.
A pipeline that classifies, extracts entities, or returns ranked candidates can branch on those results without any Python condition code in the workflow definition.
The entire workflow -- steps, dependencies, and branching logic -- remains plain YAML and JSON, serialisable and inspectable without executing anything.

The broader use is any system where business rules are stored as data rather than code.
A rules engine, a feature flag system, a routing table -- anywhere that JSON Logic already fits, `vars` extends coverage to data contexts that contain arrays.

(The source is at [github.com/bayinfosys/json-logic-path](https://github.com/bayinfosys/json-logic-path) and the package at [pypi.org/project/json-logic-path](https://pypi.org/project/json-logic-path). For questions about rules-as-data architectures or pipeline branching logic, [get in touch](/#contact-us).)

---

*This article reflects json-logic-path as of April 2026.
The `var`/`vars` distinction is the stable core.
The `vars` operator is not part of the JSON Logic standard and will not evaluate correctly in other implementations.
Verify `jsonpath-ng` version compatibility and Python version requirements against the current README at [github.com/bayinfosys/json-logic-path](https://github.com/bayinfosys/json-logic-path).*
