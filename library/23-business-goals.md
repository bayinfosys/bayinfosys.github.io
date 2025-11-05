# Metrics for Business Goals

Accuracy is the most misunderstood metric in machine learning. A model with 95% accuracy can still destroy business value, while a model with 70% accuracy might generate millions in revenue. The difference lies in choosing evaluation metrics that align with actual business objectives.

## Why Accuracy Misleads

Accuracy measures the percentage of correct predictions across all cases. This sounds reasonable until you consider real-world constraints and costs.

**Example: Fraud Detection**
A credit card company processes 1 million transactions daily, with 0.1% being fraudulent (1,000 fraud cases, 999,000 legitimate).

A naive model that predicts "not fraud" for every transaction achieves 99.9% accuracy. Yet it catches zero fraudulent transactions, potentially costing millions in losses.

The fundamental issue: accuracy treats all errors equally, but business impact varies dramatically across different types of mistakes.

## Understanding the Confusion Matrix

Before exploring advanced metrics, we need to understand how model predictions break down:

- **True Positive (TP)**: Correctly identified positive cases
- **False Positive (FP)**: Incorrectly identified as positive
- **False Negative (FN)**: Missed positive cases
- **True Negative (TN)**: Correctly identified negative cases

Different business scenarios care about different types of errors.

## Precision vs Recall: The Core Trade-off

### Precision
**Formula**: TP / (TP + FP)
**Question**: "Of all positive predictions, how many were actually positive?"

**When to prioritise precision**:
- **Email spam detection**: False positives (legitimate emails marked as spam) frustrate users
- **Investment recommendations**: Better to miss opportunities than recommend poor investments
- **Medical treatments**: Avoiding unnecessary treatments for healthy patients

### Recall (Sensitivity)
**Formula**: TP / (TP + FN)
**Question**: "Of all actual positive cases, how many did we catch?"

**When to prioritise recall**:
- **Fraud detection**: Missing fraudulent transactions costs more than investigating legitimate ones
- **Cancer screening**: Missing cancer cases has severe consequences
- **Safety systems**: Better to trigger false alarms than miss genuine threats

### The Trade-off
These metrics are typically inversely related. Increasing the prediction threshold improves precision but reduces recall, and vice versa.

**Example: Customer Churn Prediction**
- **High Precision approach**: Target only customers very likely to churn. Lower marketing spend, but miss many at-risk customers.
- **High Recall approach**: Target all potentially churning customers. Higher marketing costs, but fewer lost customers.

The optimal balance depends on the cost of retention campaigns versus the lifetime value of customers.

## F1 Score and Variants

### F1 Score
**Formula**: 2 × (Precision × Recall) / (Precision + Recall)

F1 score provides a single metric balancing precision and recall, assuming equal importance of both.

### F-Beta Score
**Formula**: (1 + β²) × (Precision × Recall) / (β² × Precision + Recall)

- **F0.5 Score**: Weights precision twice as heavily as recall
- **F2 Score**: Weights recall twice as heavily as precision

For fraud detection, you might use F2 score to emphasise catching fraudulent transactions over minimising false alarms.

## ROC and Precision-Recall Analysis

### ROC AUC (Area Under Curve)
Measures performance across all classification thresholds:
- **0.5**: Random performance
- **0.7-0.8**: Acceptable performance
- **0.8-0.9**: Excellent performance

ROC AUC works well for balanced datasets but can mislead with highly imbalanced data.

### Precision-Recall Curves
For imbalanced datasets, precision-recall curves often provide better insight than ROC curves.

**Example: Predictive Maintenance**
Equipment failure prediction with 99.5% uptime:
- ROC AUC might show 0.95 (excellent)
- PR AUC might show 0.3 (poor performance on actual failures)

The PR AUC reveals the model struggles to identify actual equipment failures, which is the primary business concern.

## Business-Specific Metrics

### Cost-Sensitive Evaluation

Assign different costs to different types of errors based on business impact.

**Example: Insurance Fraud Detection**
- Cost of investigating legitimate claim: £100
- Cost of paying fraudulent claim: £10,000
- Cost ratio: 100:1 (false negatives cost 100x more than false positives)

The optimal model minimises total business cost, not classification error.

### Lift and Gain

**Lift**: How much better the model performs compared to random selection.

**Example: Marketing Campaigns**
- Random targeting: 2% response rate
- Model targeting top 10%: 12% response rate
- Lift: 6x improvement over random

### Top-K Accuracy

For recommendation systems, traditional accuracy is irrelevant.

**Example: Product Recommendations**
- Top-1 accuracy: 15% (correct product is #1 recommendation)
- Top-5 accuracy: 45% (correct product is in top 5)

Business cares about whether customers find relevant products, not whether the #1 recommendation is perfect.

### Revenue vs Engagement Trade-offs

**Example: Recommendation Systems**
Model A achieves 3.2% click-through rate generating £2.1M revenue. Model B achieves 3.4% click-through rate but only £2.0M revenue.

Model B has higher engagement but lower revenue, revealing it recommends cheaper products. The business decision depends on whether the goal is engagement or revenue optimisation.

## Multi-Class Classification

### Macro vs Micro Averaging

**Macro Average**: Calculate metric for each class separately, then average. Treats all classes equally regardless of size.

**Micro Average**: Aggregate contributions of all classes, then calculate metric. Influenced by larger classes.

**Business decision**: Use macro averaging when all categories matter equally (safety classifications). Use micro averaging when larger categories are more important (revenue by product category).

## Regression Metrics for Business

For prediction problems, similar business thinking applies to regression metrics:

### Mean Absolute Error (MAE)
Average absolute difference between predictions and actual values. Use when all errors have similar impact (inventory forecasting).

### Root Mean Squared Error (RMSE)
Penalises larger errors more heavily. Use when large errors are disproportionately costly (financial risk models).

### Mean Absolute Percentage Error (MAPE)
Average percentage error. Use when relative error matters more than absolute error (revenue forecasting).

**Business-Adjusted Example**: Revenue forecasting where 10% error on £1M sale matters more than 10% error on £1k sale. Weight errors by business impact rather than treating them equally.

## Common Evaluation Pitfalls

### Data Leakage in Evaluation
Using information from the future or target variable in features. Example: predicting fraud using post-transaction account balance.

### Evaluation on Non-Representative Data
Test set doesn't match production distribution. Example: training on historical data but deploying during seasonal peaks.

### Optimising Metrics vs Business Goals
Pursuing metric improvements that don't translate to business value. Example: optimising F1 score when business cares about revenue.

### Threshold Selection Without Business Context
Using arbitrary thresholds (like 0.5) instead of optimising for business outcomes.

## Conclusion

Effective model evaluation requires understanding your business context as much as your technical metrics. The best model isn't the one with the highest accuracy or F1 score—it's the one that delivers the most business value within acceptable constraints.

Start with clear business objectives, choose metrics that reflect real costs and benefits, and remember that model evaluation continues through deployment and production monitoring. The goal isn't perfect predictions but profitable decisions.
