"""interface to load, infer, and unload a model
"""
from sentence_transformers import SentenceTransformer


def model_load():
    return SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2", cache_folder="/models")


def model_infer(sentence: str, model):
    return model.encode(sentence)


def model_unload():
    pass
