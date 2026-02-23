**The Problem with Faster Horses**

There is a quote, often attributed to Henry Ford, that runs: "If I had asked people what they wanted, they would have said faster horses." The point is that people tend to frame new things in terms of what they already know. A horse is what moves you from A to B, so a better version of that is what you reach for first.

Most people are currently doing this with foundation models.

The prevailing framing is acceleration: a faster coder, a quicker analyst, a more efficient copywriter. The model is treated as a capable person running at greater speed, and the natural questions that follow are about where to deploy that speed and which slower humans it makes redundant. This is understandable as a first impression. The outputs are fluent and arrive quickly. It looks, superficially, like watching a person work very fast.

But this framing is wrong in a way that matters.

A foundation model is not an accelerated human. It is more accurately described as a non-deterministic data store: a compressed, learnt representation of a statistical distribution over its training corpus. When you query it, you are not assigning a task to a fast employee. You are sampling from a distribution that was shaped by an enormous body of text, code, or other structured data. The result is a plausible continuation of your input, drawn from that distribution. The model has no goal in the way a person does. It has no stake in the outcome. What it produces is statistically coherent with what it has seen, conditioned on what you gave it.

This reframing is not just more technically honest. It changes what questions are worth asking.

If a model is a data store, then the useful operations are those you would apply to any store: querying it (which is what prompting is, understood properly), probing its structure (mechanistic interpretability work on model weights is essentially schema inspection), updating it (fine-tuning is a form of bulk write to the distribution), and scoping queries to sub-regions of the distribution (which is roughly what retrieval-augmented generation does, by constraining the sampling context). In-context learning behaves like a session-scoped insert: you add information to the query context, it influences the sample, and it persists only for that interaction.

Less explored, but potentially more interesting: using the model's own output probabilities as a signal. A model that is uncertain (in the sense of producing a flat or diffuse distribution over next tokens) is telling you something about the density of its training data in that region. That is useful information about where the store is sparse, not just about what it contains.

We do not yet have a query language for this kind of store, but the question is worth asking: could we have an SQL for LLMs? (If that direction interests you, say so in the comments and I will write it up properly.)

The "faster horse" framing forecloses this kind of thinking before it starts. If the model is just a fast human, then the only interesting questions are economic ones about labour displacement. If it is a new kind of data store with unfamiliar query semantics, then the interesting questions are about what those semantics are, what operations they support, and what problems they are actually suited to. Those are more productive questions, and they sit closer to what these systems genuinely are.

---

Initially published on our substack: https://bayinformationsystems.substack.com/p/the-problem-with-faster-horses
