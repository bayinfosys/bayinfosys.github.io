# Logging for ML

## Idempotency Token

Idempotency tokens are marks which should never change over the life of thing they describe.

We might think of them as hashes or digests.

In and ML system we need a few id tokens:
+ `training data token`: or model version if using a pre-trained model/service,
+ `model token`: particular type of model, architecture etc.
+ `inference token`: refers to a specific inference event

In some cases we may also want to identify:
+ `host hardware`: describing the model hardware environment, driver versions, etc

These tokens allow us to track the performance of our models from a bunch of perspectives:
+ `training data token`
    + shadow testing new model deployments
    + 
+ `model token`
    + memory usage
    + average inference time
    + distribution of response values
+ `inference token`
    + receipt to response tracing
    + capturing `outlier` response traces
    + building new training data
    + malicious users
+ `host hardware`
    + driver/library/package bugs
    + specific latency
