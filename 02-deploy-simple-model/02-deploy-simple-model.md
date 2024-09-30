# Deploying Models to AWS Lambda

For many businesses, AI/ML is a means to an end: usually one step a operational goal. However, the perceived high costs and associated risks of implementing such models often deter their adoption, prompting a fallback to conventional methods.

This perception is partly shaped by incumbent AI service providers, who emphasize the expense to enhance their value propositions. Yet, the deployment of open-source models on serverless infrastructure presents a viable, cost-effective alternative, offering low acquisition, usage, and maintenance costs.

In this article, I'll showcase a cost-efficient strategy for deploying a machine learning model tailored to a straightforward application. **Our objective is to minimize expenses**, steering clear of cutting-edge innovation or academic publication ambitions.

+ __Section 1__ outlines the creation of a container image for an open-source model.
+ __Section 2__ adapts this image for serverless execution, specifically AWS Lambda.
+ __Section 3__ covers the AWS deployment process and integration tactics.


## The Technical Objective

Our goal is to deploy a model that generates text embeddings -- a fundamental yet critical microservice for RAG systems or recommendation engines used in numerous sectors.

By the end of this process, we will have:

+ A container image ready for deployment on AWS Lambda.
+ An accessible endpoint that outputs embeddings for provided text.
+ A cost estimate for 1,000 daily invocations.

As engineers, it's crucial to stay focused on both the task at hand and the anticipated outcomes.


# Section 1: Initial Container Image

To compute an embeddings from text, we require a model takes text as input and produces embeddings. An embedding is a vector (list of numbers) representing the content of the text.

