# Developing with APIs Without Rate Limits: Introducing `APICache`

Data researchers and engineers often work with APIs that are **metered, restricted**, or prone to **rate limits**. These constraints can slow down development, especially in the **early exploration and prototyping** phase - when developers want to experiment, iterate, and understand how the API behaves.

Before building stable pipelines, teams need to:
- Explore endpoints
- Understand response structures
- Collect small datasets to build insight

But that's hard when the API keeps saying:
> "429 Too Many Requests"

or worse
> "402 Payment Required"

At **Bay Information Systems**, we built a solution to **remove this bottleneck**:  a lightweight, transparent **client-side memory proxy**.


## What is `APICache`?

`APICache` is a tiny proxy layer that sits between your code and any structured API.

- Caches API **responses**, not raw HTTP
- Handles **expiration (TTL)** and **versioning**
- Replays old requests transparently during development
- Uses **SQLite** for local persistence
- Fully pluggable with your own fetch functions

It's ideal for:
- **Data scientists** exploring external APIs
- **Machine learning teams** prototyping ingestion
- **Developers** working offline or under quota
- **CI/testing** environments that shouldn't hit live endpoints


## Basic Usage

```python
from cache import APICache
import requests
import os

API_KEY = os.environ["COMPANIES_HOUSE_API_KEY"]
BASE_URL = "https://api.company-information.service.gov.uk"

def fetch_from_ch_api(url, params):
    full_url = url.format(**{**params, "BASE_URL": BASE_URL})
    response = requests.get(full_url, auth=(API_KEY, ""))
    if response.status_code != 200:
        raise ValueError(f"Failed [{response.status_code}]")
    return response.json()

cache = APICache(request_fn=fetch_from_ch_api, ttl=3600)

hit, data = cache.request("{BASE_URL}/company/{company_number}", {"company_number": "12345678"})
print("Cache hit?", hit)
print("Company:", data["company_name"])
```

## Use Cases

- **Research workflows**: quickly prototype without hitting the real API
- **Reproducibility**: always get the same response during a dev session
- **Rate-limit mitigation**: cache responses locally and only update on expiry
- **Data graphing**: accumulate structured API responses for later analysis
- **Mocking**: simulate API responses in test or offline mode


## Example: Google News RSS

```python
import feedparser
from cache import APICache

def fetch_google_news(url, params):
    query = params["q"]
    full_url = f"https://news.google.com/rss/search?q={query}"
    return feedparser.parse(full_url)

cache = APICache(request_fn=fetch_google_news, ttl=86400)

hit, parsed = cache.request("https://news.google.com/rss/search?q={q}", {"q": "next high tide"})
for entry in parsed["entries"]:
    print(entry["title"])
```

## Example: GitHub API

```python
import requests
from cache import APICache

def fetch_github(url, params):
    full_url = url.format(**params)
    resp = requests.get(full_url, headers={"Accept": "application/vnd.github+json"})
    return resp.json()

cache = APICache(request_fn=fetch_github)

hit, user = cache.request("https://api.github.com/users/{username}", {"username": "torvalds"})
print("Name:", user["name"])
```


## Example: OpenAI API Wrapper

You can cache expensive calls to ChatGPT or DALL-E:

```python
import openai
from openai.util import convert_to_openai_object
from cache import APICache

class OpenAICache:
    def __init__(self):
        self.cache = APICache(request_fn=self._fetch_from_openai)

    def _fetch_from_openai(self, key: str, params: dict):
        if key == "openai:chat":
            response = openai.ChatCompletion.create(**params)
        elif key == "openai:image":
            response = openai.Image.create(**params)
        else:
            raise ValueError("Unsupported endpoint")
        return response.to_dict()

    def chat(self, **params):
        hit, raw = self.cache.request("openai:chat", params)
        return convert_to_openai_object(raw), hit
```

## Silly Example: Fibonacci Sequence

Even mathematical functions can be "proxied" for demo purposes:

```python
def slow_fibonacci(_, params):
    n = params["n"]
    if n < 2:
        return n
    return slow_fibonacci(_, {"n": n - 1}) + slow_fibonacci(_, {"n": n - 2})

cache = APICache(request_fn=slow_fibonacci)

for i in range(10):
    hit, result = cache.request("fib", {"n": i})
    print(f"fib({i}) = {result} (from cache: {hit})")
```

In truth, you will always be better off using `functools.lru_cache` for this situation, but sometimes it is nice to capture intermediate results in dynamic programming.


## Final Thoughts

`APICache` is simple by design - built to support **exploration, prototyping, and fast feedback loops**.

If your team hits rate-limit errors, re-runs expensive API calls, or spendds time on fragile mocks, this lightweight layer may be exactly what you need.

Give it a try: [github.com/your-org/apicache](https://github.com/your-org/apicache)
