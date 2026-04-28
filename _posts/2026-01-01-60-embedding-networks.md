---
layout: article
title: "Embedding-Based Relationship Discovery: Finding the Real Network in Your Data"
seo_title: "Embedding-Based Relationship Discovery with Community Detection in Python"
description: "Most organisations have a formal model of their customer relationships and
a real one that differs from it. Embeddings and community detection surface the real
structure. Here is how the pattern works and where it applies."
keywords: ["embedding relationship discovery", "community detection", "graph neural networks",
"customer graph", "network analysis", "companies house", "co-purchase network",
"unsupervised clustering", "entity relationships"]
last_modified_at: 2026-04-28
related:
  - 20-vector-db-deepdive
  - 33-vector-db-filters
  - 08-org-sampling
  - 49-embedding-is-the-message
---

# Embedding-Based Relationship Discovery: Finding the Real Network in Your Data

Every organisation has two models of its customer relationships. The formal model is
what the CRM contains: account hierarchies, named contacts, logged interactions,
deals attributed to individuals. The real model is the one that actually governs
purchasing behaviour: who influences whom, which accounts share decision-makers
across different legal entities, which clusters of customers move together because
they share a trade association, a geography, or a common supplier.

The gap between the two is usually invisible until it matters. A churn prediction
model trained on the formal model misses the contagion effect: one account leaving
because its parent entity decided to consolidate vendors, taking five nominally
independent accounts with it. A sales prioritisation model that cannot see the
informal network ranks accounts by individual signals and misses the cluster that
is warming simultaneously.

Embeddings and community detection make the real network legible.

---

## The pattern

The approach has three steps. Represent entities as vectors. Build a graph where
edges connect similar or co-occurring entities. Apply a community detection algorithm
to find clusters in that graph.

Each step has options, and the right choice depends on what data is available and
what the discovered structure will be used for.

**Representing entities as vectors** requires choosing what signals go into the
embedding. For customer relationship discovery, the useful signals are typically
transactional co-occurrence (which accounts purchase similar products in similar
patterns), interaction co-occurrence (which contacts appear together in communications,
meetings, or support tickets), and structural signals from external data (shared
directors, shared addresses, parent-subsidiary relationships from Companies House
or equivalent registries).

A simple co-occurrence embedding treats each account as a vector of purchase
frequencies across product categories. Cosine similarity between two such vectors
measures how similar their purchasing behaviour is, regardless of whether the CRM
records any relationship between them.

```python
import numpy as np
from sklearn.preprocessing import normalize

# purchase_matrix: shape (n_accounts, n_products)
# Each row is one account, each column is purchase frequency for one product
purchase_matrix = build_purchase_matrix(transactions)

# L2-normalise rows so cosine similarity reduces to dot product
normalised = normalize(purchase_matrix, norm='l2')

# Similarity matrix: shape (n_accounts, n_accounts)
similarity = normalised @ normalised.T
```

For richer signals, a learned embedding trained on interaction sequences
(transformer-based, treating account touchpoints as tokens) will capture temporal
patterns that co-occurrence alone misses. The simpler approach is worth validating
first; the additional complexity of a learned embedding is only justified if the
co-occurrence signal is insufficient for the task.

**Building the graph** requires deciding which similarities constitute an edge.
A fully connected graph with weighted edges is computationally tractable at small
scale but expensive at large scale. A sparser graph, where edges exist only above
a similarity threshold, is more practical and often produces cleaner communities.

```python
import networkx as nx

threshold = 0.7
G = nx.Graph()

n = similarity.shape[0]
for i in range(n):
    for j in range(i + 1, n):
        if similarity[i, j] >= threshold:
            G.add_edge(account_ids[i], account_ids[j],
                      weight=float(similarity[i, j]))
```

The threshold is a meaningful parameter, not an arbitrary one. A high threshold
produces small, tight communities of very similar accounts. A low threshold produces
large, loose communities that may not correspond to anything actionable. The right
value is validated against known ground truth where it exists -- confirmed account
families, known enterprise relationships -- and inspected manually where it does not.

**Community detection** partitions the graph into clusters of densely connected nodes.
The Louvain algorithm is the standard choice for this scale of problem: it is fast,
produces stable results, and handles weighted edges naturally.

```python
import community as community_louvain

partition = community_louvain.best_partition(G, weight='weight')
# partition: dict mapping account_id -> community_id

# Add community assignments back to the account dataframe
account_df['community'] = account_df['account_id'].map(partition)
```

The output is a community label per account. Accounts in the same community behave
similarly or interact frequently, regardless of whether the CRM records a relationship
between them.

---

## External structural data

Behavioural similarity finds clusters of accounts that act alike. Structural data
from company registries finds clusters of accounts that are legally or operationally
connected, whether or not that connection is visible in your CRM.

Companies House (in the UK) and equivalent registries in other jurisdictions publish
director and shareholder relationships as open data. Two accounts that share a director
are almost certainly part of the same decision-making unit, even if they appear as
separate records in your CRM with no recorded relationship.

Incorporating this into the graph is additive: add edges for shared directors with
a weight that reflects the structural relationship rather than the behavioural one.
A community that coheres on both behavioural and structural signals is a more reliable
signal than one that coheres on either alone.

```python
# Add structural edges from Companies House data
for account_a, account_b, relationship_type in structural_edges:
    weight = 0.9 if relationship_type == 'shared_director' else 0.7
    if G.has_edge(account_a, account_b):
        # Strengthen existing edge
        G[account_a][account_b]['weight'] = min(
            1.0,
            G[account_a][account_b]['weight'] + weight * 0.3
        )
    else:
        G.add_edge(account_a, account_b, weight=weight)
```

---

## What the communities are useful for

The communities are not an end in themselves. Their value is in downstream tasks where
the real network structure matters.

Churn prediction improves when community membership is a feature alongside individual
account signals. An account with low individual churn risk that belongs to a community
where two other members have recently churned is a different risk profile than the
individual signals suggest.

Sales prioritisation benefits from community-level signals: a community that is warming
collectively (increasing engagement, shortening sales cycles across multiple accounts)
is worth more attention than the individual account signals imply. Conversely, a
community with a flagged account is a reason to check on others in the same cluster.

Account segmentation, when derived from discovered communities rather than manually
defined segments, tends to produce more stable and predictive groupings. The segments
reflect actual behaviour rather than the analyst's prior assumptions about which
dimensions matter.

---

## Validation

Community discovery is unsupervised, which makes validation non-trivial. The algorithm
will always find communities; the question is whether they correspond to anything real.

Three approaches work in practice. First, check against known ground truth: does the
algorithm recover known enterprise account families, confirmed referral relationships,
accounts that have historically churned together? If known relationships are not cohering
into communities, the signal is wrong or the threshold needs adjustment.

Second, inspect communities manually. A community of five accounts in the same postcode,
all in the same SIC code, with overlapping purchase patterns, is probably real. A
community of twenty accounts spread across six industries with no obvious connection
warrants scepticism.

Third, validate against downstream task performance. If churn prediction accuracy
improves when community features are added, the communities are capturing something
real regardless of whether you can explain it. If accuracy is unchanged, the discovered
structure is not predictive and should not be used.

---

The pattern is applicable beyond customer relationships. The same approach -- embed,
build a graph, detect communities -- applies to supplier networks, to document corpora
where semantic similarity implies citation or influence relationships, and to transaction
networks where co-occurrence implies shared context. The data changes; the method does
not.

(Bay Information Systems applies this pattern as part of data strategy engagements
for clients where the formal relationship model and the real one have diverged. If
that gap is a problem you are trying to close, that is a reasonable starting point
for a conversation.)
