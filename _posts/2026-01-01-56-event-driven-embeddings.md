---
layout: article
title: "Event-Driven Embeddings in PostgreSQL: LISTEN/NOTIFY and the Async Pattern"
seo_title: "How to Generate Embeddings Automatically in PostgreSQL Using LISTEN/NOTIFY"
description: "PostgreSQL's LISTEN/NOTIFY mechanism lets you trigger embedding generation
the moment a row is inserted, without polling, without a separate scheduler, and without
coupling your embedding service to your database schema."
keywords: ["postgresql embeddings", "listen notify postgresql", "event-driven embeddings",
"async embedding generation", "postgres triggers", "vector database", "pgvector",
"automated ml pipeline"]
last_modified_at: 2026-04-28
related:
  - 20-vector-db-deepdive
  - 33-vector-db-filters
  - 19-rag-strategy
  - 55-what-is-data-engineering
  - 11-apicache
---

# Event-Driven Embeddings in PostgreSQL: LISTEN/NOTIFY and the Async Pattern

Most teams add embedding generation as an afterthought. A document lands in the database.
A cron job runs every five minutes, selects rows where `embedding IS NULL`, calls an
embedding model, writes the results back. It works until it does not: the cron job drifts,
the batch grows, embeddings lag behind inserts by minutes or hours, and the vector search
returns stale results without anyone noticing.

PostgreSQL has a better pattern built in. `LISTEN` and `NOTIFY` are a pub/sub mechanism
that has been in the database since version 7. A trigger fires when a row is inserted,
publishes a notification to a named channel, and any connected listener receives it
immediately. The cron job disappears. The polling disappears. The embedding service knows
about new data the moment the database does.

---

## How LISTEN/NOTIFY works

`NOTIFY` sends a message to a named channel. The message can carry an optional payload
string, typically a JSON object. `LISTEN` registers a connection as a subscriber to that
channel. Subscribers receive notifications asynchronously as they arrive.

The mechanism sits inside the database's connection layer, not its transaction machinery.
A `NOTIFY` sent inside a transaction is held until commit -- if the transaction rolls back,
no notification is sent. This is the property that makes it safe to use as an embedding
trigger: you will never attempt to embed a row that does not actually exist.

```sql
-- Notify on every insert, with the new row's ID and text content as payload
CREATE OR REPLACE FUNCTION notify_new_document()
RETURNS trigger AS $$
BEGIN
  PERFORM pg_notify(
    'new_document',
    json_build_object(
      'id',      NEW.id,
      'content', NEW.content
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER document_inserted
  AFTER INSERT ON documents
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_document();
```

Any connection listening on `new_document` receives the payload immediately after the
insert commits.

---

## The listener service

The listener is a small Python process. It opens a persistent connection, registers
interest in the channel, and blocks until a notification arrives. On receipt, it extracts
the payload, calls the embedding model, and writes the result back to the database.

```python
import json
import select
import psycopg2
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")

conn = psycopg2.connect("dbname=mydb user=myuser")
conn.set_isolation_level(psycopg2.extensions.ISOLATION_LEVEL_AUTOCOMMIT)

cur = conn.cursor()
cur.execute("LISTEN new_document;")

print("Listening for new documents...")

while True:
    # Block until a notification arrives (or 5s timeout to check connection health)
    if select.select([conn], [], [], 5) == ([], [], []):
        continue

    conn.poll()
    while conn.notifies:
        notify = conn.notifies.pop(0)
        payload = json.loads(notify.payload)

        embedding = model.encode(payload["content"]).tolist()

        cur.execute(
            "UPDATE documents SET embedding = %s WHERE id = %s",
            (embedding, payload["id"])
        )
        print(f"Embedded document {payload['id']}")
```

