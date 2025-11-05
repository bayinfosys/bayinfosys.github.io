# How to Isolate Bad Training Data

Cross-validation is typically presented as a method for model evaluation.
Split your data into __k__ folds, train on __k__-1 folds, test on the remaining fold, repeat until each fold has served as the test set.
Average the results and you have a robust estimate of model performance.

This standard application misses a powerful diagnostic capability.
Cross-validation can identify problematic records in your training data by revealing samples that consistently perform poorly across different train-test splits.

When a particular record appears in the test set during cross-validation and the model performs unusually badly on that specific sample (compared to the fold average), this often indicates a data quality issue rather than a modelling limitation.


## How Cross-Validation Reveals Data Problems

Consider a binary classification task with 1,000 samples split into 5 folds (200 samples each).
For each fold serving as the test set, you measure accuracy on those 200 samples.
Most folds might achieve 85-90% accuracy, but one fold consistently produces 65% accuracy.

This performance discrepancy suggests the problematic fold contains records that differ systematically from the rest of your dataset. Common causes include:

+ **Labelling errors**: Incorrect ground truth labels that confuse the model
+ **Feature corruption**: Missing values, encoding errors, or measurement problems
+ **[Distribution](https://en.wikipedia.org/wiki/Probability_distribution) shift**: Records from a different time period, geography, or process
+ **[Outliers](https://en.wikipedia.org/wiki/Outlier)**: Legitimate but extreme cases that require special handling

Cross-validation for data quality assessment reveals these problems through an automated process.


## Identifying Bad Records Systematically

Beyond fold-level analysis, you can track performance on individual samples across all cross-validation runs.
A record that consistently produces high prediction error whenever it appears in the test set is a candidate for closer inspection.

Here's a structured approach:

1. **Run standard k-fold cross-validation** and record predictions for each sample when it appears in the test set
2. **Calculate per-sample error metrics** (classification error, regression residuals, etc.)
3. **Rank samples by error magnitude** to identify the worst-performing records
4. **Examine high-error samples** for common patterns or obvious quality issues
5. **Decide on remediation**: correct labels, fix features, or exclude problematic records

This process transforms cross-validation from purely an evaluation tool into a data quality diagnostic.


## Practical Implementation

The implementation requires tracking which samples produce unusually high errors.
For classification tasks, you might examine samples where the model prediction probability for the correct class is consistently low.
For regression, focus on samples with large residuals.

A useful threshold is samples performing worse than the 95th percentile of error across all cross-validation runs.
This typically identifies 5% of your dataset for manual review, a manageable number for most projects.

You can also examine patterns across the problematic samples.
If bad records cluster around specific feature values or time periods, this suggests systematic rather than random data quality issues.
In this case you need a dataset large enough that each fold contains the same amount of variance.


## Limitations and Considerations

This diagnostic approach works best when problematic records are concentrated rather than evenly distributed.
If data quality issues affect every fold equally, cross-validation won't reveal them through performance differences.
This can be mitigated by repeating the process after shuffling the data.

The method also requires sufficient sample sizes within each fold to detect performance variations.
With very small datasets, random variation might mask genuine data quality signals.

Finally, remember that some performance variations across folds are expected due to natural variation in data difficulty.
The key is identifying systematic patterns rather than random fluctuations.


## Beyond Problem Identification

Once you've identified problematic records, several remediation options exist:

- **Correction**: Fix labelling errors or feature values where possible
- **Exclusion**: Remove records that cannot be corrected
- **Separate modelling**: Build specialised models for different data segments
- **Robust training**: Use techniques that are less sensitive to outliers

The choice depends on the nature and extent of the problems discovered.

## Summary

Cross-validation offers more than model evaluation.
By examining performance variations across folds and tracking per-sample errors, you can systematically identify data quality problems that might otherwise remain hidden.

This diagnostic capability is particularly valuable in real-world datasets where perfect data quality is rare.
Rather than hoping your training data is clean, you can use cross-validation to find and address quality issues before they impact production performance.

The next time you run cross-validation, consider looking beyond the average performance metrics.
The records your model struggles with most might be telling you something important about your data.
