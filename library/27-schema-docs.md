# SQL Schema Documentation for RAG Pipelines

Retrieval-augmented generation systems typically focus on unstructured text documents.
However, structured databases contain valuable context that LLMs can use to generate accurate queries and interpret results.
The challenge is making schema information accessible to language models in a way that preserves relationships, constraints, and business logic.

This is fundamentally a data hygiene issue.
Well-documented schemas serve as a practical form of data governance and provide a semantic layer between raw database structures and their business meaning.
When schema metadata is captured systematically, it becomes accessible not just to human developers but to AI systems that need to reason about data.

This article examines methods for extracting and formatting SQL schema metadata for use in RAG pipelines, with practical examples across PostgreSQL, MySQL, and SQLite.

## Why Schema Context Matters

When an LLM generates SQL queries, it needs to understand:

- Available tables and their relationships
- Column names, types, and constraints
- Foreign key relationships and join patterns
- Business rules encoded in check constraints or triggers
- Custom types and enumerations

Without this context, generated queries may reference non-existent columns, miss critical joins, or violate domain constraints.

## Schema Information Sources

Most relational databases expose schema metadata through system tables or information schemas. These provide programmatic access to table definitions, column properties, and relationships.

### Information Schema (Standard SQL)

The information schema is part of the SQL standard and available in PostgreSQL, MySQL, and many other databases.

```sql
-- List all tables
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public';

-- Get column details
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'customers';

-- Find foreign key relationships
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY';
```

### PostgreSQL System Catalogs

PostgreSQL provides additional schema details through system catalogs (pg_catalog tables).

```sql
-- Get table with description
SELECT
    c.relname AS table_name,
    obj_description(c.oid) AS table_description
FROM pg_class c
WHERE c.relkind = 'r' AND c.relnamespace = 'public'::regnamespace;

-- Column descriptions
SELECT
    a.attname AS column_name,
    col_description(a.attrelid, a.attnum) AS column_description
FROM pg_attribute a
JOIN pg_class c ON a.attrelid = c.oid
WHERE c.relname = 'customers' AND a.attnum > 0;

-- Custom types
SELECT typname, typtype
FROM pg_type
WHERE typnamespace = 'public'::regnamespace;
```

### SQLite Schema

SQLite stores schema information differently, using the sqlite_master table.

```sql
-- List tables
SELECT name, sql FROM sqlite_master WHERE type='table';

-- Get column information
PRAGMA table_info(customers);

-- Foreign keys
PRAGMA foreign_key_list(orders);
```

## Annotation Methods

Beyond basic schema metadata, teams often need to capture business context. Several approaches exist for adding semantic annotations.

### Inline Comments During Table Creation

PostgreSQL supports adding comments directly in CREATE TABLE statements or immediately after.

```sql
-- PostgreSQL: Comments added after table creation
CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    price DECIMAL(10,2),
    stock_quantity INTEGER DEFAULT 0,
    discontinued BOOLEAN DEFAULT FALSE
);

COMMENT ON TABLE products IS 'Product catalogue including inventory levels and pricing';
COMMENT ON COLUMN products.sku IS 'Stock keeping unit, unique identifier for inventory tracking';
COMMENT ON COLUMN products.discontinued IS 'True if product is no longer available for purchase';
```

SQLite does not support the COMMENT syntax, but table and column descriptions can be embedded in the schema SQL itself as regular SQL comments, which are preserved in sqlite_master.

```sql
-- SQLite: Comments preserved in schema
CREATE TABLE products (
    product_id INTEGER PRIMARY KEY AUTOINCREMENT,
    sku TEXT UNIQUE NOT NULL,           -- Stock keeping unit for inventory
    name TEXT NOT NULL,                  -- Display name for customer-facing interfaces
    category TEXT,                       -- Product category for filtering and search
    price REAL,                          -- Current price in GBP
    stock_quantity INTEGER DEFAULT 0,   -- Available units in warehouse
    discontinued INTEGER DEFAULT 0      -- 1 if no longer available
);
```

### Database Comments

PostgreSQL and MySQL support comments on tables and columns, which can be added or modified independently of schema changes.

```sql
-- PostgreSQL: Modifying existing table comments
COMMENT ON TABLE customers IS 'Primary customer records including contact details and account status';
COMMENT ON COLUMN customers.credit_limit IS 'Maximum outstanding balance in GBP, null indicates no limit';

-- MySQL: Comments in ALTER statements
ALTER TABLE customers COMMENT = 'Primary customer records';
ALTER TABLE customers MODIFY COLUMN credit_limit DECIMAL(10,2) COMMENT 'Max balance in GBP';
```

These comments are accessible through system catalogs and can be extracted programmatically.

## Extracting Schema for RAG

Once schema information exists, extract it into a format suitable for LLM context. The goal is to create readable, structured text that captures relationships and business logic.

### Basic Schema Extraction

