# Cost of ML

Machine learning is a well-defined problem with specific costs and roles.
In this article, we break down the machine learning process using the equation **F(X) = Y** to relate each component to costs and expertise.
This approach allows businesses to estimate the costs of each part of the process and ensure they have the necessary roles within their organization, increasing the likelihood of successful completion.

This article will demonstrate how understanding the costs associated with data (**X**), models (**F**), and outputs (**Y**) can support decision making -- and define "good enough" goals.

## Components and Roles

Machine learning can be summarised in a simple equation:

\[
\mathbf{F(X) = Y}
\]

- **F (Model):** The algorithm or model which processes data.
- **X (Data):** The input data used by the algorithm.
- **Y (Labels):** The desired output or predictions.

Each part of the equation has specific role requirements:

- **X (Data):**
  - **Domain Experts:** Provide insights into data relevance and quality from the business perspective.
  - **Data Scientists:** Understand what methods and techniques are available to solve the business problem.
- **F (Model):**
  - **Machine Learning Engineers (MLEs):** implement and deploy models to infrastructure.
  - **Developers:** Integrate ML workflows into applications.
- **Y (Labels):**
  - **Labellers:** Tag data to create labeled datasets.

## Resources

- **Compute:** Processing power required for training and inference.
- **Storage:** Space for datasets, models, and results.
- **APIs:** Interfaces for integrating external services or models.

Each of these has specific costs and risks depending on provider, required capacity, regulatory requirements, and so on. These will often be understood as part of a larger digital infrastructure.


## Use Case: CakeyBakey.io

To illustrate these concepts, we will use a hypothetical app called **CakeyBakey.io**.

Our simple app converts a text description of a cake to an image and then rates the cake -- completely automatically with no human involvement! The perfect way to judge my baking...

1. **User Interaction:** A user tweets a cake request to **@cakeybakey**.
2. **Language Processing:** An **LLM (Large Language Model)** interprets the tweet and converts it into an image prompt.
3. **Image Generation:** An AI model generates a cake image based on the prompt.
4. **Social Media Posting:** The generated image is posted on Instagram.
5. **Extended Feature:** The system rates cakes as **"delicious"** or **"not delicious"** and posts a rating back to Twitter.

## Hosting Cost Breakdown

Once the system is running, we assuming each tweet generates **£0.50** in revenue.
Our goal is to get live as fast as possible, but we don't know whether to use a Model-as-a-service provider (like OpenAI) or whether to have a self-hosted solution.

This choice has important implications for support, development time, availability requirements, etc, so understanding per-event cost differential can help inform those decisions.

Let's compare the costs for service-hosted and self-hosted models. 

### Service Hosted Models
  - **LLM Processing (OpenAI's Davinci):**
    - **Cost:** $0.02 per 1,000 tokens; for 200 tokens ≈ **$0.004**.
  - **Image Generation (OpenAI's DALL·E 2):**
    - **Cost:** **$0.016** per image at 512×512 resolution.
  - **Total Cost per Event:** **$0.020** (approx. **£0.015**).
  - **Profit per Event:** £0.50 - £0.015 = **£0.485**.

### Self-Hosted Models
  - **LLM Processing (Meta's LLaMA):**
    - **Compute Time:** 180 seconds per request.
    - **Cost:** **$0.0789** per 3-minute request.
  - **Image Generation (Stable Diffusion):**
    - **Cost:** **$0.0789** per image.
  - **Total Cost per Event:** **$0.1578** (approx. **£0.12**).
  - **Profit per Event:** £0.50 - £0.12 = **£0.38**.

The costs for these are drawn from the API costs given by providers, in the hosted model case from the OpenAI pricing [page](https://openai.com/api/pricing/) and in the self-hosted cast from the AWS instance pricing [page](https://aws.amazon.com/ec2/pricing/on-demand/).

In both cases, prices may vary depending on specific usage (batch vs streaming), cost agreements (pricing tiers and capacity reservations) and so on.

## Final Decision

Each user interaction (a twitter post) can incur known and predictable costs, and we see that the OpenAI service offering is nearly 8x cheaper, and so, barring other issues, would be the obvious choice.

# Retraining

Occasionally a working ML system requires updates to either maintain or improve performance.

+ **Adaptation:** New patterns have been observed in data or user behavior.
+ **Improvement:** New insights allow enhancement of model accuracy.
+ **Error Correction:** Existing errors can be rectified in model outputs.

All of these are desirable, but may not be feasible.

Estimating the cost of improvements can help us decide on feasibility. First, we should understand that all new data will require labelling, and the models will require retraining with that labelled data. So the fundamental question to answer is: How much will it cost to acquire new labels? and How much improvement will we see?

This is a question we are often asked, and have derived the following formulas:

- **Label Cost:** (#labels / # labels_per_day) x labeller_daily_cost
- **Gain:** # new_labels / # total_labels
- **Improvement:** (1 + Gain) x current_accuracy

### Example

Returning to our cakeybakey.io example, assuming our labeller charges £500 a day and labels 20 items per day. For 100 items, cost = 5 days × £500 = £2,500 **investment**.

Using the **Improvement** calculation above on the 100 new labels, added to our 500 existing labels, we can estimate the improved accuracy as (1 + (100/600)) x 70% = 84% -- an increase of 14%.

Given these numbers we can now estimate the **Return on Investment** (ROI) from the increased model performance:

**Break-Even Point:**
+ 7,763 tweets to ROI at 70% accuracy
  - ~15 days @ 500 tweets/day.
+ 6,669 tweets to ROI at 84% accuracy.
  - ~13 days @ 500 tweets/day.

Obviously, there is now a requirement that cakeybakey.io can generate that level of engagement!

### Analysis

- **Higher Accuracy Reduces Break-Even Point:** Investing in retraining leads to quicker ROI.
- **Long-Term Profitability:** Post break-even, the improved model continues to generate higher profits.

While it seems an obvious choice to choose better performance, it may be that the business simply cannot afford the investment required for the return, or the delay in labelling extra data will cause other milestones to be missed. These are important decisions for the business to understand; framing the decision with time and cost provides better context.


# Summary

Understanding the costs associated with machine learning is crucial for making informed business decisions.

## Cost Associations

- **F (Model):** Costs related to model development, training, and maintenance.
- **X (Data):** Costs for data collection, storage, and preprocessing.
- **Y (Labels):** Costs for labeling and annotating data.

## Factors Influencing Costs

- **Model Capabilities (F):** Advanced models may increase costs due to complexity.
- **Model-as-a-Service (F):** Model services are attractive options for initial builds.
- **Data Needs (X):** More or higher-quality data can improve performance but require investment.
- **Processing Costs (Y):** Improved labels and annotation often give greater insight to the problem, but can be the greatest source of cost to the ML project.

By breaking down the project we can isolate components and provide ball-park figures which allow decisions to be made at all stages of the project, estimate what is "good enough" and, crucially, avoid going over-budget.

**Next Steps:** As you consider implementing or expanding ML projects, evaluate the components of **F(X) = Y** in your context. Contact us from our [main page](https://www.bayis.co.uk/#contact-us) to discuss further.