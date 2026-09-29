---
date: 2026-01-01
layout: article
title: "Funnels vs Bandits"
description: "Content discovery online is run by recommendation engines solving a different problem entirely: a multi-armed bandit deciding what to show, to whom, out of a pool that keeps growing."
keywords: ["multi-armed bandit", "recommendation systems", "explore exploit", "content distribution", "audience growth", "reinforcement learning"]
topic: "Perspectives"
seo_title: "Multi-Armed Bandits in Content Recommendation: Why the Funnel Model Breaks"
related:
  - 75-algorithm-lottery
  - 83-discovery-vs-content
  - 84-search-vs-sort-content
  - 48-adtech-ml
---

# Funnels vs Bandits

A sales funnel models a fixed population, narrowed at each stage by a fixed conversion rate, ending in a transaction. It's a good model for what it was built to describe: a defined list of leads worked by a sales team. Content discovery today doesn't run on a filter. It runs on a recommendation engine, and a recommendation engine is solving a different problem: deciding what to show, to whom, out of a pool that keeps growing rather than narrowing.

## What a bandit is actually optimising

A multi-armed bandit is the standard framing for any system that must repeatedly choose between options with uncertain payoff, balancing exploiting the option that's worked so far against exploring options that might work better. A recommendation engine faces exactly this choice on every impression: show the content that's already proven itself with this audience, or spend an impression testing something unproven. The [Algorithm Lottery piece](/library/75-algorithm-lottery.html) covers the consequence directly: systems that only exploit stop learning about their audience, so every recommender worth using periodically tests dormant or unproven content against a fresh sample.

This reframes the funnel's core assumption. A funnel treats the audience as fixed and the job as filtering it efficiently. A bandit treats the audience as something the system is still learning about, and every impression, yours or a competitor's, is training data feeding the next decision. Two consequences follow directly from this, both covered in more depth elsewhere in this library: which platform mechanism decides whether content compounds or decays ([Long-Tail vs Short-Tail](/library/84-search-vs-sort-content.html)), and why platforms that let a user state intent explicitly command a pricing premium over platforms guessing at it from engagement ([Discovery vs Content](/library/83-discovery-vs-content.html)). Both trace back to the same fact: discovery is an ongoing inference problem.

## Propagation is a new arm

The sales funnel has one exit: a sale. A bandit-driven system has a different kind of event: a propagation. When a citation, a restack, or a backlink puts your content in front of a new audience, that audience's own recommender now has your content as a candidate to test. You haven't converted anyone. You've been added to a different bandit's exploration set, in front of a population that never overlapped with yours, running its own independent process of deciding whether to show you again.

A sale ends. A propagation continues inside someone else's discovery process, generating further impressions, further data, and further chances to be tested again, on a population that keeps growing rather than shrinking. The propagation event is a return to the top of the process, for an audience your own system never reached.

## Where effort goes

The practical difference between a funnel and a bandit model is what counts as progress. A funnel treats every stage as an extraction: get fewer people, get more certainty. A bandit treats every impression as an experiment to improve future decisions, more experiments; it is a lever that compounds. A direct enquiry is a real and valuable outcome. Propagation makes that more likely.

(Bay Information Systems writes about AI infrastructure and the systems that decide what gets seen. If understanding how your own content moves through these processes is a live question, [get in touch](/contact.html).)
