FROM public.ecr.aws/lambda/python:3.9

# cpu pytorch
RUN pip install --no-cache-dir --extra-index-url https://download.pytorch.org/whl/cpu torch

# huggingface sentence-transformers
RUN pip install --no-cache-dir sentence-transformers

# copy the downloaded model
COPY models/ /models

COPY ./package/src/ .

CMD ["lambda_function.handler"]