The easiest place to explore these models is [HuggingFace](https://huggingface.co/), and particularly [sentence similarity](https://huggingface.co/models?pipeline_tag=sentence-similarity) models -- because the difference between two embeddings is a way to measure the similarity of text. For this example, we will use [all-MiniLM-L6-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2) which is compact and efficient, producing vectors which are 384 units long.

__Note__: the size of a model directly affects computation time; as we are targetting CPU infrastructure we should aim to have a model which responds within a few seconds on CPU execution.

__Note__: when developing a pipeline, process efficiency outweighs model performance. Go with a fast model to develop the pipeline, and refine for performance later. It is a classic error of misdirection to spend longer choosing the model than developing the pipeline.


## Model Caching and Preloading

Before diving into the server setup, it's crucial to address how we manage the model's deployment efficiently. Running the container without preparation will lead to downloading the model from HuggingFace's servers at runtime, which is not optimal for rapid startup times in a serverless environment.

The HuggingFace library, like many Python ML libraries will download assets as needed and cache them on the local disk. We can set the cache location for HuggingFace, download the model to our local directory. Then we update our `Dockerfile` to add the model to the container. Finally, in the application code which runs inside the container using a path relative to the container filesystem. Thus, the model binaries will be in the container and loaded quickly on startup.

To do this, we will use `virtualenv` to create a temporary virtual environment, install HuggingFace, run the python script to load the model, and checkout the result. The script to do this looks like:
```
virtualenv -p python3 venv
source venv/bin/activate
pip install sentance_transformers
python -c 'from sentence_transformers import SentenceTransformer as ST; ST("sentence-transformers/all-MiniLM-L6-v2", cache_folder="models")'
```
this will result in the model being cached to the `/models` directory and we can delete the `venv` directory.

Every model deployment has three stages:
+ load
+ infer
+ unload

We can handle these three functions here:
```
"""interface to load, infer, and unload a model
"""
from sentence_transformers import SentenceTransformer


def model_load():
    return SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2", cache_folder="/models")


def model_infer(sentence: str, model):
    return model.encode(sentence)


def model_unload():
    pass
```

__Note__: The above code has no error handling and uses hardcoded values for brevity. In a production environment, ensure robust error handling and configuration management to enhance reliability and maintainability. We will discuss this in a later article.


## FastAPI Wrapper

We will use [FastAPI](https://fastapi.tiangolo.com/) to orchestrate these stages: loading the model when the server starts, performing inference on a `POST` request, and then exiting when the server stops.

This is our `main.py`:
```
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
```

Here we use `FastAPI` to orchestrate our application. The the loading, inference, and cleanup of the model are handled via the stub functions `model_load`, `model_infer`, `model_unload`. This is a [separation of concerns](https://en.wikipedia.org/wiki/Separation_of_concerns) which will be beneficial later.

The model will be loaded into the `app.state.model` variable so it is thread-safe in the FastAPI async environment. This is the point of intersection between the app lifecycle and the model lifecycle.



## Building a container image

To put that model and script into a container we need a `Dockerfile` and a `requirements.txt` which describes the project dependencies for the container environment.

requirements.txt
```
fastapi
pydantic
uvicorn
sentence-transformers
```

Dockerfile
```
FROM python:3-slim

# download the cpu pytorch into a separate layer so it caches well
RUN pip install --no-cache-dir --extra-index-url https://download.pytorch.org/whl/cpu torch

# install environment
COPY ./package/requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt

# copy the downloaded model
COPY models/ /models

# create the app
WORKDIR /app

# copy out single file of code
COPY ./package/src/main.py /app/main.py

# run the uvicorn server on container startup
CMD ["uvicorn", "main:app", "--host", "0.0.0.0"]
```

Our directory should now look like:
```
.
├── Dockerfile
├── package
│   ├── requirements.txt
│   └── src
│       ├── main.py
│       └── model.py
├── README.md
```

Then we build this container image with: `docker build -t embedding-server .`


## First Run

We run our container image with: `docker run -it --rm -p 8000:8000 embedding-server`.

Test the responsiveness of the container with: `curl http://localhost:8000/status`

```
{"status":"200 OK"}
```

Great! (unless you don't see this...).

Now we can request an embedding with:
```
curl -H 'Content-Type: application/json' -d '{"input": "hello, world!"}' http://localhost:8000/
```

Hope you got a long list of numbers!

__Note__: the `Content-Type` header is required, otherwise `curl` will submit the data as a url encoded string (see [here](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/POST) for details.)


Those of you who prefer a UI can try the cool `FastAPI` feature which automatically generates documentation for your API. Two are available at: `http://localhost:8000/docs` and `http://localhost:8000/redoc`.


# Section 2: AWS Lambda Container

Now we have a model packaged up in a container image, and functioning locally, we should look at deploying to make our tools more available to others.

We have chosen AWS Lambda as our target environment. Since 2020 AWS Lambda has accepted docker images to run under certain constraints. The most notable constraints are:
+ Read-only filesystem
+ 10Gb maximum image size
+ maximum 15 minute runtime
It is important to note that AWS Lambda does not "run" containers in the traditional sense. Amazon provides a wealth of technical information to document the technicalities. See these videos about [serverless cold start](https://www.youtube.com/watch?v=PiQ_eZFO2GU) or [very technical VM loading details](https://www.youtube.com/watch?v=0_jfH6qijVY) as great examples.


Our main big change is to update the base image of the `Dockerfile` to use the AWS lambda base images. These are documented [here](https://docs.aws.amazon.com/lambda/latest/dg/images-create.html). The python base images are listed [here](https://gallery.ecr.aws/lambda/python).

Our new `Dockerfile` looks like:
```
FROM public.ecr.aws/lambda/python:3.9

# cpu pytorch
RUN pip install --no-cache-dir --extra-index-url https://download.pytorch.org/whl/cpu torch

# huggingface sentence-transformers
RUN pip install --no-cache-dir sentence-transformers

# copy the downloaded model
COPY models/ /models

COPY ./package/src/ .

CMD ["lambda_function.handler"]
```

The changes are:
+ new `FROM` base image
+ removed the `requirements.txt`
+ `COPY` now goes to the current directory, rather than `/app   `
+ changed the `CMD` to set a new lambda handler


The code for the handler looks like:
```
import json

from model import model_load, model_infer, model_unload


# load the model on container start
model = model_load()


def handler(event, context):
    """this function is called on invocation"""
    sentence = event["input"]
    return json.dumps(model_infer(sentence, model).tolist())
```

The `handler` function is invoked by the AWS Lambda environment (see [here](https://docs.aws.amazon.com/lambda/latest/dg/python-handler.html) for details). When the container starts, the model is loaded by `model_load` and for each invocation `model_infer` is called. AWS Lambda typically spins up the container on requests (this startup time is called the "cold-start" time.) and following invocations are run on that container instance, so it doesn't require a restart. This means the `model` object persists between invocations.

Now, our directory looks like:
```
├── package
│   ├── requirements.txt
│   └── src
│       ├── lambda_function.py
│       ├── main.py
│       └── model.py
├── README.md
```

So now lets build the container image again: `docker build -t embedding-lambda .`

And run it with: `docker run -it --rm -p 8080:8080 embedding-server`

We can invoke the model by posting to the test endpoint of the Lambda container:
```
curl -H "Content-Type: application/json" -d '{"input": "hello, world!"}' http://localhost:8080/2015-03-31/functions/function/invocations
```

__Note__: The details here are quite important (URL, port) and controlled by the Lambda base image.


# Section 3: Deployment to AWS

__Note__: For the following section I will assume you have Amazon Web Services account and understand `AWS_ACCOUNT_ID` and `AWS_REGION`.

Now we have the lambda container we can deploy it to AWS with [Terraform](https://www.terraform.io/).

Terraform is an Infrastructure as Code software which takes our infrastructure code and interacts with the AWS API to create resources.

The three main benefits of terraform is:
+ ability to create resources with best practice
+ version control of our infrastructure
+ ability to destroy exactly the resources you have created

We can also leverage [Terraform Modules](https://registry.terraform.io/browse/modules) to add a layer of abstraction over the low-level resource definitions. An alternative is the AWS provided [SAM](https://aws.amazon.com/serverless/sam/) and [CDK](https://aws.amazon.com/cdk/).

The following code creates a repository for our Lambda container image and describes a lambda function to host it:
```
resource "aws_ecr_repository" "embedding_model" {
  name                 = "embedding_model"
  image_tag_mutability = "MUTABLE"
}

data "aws_ecr_image" "embedding_model" {
  repository_name = aws_ecr_repository.embedding_model.name
  image_tag       = "latest"
}

module "embedding_model" {
  source  = "terraform-aws-modules/lambda/aws"
  version = "~> 3.0"

  function_name = "embedding-model"
  description   = "Example embedding lambda function"

  create_package = false

  memory_size = 5000
  timeout = 800

  image_uri = data.aws_ecr_image.image.image_uri
  package_type = "Image"
}
```

__Note__: The Lambda definition parameter `memory_size` is set to 3000Mb. We need enough RAM to hold the model amd libraries (which we know from the file structure in Section 1 is ~88Mb on disk, and the container is ~1.84Gb). We allocate that and a little headroom for long sequences.

__Note__: The `timeout` parameter is increased from the default 3s -- which if you run the container locally you will know is short by a few seconds.

We first run this and target __only__ the container repository:
```
terraform init
terraform plan -target=aws_ecr_repository.embedding_model -o new.plan
terraform apply new.plan
```

Terraform has created our repository, so we should upload our container to AWS.
This requires renaming the image to format for AWS, obtaining the `docker login` credentials and using `docker push` to get it up there.
```
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

docker tag embedding-lambda ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/embedding_model

docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/embedding_model
```
__Note__: replace `AWS_ACCOUNT_ID` and `AWS_REGION` with appropriate values.

__Note__: the push is an upload and will depend on your internet upload speeds.

Next, we run the `plan` and `apply` again over the entire infrastructure definition:
```
terraform init
terraform plan -o new.plan
terraform apply new.plan
```

At this point we have the container push to the ECR, the lambda function created referencing this image, and an invocation url for the function.

We can `curl` this URL and test out our process:
```
curl -H 'Content-Type: application/json' -d '{"input": "hello, world!"}' http://${invocation-url}
```

Hurray! You've now deployed a serious model to an industry standard cloud provider!

___Remember___ to destroy your infrastructure:
```
terraform destroy -auto-approve
```


# Conclusion

This article has described (1) deployment of an open source model with [FastAPI](https://fastapi.tiangolo.com/), (2) modification of that container to the AWS Lambda runtime, (3) deployment of that AWS Lambda container image to AWS Lambda.

This has given you a worked example of model deployment using `docker`, `FastAPI` and `AWS Lambda` -- cornerstone technologies.

In future articles, I will discuss monitoring these models in more detail, so be sure to check back for these!

If you are a business interested in this microservice-AI technology, please get in touch to discuss opportunities.

Thank you for reading this far! I know it's a long article with a lot of detail!