Three things worth noting about this pattern. The listener runs outside the database,
which means the embedding model does not compete for database memory or CPU. The
connection is persistent, so there is no per-notification connection overhead. And the
listener can be scaled horizontally: multiple listener processes on the same channel will
each receive every notification, so if you want only one to process each document, you
need a coordination mechanism (a row-level lock on the documents table works fine for this).

---

## Handling volume and back-pressure

The pattern above processes one document per notification. Under low volume that is fine.
Under sustained high insert rates, the embedding model becomes the bottleneck: if inserts
arrive faster than the model can process them, the listener queue grows without bound.

The straightforward fix is batching. Instead of processing immediately on notification,
the listener accumulates IDs for a short window (250 milliseconds is a reasonable starting
point) and then embeds the batch in a single model call. Most embedding APIs and local
models are meaningfully faster per document in batch than in sequence.

```python
import time
from collections import deque

BATCH_WINDOW_MS = 0.25
pending = deque()

while True:
    if select.select([conn], [], [], BATCH_WINDOW_MS) != ([], [], []):
        conn.poll()
        while conn.notifies:
            notify = conn.notifies.pop(0)
            pending.append(json.loads(notify.payload))

    if pending:
        batch = list(pending)
        pending.clear()

        texts = [item["content"] for item in batch]
        ids   = [item["id"]      for item in batch]

        embeddings = model.encode(texts)

        cur.executemany(
            "UPDATE documents SET embedding = %s WHERE id = %s",
            [(emb.tolist(), doc_id) for emb, doc_id in zip(embeddings, ids)]
        )
```

For very high volumes, the listener becomes a staging layer: it writes IDs to a work
queue (SQS, Redis, or a dedicated `embedding_queue` table) and a separate pool of workers
handles the actual model calls. The LISTEN/NOTIFY trigger is still the right mechanism
for the first hop -- it is just not doing all the work in that case.

---

## The synchronous alternative: PL/Python

PostgreSQL also supports PL/Python, which runs Python code directly inside the database
process. A trigger written in PL/Python can call an embedding model synchronously on
insert, writing the embedding to the row before the transaction commits.

```sql
CREATE EXTENSION plpython3u;

CREATE OR REPLACE FUNCTION embed_on_insert()
RETURNS trigger AS $$
  from sentence_transformers import SentenceTransformer
  model = SentenceTransformer("all-MiniLM-L6-v2")
  embedding = model.encode(TD["new"]["content"])
  TD["new"]["embedding"] = embedding.tolist()
  return "MODIFY"
$$ LANGUAGE plpython3u;
```

This is worth knowing and worth avoiding in production. The model loads fresh on every
trigger invocation unless you cache it in the PL/Python global dictionary
(`SD["model"] = ...`). Even with caching, the embedding call blocks the inserting
transaction: the client does not receive confirmation of the insert until the model
has returned. At any meaningful insert rate, this will crush transaction throughput and
produce lock contention you do not want.

PL/Python is genuinely useful for lightweight transformations: normalising text, extracting
structured fields from JSON, running fast rule-based classifiers. It is the wrong tool for
anything that calls an external model or takes more than a few milliseconds. Use
LISTEN/NOTIFY for that.

---

## Fitting this into the broader architecture

The LISTEN/NOTIFY pattern is the first hop in a larger pipeline. The trigger fires on
insert to the raw documents table -- call it the bronze layer. The listener generates the
embedding and writes it back, completing the bronze record. A separate process can then
promote complete records (document plus embedding) to a silver layer where they are
queryable by vector similarity alongside structured metadata filters.

That promotion is the subject of the next article in this series. The pattern here -- an
event fired at the database boundary, consumed asynchronously by a service that does one
thing -- recurs at each layer transition. The architecture becomes a chain of producers and
consumers, each with a clear contract about what it receives and what it emits.

(Bay Information Systems builds data pipelines for clients who need reliable embedding
infrastructure without the overhead of a full MLOps platform. The patterns above come from
production systems. If you are working through the architecture decision, that is a
reasonable place to start.)
