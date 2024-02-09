import json

from model import model_load, model_infer, model_unload


# load the model on container start
model = model_load()


def handler(event, context):
    """this function is called on invocation"""
    sentence = event["input"]
    return json.dumps(model_infer(sentence, model).tolist())
