FROM python:3-slim

# cpu pytorch
RUN pip install --no-cache-dir --extra-index-url https://download.pytorch.org/whl/cpu torch

# huggingface sentence-transformers
RUN pip install --no-cache-dir sentence-transformers

# copy the downloaded model
COPY models/ /models

# create the app
WORKDIR /app

COPY ./package/requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt

COPY ./package/src /app

CMD ["uvicorn", "main:app", "--host", "0.0.0.0"]
