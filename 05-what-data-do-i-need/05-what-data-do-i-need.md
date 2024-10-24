# What Data Do I Need? A Guide for Business and Product Owners

As a business owner or product manager, you play a crucial role in driving product value. However, integrating machine learning into your processes can bring a sense of uncertainty. It’s common to wonder how to effectively leverage data for optimal results.

In this article, we will develop a checklist for making this architectural change manageable and straightforward. This approach allows you to tackle significant tasks with confidence:

+ identify the goal
+ break down the problems
+ create a strategy

This article describes part of the process we undertake at [Bay Information Systems](https://www.bayis.co.uk) to ensure successful delivery of an ML feature.


## Data Modalities and Use Cases

Data modality refers to the different forms of data—such as text, audio, images, and video—that provide insights into data origins, content characteristics, associated processing risks, and applicable analytical methods.

**Types of Modalities and Their Use Cases**: 

| **Modality** | **Use Cases** | **Challenges** |
|--------------|----------------|----------------|
| **Text**     | Chatbots, Document Analysis, Sentiment Analysis | Ambiguity, Context Understanding, Personal Information |
| **Structured** | Inventory, Advertising | Structure variation |
| **Audio**    | Voice Assistants, Music Recommendations, Speech-to-Text | Noise Interference, Variability in Speech, Language |
| **Image**    | Computer Vision Applications, Facial Recognition, Quality Control | Occlusion, Variability in Lighting, Illegal Content |
| **Video**    | Surveillance, Video Analysis, Content Moderation | High Data Volume, Real-Time Processing |
| **Multi-modal**| Integrated AI Solutions (text + audio + video)| Complexity in Data Fusion, Alignment |

The above table describes common modalities, uses, and challenges.

All of these modalities can be sequential in time and presented as a time-series -- for example,**text** over time becomes change in sentiment, **Images** over time become monitoring -- which contains all the prior complexities and benefits, combined with the ability to monitor change and identify new opportunities.

Key Questions:
+ What data do we already have? - either the business already captures this or customers provide and it simply needs to be recorded -- is cruicial.
+ What new data can we capture?
+ Does this change carry any regulatory issues?
+ Does this change carry any technical requirements?

These questions are answered by the first step of our process at Bay Information Systems:
+ Audit -- identify current data availability, opportunities and risks.

Common tasks to develop from this analysis are:
+ Data cleaning -- reshaping, removing noise, and organising data.
+ Develop a pipeline -- convert existing/new data to the required format for processing.
+ In-place regulatory requirements -- encryption-at-rest, personal-private-information removal, etc.


## Labeling

Once we understand the data we require for the problem, and have an initial dataset to reason about we can look at the next step: **Labelling**.

This is a crucial stage which supports evaluation. In prior ML systems development, labelling was an expensive and time-consuming process required to train new models.

In modern AI Engineering and the emergence of foundation models, businesses can now leverage pre-trained models to automate parts of the labeling process, reducing time and cost. In the table below we describe some of the models available for generating labelled data:

| **Modality** | **Provider** | **Model** |
|--------------|----------------|----------------|
| **Text**     | OpenAI, Meta, Mistral | GPT-4, Llama, Mistral |
| **Audio**    | OpenAI | Whisper |
| **Image**    | OpenAI, Meta, Salesforce | GPT-4, SAM, Blip |
| **Video**    | Microsoft | XClip |
| **Time-Series** | Amazon | Chronos |

It should be noted that this list is not exhaustive. Companies such as Microsoft, Nvidia and Salesforce are creating new models every day, and many models are created by smaller companies every week.

Given our data, we can obtain access to these models and attempt to label the data with the model according to our business goal.
From the output, we can develop metrics which we can use to monitor progress on the task, performance at the task, distance from our idea, and drift between implementations.

Key Questions at this stage:
+ Does the model label the data?
+ How can we measure these labels?
+ Does the model perform consistently?

Key outcomes:
+ Labels from the model aligned with the data
+ Metrics to measure the data -- these are standard data science metrics around statistical descriptions, diversity, consistency, etc (examples: accuracy, precision, RoC, etc).
+ Metrics to measure our business goal -- these may be unknown before the project (examples: conversion rates, lifetime-customer-value, etc).
+ Processing pipeline -- code artefacts which allow you put the data through the model and obtain an outcome.

In certain cases, it is possible to generate synthetic (i.e., fake data, fake customers, and so on) to complete this stage, but, in general, synthetic solutions are less representative of real-world performance and can therefore be misleading.

## Production

Once all the prior tasks are complete, we now have:
+ A business goal
+ A data source
+ A processing strategy
+ Performance indicators

And, in a small series of steps, we are able to take this feature into production.

## Checklist

To ensure you have the right data for your product, consider the following checklist:

1. **Do you have customers?**
2. **Do the customers interact with your business in measurable ways?**
3. **Do you capture these interactions?**
4. **Do you label/annotate/respond to these interactions?**
5. **Is the ML goal related to this response?**

If you can answer yes to all these boxes you can achive your goals. If you are missing some elements, the project is still feasible but will need some consideration. In either case, please reach out to us at [Bay Information Sytems](https://www.bayis.co.uk/) for advice.


## Conclusion
In today's data-driven landscape, understanding what data you need is crucial for successfully integrating machine learning into your product development process. This article outlines a structured approach for business and product owners, focusing on data modalities and their use cases, the significance of labeling, and the steps necessary for bringing an ML feature to production. By answering key questions about data availability and regulatory requirements, and utilizing pre-trained models for efficient labeling, you can better position your organization for success.

Reach us at [Bay Information Sytems](https://www.bayis.co.uk/).