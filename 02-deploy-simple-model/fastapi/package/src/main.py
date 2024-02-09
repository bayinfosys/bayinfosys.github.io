"""simple server to compute embeddings of input text
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel

from model import model_load, model_infer, model_unload


@asynccontextmanager
async def lifecycle(app: FastAPI):
    # load the model from the /models directory inside the container
    app.state.model = model_load()

    # yield back to the app
    yield

    # on app-close this is where we would do cleanup
    model_unload()


app = FastAPI(lifespan=lifecycle)


class EmbeddingRequest(BaseModel):
    input: str


@app.post("/")
async def create_embedding(sentence: EmbeddingRequest, request: Request):
    try:
        embedding = model_infer(sentence.input, model=request.app.state.model)
        return {"fragment": sentence, "embedding": embedding.tolist()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/status")
async def status():
    return {"status": "200 OK"}
