---
date: 2026-08-29
layout: article
title: "Engineering in the Exponential Age: MCP as a Case Study"
description: "MCP moved from a genuine differentiator to an assumed interface faster than REST did. A worked example of what that shift actually requires an engineering team to build, and what it returns."
keywords: ["model context protocol", "mcp", "agentic workflows", "rest api",
"protocol adoption", "fastmcp", "fastapi", "api design", "ai integration"]
topic: "Product & Strategy"
seo_title: "MCP as a Case Study: Engineering in the Exponential Age"
related:
  - 81-exponential-engineering
  - 45-fat-protocols-for-ai
  - 54-runfox
  - 42-software-engineering-solved-governance
---

# Engineering in the Exponential Age: MCP as a Case Study

At a recent [AI Wales](https://aiwales.org/events/) meetup, several developers said some version of: "if a service doesn't offer MCP, I will continue looking.".

[MCP](https://modelcontextprotocol.io/), the Model Context Protocol, is a standard interface for connecting an AI agent to a tool or a data source.
An agent using MCP discovers what a service can do and calls it directly, without a developer writing bespoke integration code for each new agent.

A REST API used to be a differentiator.
A product that exposed one signalled other systems could be built against it.
It's now assumed, and a product without a REST API cannot be taken seriously as infrastructure.

What MCP does in practice is let an agent find a service and use it, the way a person finds and uses a website: by name, by search, by discovery, without builing the specific connection in advance.
A product behind an MCP interface becomes reachable by AI agents, not just developers.

And none of this required much building.
FastMCP and FastAPI turn the protocol and the REST layer beneath it into a few decorators around existing functions, not a system designed from scratch.
The agentic workers calling the service, the actual AI systems, were built by someone else entirely: Anthropic, OpenAI, whoever ships the agent a person happens to be using that day.
In many cases the service itself already existed as a product before any of this started.
MCP is bolted onto something already finished.

The return on the work is not proportional.
A product that speaks MCP reaches a new audience: agents and their users, discovering and using a service the same way they discover anything else in an agentic workflow.
It surfaces use cases the original team never designed for, because the interface is generic enough that someone else's agent can compose it into a task nobody at the company thought to build.
And building the interface forces a clearer answer to what the product actually does, since MCP's tool definitions have to describe the service in terms an agent can act on directly.

The developers in that room are the case in miniature. Each of them is now a potential audience for a product built this way, and so is every agent they set running on their own behalf afterwards.
One integration reaching a person, and everything that person automates through it, is the exponential, network-shaped growth an integration is meant to buy.