```python
import psycopg2

def extract_schema_context(connection):
    """
    Extracts table names, descriptions, column details, and comments
    from PostgreSQL system catalogs. Implementation queries pg_class
    and pg_attribute to build a readable schema summary.
    
    Returns formatted string suitable for LLM context.
    """
    # Implementation left to the reader
    pass
```

### Enhanced Schema with Relationships

```python
def extract_enhanced_schema(connection):
    """
    Builds a dictionary containing table descriptions, column metadata
    (including types and nullable constraints), and foreign key relationships.
    
    Queries information_schema and pg_catalog to gather complete relationship
    information. Returns structured dict suitable for JSON serialisation or
    further processing.
    """
    # Implementation left to the reader
    pass
```

### Formatting for Prompt Context

The extracted schema needs formatting for LLM consumption. Several formats work well:

**Markdown Format**

```python
def format_schema_as_markdown(schema_info):
    """
    Converts schema dictionary to markdown format with tables as headings,
    columns as bullet lists, and relationships as separate sections.
    
    Returns markdown string.
    """
    # Implementation left to the reader
    pass
```

**JSON Format**

```python
import json

def format_schema_as_json(schema_info):
    return json.dumps(schema_info, indent=2)
```

**Natural Language Format**

```python
def format_schema_as_text(schema_info):
    """
    Formats schema as readable prose suitable for direct inclusion in
    LLM prompts. Produces sentences describing tables, columns, and
    relationships in plain English.
    
    Returns formatted string.
    """
    # Implementation left to the reader
    pass
```

## Example Output

Given a simple e-commerce schema:

```sql
CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    credit_limit DECIMAL(10,2)
);

COMMENT ON TABLE customers IS 'Customer account records';
COMMENT ON COLUMN customers.credit_limit IS 'Maximum outstanding balance in GBP';

CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(customer_id),
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10,2)
);

COMMENT ON TABLE orders IS 'Customer purchase orders';
```

The markdown format produces:

```
# Database Schema

## customers

Customer account records

### Columns

- **customer_id** (integer) (required)
- **email** (character varying(255)) (required)
- **credit_limit** (numeric(10,2)) - Maximum outstanding balance in GBP

## orders

Customer purchase orders

### Columns

- **order_id** (integer) (required)
- **customer_id** (integer)
- **order_date** (timestamp without time zone)
- **total_amount** (numeric(10,2))

### Relationships

- customer_id references customers(customer_id)
```

## Integration with RAG Systems

Once formatted, schema context can be included in RAG pipelines several ways:

**Static Context**: Include full schema in system prompt for small databases.

```python
schema_context = extract_schema_context(db_connection)
system_prompt = f"""You are a SQL query assistant. Use this database schema:

{schema_context}

Generate queries based on user questions."""
```

**Dynamic Retrieval**: For large schemas, embed schema descriptions and retrieve relevant tables.

```python
from sentence_transformers import SentenceTransformer
import numpy as np

model = SentenceTransformer('all-MiniLM-L6-v2')

# Embed each table description
table_embeddings = {}
for table_name, info in schema_info.items():
    text = f"{table_name}: {info['description']}"
    table_embeddings[table_name] = model.encode(text)

# Retrieve relevant tables for a query
def get_relevant_tables(user_query, top_k=3):
    query_embedding = model.encode(user_query)
    
    similarities = {}
    for table_name, embedding in table_embeddings.items():
        similarity = np.dot(query_embedding, embedding)
        similarities[table_name] = similarity
    
    top_tables = sorted(similarities.items(), key=lambda x: x[1], reverse=True)[:top_k]
    return [table for table, _ in top_tables]
```

**Hybrid Approach**: Always include core tables, retrieve additional ones as needed.

## Practical Considerations

**Schema Size**: Full schemas can exceed token limits. Prioritise frequently queried tables or use retrieval to select relevant subsets.

**Schema Changes**: Update schema context when migrations occur. Consider versioning schema extractions alongside database migrations.

**Custom Types**: Enumerate possible values for custom types and enums to help the LLM understand valid options.

```python
cursor.execute("""
    SELECT t.typname, e.enumlabel
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typnamespace = 'public'::regnamespace
    ORDER BY t.typname, e.enumsortorder
""")

enums = {}
for type_name, label in cursor.fetchall():
    if type_name not in enums:
        enums[type_name] = []
    enums[type_name].append(label)
```

**Business Rules**: When constraints or triggers encode business logic, document them explicitly.

```sql
COMMENT ON CONSTRAINT customers_credit_check ON customers IS 
    'Credit limit must be positive. NULL indicates unlimited credit.';
```

## Conclusion

Database schemas contain structured information that improves LLM accuracy when generating queries or interpreting results. By extracting schema metadata, adding semantic annotations, and formatting context appropriately, RAG systems can leverage relational data more effectively.

The specific extraction method depends on the database system, schema complexity, and token budget. Start with basic table and column information, then add relationships, constraints, and business rules as needed. Monitor query accuracy and adjust schema documentation based on observed errors or ambiguities.
