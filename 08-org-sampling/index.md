# Leveraging AI for Organisational Intelligence

In a recent move, the U.S. meme department DOGE required all staff to send an email describing their recent tasks while copying in their supervisors. Many viewed this as an attack on government workers, while Elon Musk (self-professed "DOGEfather") claimed it was meant to verify that employees existed and were actively working.

However, beyond these interpretations, this email response mechanism serves as an excellent method for sampling the entire U.S. government and its activities in a structured and actionable manner.

## The Challenge of Large Organisations

Large organisations often struggle to capture and analyse data about themselves. However, most maintain centralised indexes for communication, such as email directories, phone lists, or messaging platforms. These provide a unique opportunity to extract valuable insights with the right approach.

By leveraging modern communication tools and data science techniques, we can:

- **Sample** the organisation to obtain direct evidence of its structure and activities;
- **Restructure** the collected data to highlight internal networks;
- **Classify** those networks using AI to reveal roles and responsibilities;
- **Repeat** this process at regular intervals to observe changes over time.

This process enables large organisations to self-organise without relying on rigid hierarchical decrees.

## A Practical Example

Consider a large public-sector organisation that lacks an up-to-date organisational chart. Due to frequent restructuring, any attempt to manually collect and maintain such data quickly becomes obsolete. However, this organisation likely maintains an internal phone system containing staff names, supervisors, departments, and contact numbers.

### Step-by-Step Application

1. **Extract Data**: Ingest the phone system data into a structured database, where each supervisor’s phone number serves as a foreign key, creating a self-referential network.
2. **Reconstruct the Organisation**: Identify the most senior members (those with no supervisors) and use graph analysis to visualise hierarchical relationships.
3. **Render the Organisational Chart**: Using data visualisation techniques, a dynamic and constantly updating organisational chart can be generated from the bottom up.

#### Example Table: Phone System Data

| Name  | Supervisor | Department | Phone Number |
| ----- | ---------- | ---------- | ------------ |
| Alice | Bob        | Finance    | 1234         |
| Bob   | Carol      | Finance    | 5678         |
| Carol | -          | Executive  | 9012         |

This data can be transformed into a hierarchical tree:

```
Carol (Executive)
├── Bob (Finance)
    ├── Alice (Finance)
```

## Extending to Discover Departmental Roles

While phone system data provides structural insights, it lacks details on what each individual actually does. Requiring employees to submit descriptions of their tasks via email allows much richer observations by processing the response (a method which can also be trivially automated).

By integrating these responses into our database, we can apply AI techniques such as:

- **Natural Language Processing (NLP)**: Using a simple BERT model or a fine-tuned LLM, we can extract key topics from responses,
- **Topic Classification**: Grouping employees by task-based responsibilities rather than just department labels,
- **Supervisor Metadata Aggregation**: Associating extracted themes with supervisors to infer direct areas of responsibility.

### Example: Extracting Topics from Emails

| Name  | Supervisor | Task Description                             | Extracted Topic |
| ----- | ---------- | -------------------------------------------- | --------------- |
| Alice | Bob        | Processing invoices, reconciling budgets     | Finance         |
| Bob   | Carol      | Approving budgets, financial reporting       | Finance Mgmt    |
| Carol | -          | Overseeing compliance, strategic initiatives | Leadership      |

With this enhanced data, organisations can dynamically monitor evolving responsibilities and workforce engagement at scale.

## Conclusion

AI-driven organisational sampling offers a powerful solution for large institutions struggling with self-awareness. By leveraging communication data: whether from phone systems, emails, or chat logs: businesses and governments can:

- Automate the creation of real-time organisational charts;
- Gain deeper insights into work distribution and responsibilities;
- Adapt to structural changes with minimal administrative overhead.

The key takeaway: AI can transform scattered internal communications into a continuously updating, data-driven map of any organisation. Leaders who harness these methods can gain unparalleled insights and maintain an adaptive, high-functioning workforce.
