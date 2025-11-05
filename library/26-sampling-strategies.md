# Sampling Strategies for Imbalanced Data

Real-world datasets rarely provide perfect class distributions. Fraud detection systems encounter thousands of legitimate transactions for every fraudulent one. Medical diagnostic tools process countless normal cases for each rare condition. Quality control systems monitor production lines where defects represent a tiny fraction of output.

These imbalanced datasets create a fundamental challenge: machine learning models naturally gravitate towards predicting the majority class. Without intervention, a fraud detection model might achieve 99% accuracy by simply flagging all transactions as legitimate, completely missing the fraudulent cases it was designed to catch.

This article explores three core sampling strategies that address class imbalance and demonstrates their implementation using scikit-learn and the imbalanced-learn library.

## Understanding the Problem

Class imbalance affects model performance in predictable ways. Models trained on imbalanced data typically exhibit:

+ High overall accuracy but poor performance on minority classes
+ Tendency to classify everything as the majority class
+ Low precision and recall for rare but important events
+ Misleading evaluation metrics that hide critical failures

Consider a medical screening dataset with 10,000 healthy patients and 100 with a rare condition. A model that predicts "healthy" for everyone achieves 99% accuracy but fails entirely at its primary objective: identifying the rare condition.

## Sampling Strategies

### Random Oversampling

Random oversampling addresses imbalance by duplicating examples from minority classes. This technique randomly selects minority class samples and creates exact copies until the dataset reaches a more balanced distribution.

```python
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
from imblearn.over_sampling import RandomOverSampler
from collections import Counter

# Create imbalanced dataset
X, y = make_classification(
    n_samples=10000, 
    n_features=20, 
    n_classes=2,
    weights=[0.95, 0.05],  # 95% majority, 5% minority
    random_state=42
)

print("Original distribution:", Counter(y))
# Original distribution: Counter({0: 9500, 1: 500})

# Apply random oversampling
ros = RandomOverSampler(random_state=42)
X_resampled, y_resampled = ros.fit_resample(X, y)

print("Resampled distribution:", Counter(y_resampled))
# Resampled distribution: Counter({0: 9500, 1: 9500})
```

Random oversampling is straightforward and effective for datasets where the minority class contains representative examples. However, it can lead to overfitting as the model sees identical samples repeatedly during training.

### SMOTE (Synthetic Minority Oversampling Technique)

SMOTE generates synthetic examples rather than duplicating existing ones. It selects minority class samples, identifies their nearest neighbours, and creates new samples along the lines connecting these points in feature space.

```python
from imblearn.over_sampling import SMOTE
import matplotlib.pyplot as plt
import numpy as np

# Create simple 2D dataset for visualisation
X, y = make_classification(
    n_samples=1000,
    n_features=2,
    n_redundant=0,
    n_informative=2,
    n_clusters_per_class=1,
    weights=[0.9, 0.1],
    random_state=42
)

# Apply SMOTE
smote = SMOTE(random_state=42)
X_smote, y_smote = smote.fit_resample(X, y)

print("Original distribution:", Counter(y))
print("SMOTE distribution:", Counter(y_smote))

# Visualise the results
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))

# Original data
colors = ['blue', 'red']
for i, color in enumerate(colors):
    mask = y == i
    ax1.scatter(X[mask, 0], X[mask, 1], c=color, alpha=0.6, 
               label=f'Class {i}')
ax1.set_title('Original Dataset')
ax1.legend()

# SMOTE data
for i, color in enumerate(colors):
    mask = y_smote == i
    ax2.scatter(X_smote[mask, 0], X_smote[mask, 1], c=color, alpha=0.6,
               label=f'Class {i}')
ax2.set_title('After SMOTE')
ax2.legend()

plt.tight_layout()
plt.show()
```

SMOTE works well when minority class samples cluster in meaningful regions. It avoids exact duplication but requires careful parameter tuning (particularly the number of nearest neighbours) and may struggle with very high-dimensional data.

### Stratified Sampling and Multi-Class Balancing

For multi-class problems or when maintaining proportional relationships matters, stratified sampling ensures each class is represented appropriately across train-validation splits.

```python
from sklearn.model_selection import StratifiedShuffleSplit
from imblearn.over_sampling import SMOTE

# Create multi-class imbalanced dataset
X, y = make_classification(
    n_samples=10000,
    n_features=20,
    n_classes=3,
    n_informative=15,
    weights=[0.8, 0.15, 0.05],  # Highly imbalanced
    random_state=42
)

print("Original distribution:", Counter(y))

# Stratified train-test split
sss = StratifiedShuffleSplit(n_splits=1, test_size=0.2, random_state=42)
train_idx, test_idx = next(sss.split(X, y))

X_train, X_test = X[train_idx], X[test_idx]
y_train, y_test = y[train_idx], y[test_idx]

print("Train distribution:", Counter(y_train))
print("Test distribution:", Counter(y_test))

# Apply SMOTE to training data only
smote = SMOTE(random_state=42)
X_train_balanced, y_train_balanced = smote.fit_resample(X_train, y_train)

print("Balanced training distribution:", Counter(y_train_balanced))

# Train models for comparison
rf_imbalanced = RandomForestClassifier(random_state=42)
rf_balanced = RandomForestClassifier(random_state=42)

rf_imbalanced.fit(X_train, y_train)
rf_balanced.fit(X_train_balanced, y_train_balanced)

print("\nImbalanced model performance:")
print(classification_report(y_test, rf_imbalanced.predict(X_test)))

print("\nBalanced model performance:")
print(classification_report(y_test, rf_balanced.predict(X_test)))
```

### Custom Sampling Ratios

Sometimes business requirements demand specific class distributions rather than perfect balance. The imbalanced-learn library supports custom sampling strategies:

```python
# Custom sampling strategy
sampling_strategy = {
    0: 5000,  # Keep majority class at 5000 samples
    1: 2000,  # Oversample minority class to 2000
    2: 1000   # Oversample smallest class to 1000
}

smote_custom = SMOTE(sampling_strategy=sampling_strategy, random_state=42)
X_custom, y_custom = smote_custom.fit_resample(X_train, y_train)

print("Custom balanced distribution:", Counter(y_custom))
```

## Evaluation Considerations

Sampling strategies change the training distribution but not the underlying problem. Key evaluation practices include:

+ **Never apply sampling to test sets**: Evaluation should reflect real-world distributions
+ **Use appropriate metrics**: Precision, recall, and F1-score often provide better insight than accuracy for imbalanced problems
+ **Consider business costs**: The cost of false positives versus false negatives should influence threshold selection

```python
from sklearn.metrics import precision_recall_curve, roc_auc_score
import matplotlib.pyplot as plt

# Get prediction probabilities
y_proba = rf_balanced.predict_proba(X_test)[:, 1]

# Plot precision-recall curve
precision, recall, thresholds = precision_recall_curve(y_test == 1, y_proba[:, 1] if y_proba.ndim > 1 else y_proba)

plt.figure(figsize=(8, 6))
plt.plot(recall, precision, marker='.')
plt.xlabel('Recall')
plt.ylabel('Precision')
plt.title('Precision-Recall Curve')
plt.grid(True)
plt.show()

print(f"AUC-ROC Score: {roc_auc_score(y_test == 1, y_proba[:, 1] if y_proba.ndim > 1 else y_proba):.3f}")
```

## Choosing the Right Strategy

Selection depends on dataset characteristics and business requirements:

+ **Random Oversampling**: Start here for simplicity, especially with small minority classes
+ **SMOTE**: Use when minority class samples form coherent clusters and you want to avoid overfitting
+ **Undersampling**: Consider when the majority class is very large and contains redundant examples
+ **Combination approaches**: Mix oversampling and undersampling for extreme imbalances

## Implementation Checklist

When implementing sampling strategies:

1. **Understand the business problem**: What are the costs of missing minority class examples?
2. **Examine data quality**: Are minority class samples representative or outliers?
3. **Apply sampling only to training data**: Keep test sets unchanged for honest evaluation
4. **Use stratified splits**: Maintain class proportions across train-validation-test splits
5. **Monitor for overfitting**: Sampling can amplify overfitting, especially with small datasets
6. **Validate on real data**: Business metrics matter more than model accuracy

## Conclusion

Sampling strategies provide practical tools for addressing class imbalance, but they require thoughtful application. The goal is not perfect class balance but improved model performance on the classes that matter most to your business objectives.

Understanding when and how to apply these techniques allows you to build models that perform reliably on real-world data where perfect distributions are rare and business value often lies in correctly identifying the exceptional cases.
