---



date: 2026-10-19
layout: article
title: "Unified Memory Machines for Local AI: DGX Spark, Strix Halo, Mac Studio and Jetson Thor"
seo_title: "Unified Memory for Local LLMs (2026)"
description: "Unified memory machines hold 128GB to 512GB of model weights. DGX Spark, Strix Halo, Mac Studio M5 and Jetson Thor compared on bandwidth, software and price."
keywords: ["unified memory llm", "dgx spark alternative", "strix halo llm", "ryzen ai max 395 llm", "mac studio m5 ultra llm", "apple silicon vs gpu for ai inference", "jetson agx thor llm", "local llm 128gb", "memory bandwidth tokens per second", "rtx spark n1x"]
topic: "Infrastructure"
related:
  - 78-gpu-market-2026
  - 87-inference-infrastructure
  - 95-private-inference-costs
  - 40-private-inference
  - 63-private-inference-stack
---

# Unified Memory Machines for Local AI: DGX Spark, Strix Halo, Mac Studio and Jetson Thor (Late 2026)

A discrete GPU keeps model weights in its own memory, and no consumer card holds more than 32GB. A unified memory machine shares one large pool between CPU and GPU, so a desktop box can hold 128GB to 512GB of weights. That has made these machines a category of their own for local inference, alongside the cards covered in our [GPU options guide](/library/78-gpu-market-2026.html).

Capacity decides which models fit. Bandwidth decides how fast they run. We set out the arithmetic that connects the two, list the machines available in October 2026, and finish with a way to choose between them.

## Capacity, bandwidth and tokens per second

Generating each token of output reads every active weight from memory once. Memory bandwidth divided by the bytes read per token therefore sets a ceiling on generation speed. (The ceiling ignores the KV cache and other overheads; measured speeds land somewhat below it.)

A dense 70B model at 4-bit quantisation reads about 40GB per token. A mixture-of-experts model reads only its active experts: gpt-oss-120b holds about 64GB of weights but activates roughly 5B parameters per token, about 3GB.

| Machine | Bandwidth | Ceiling, dense 70B Q4 | Ceiling, gpt-oss-120b |
|---|---|---|---|
| AMD Ryzen AI Max+ 395 | 256 GB/s | 6 tokens/s | 85 tokens/s |
| DGX Spark, Jetson Thor | 273 GB/s | 7 tokens/s | 90 tokens/s |
| Mac Studio M5 Max | 614 GB/s | 15 tokens/s | 200 tokens/s |
| Mac Studio M5 Ultra | 1.2 TB/s | 30 tokens/s | 400 tokens/s |

Measurements bear the ceilings out. ServeTheHome recorded 4.89 tokens per second for Llama 3.3 70B on a Ryzen AI Max+ 395 machine, against a ceiling of about 6, and llama.cpp reports of 52 to 56 tokens per second for gpt-oss-120b on the same chip sit under a ceiling of about 85.

Two consequences follow. Dense 70B models fit on every machine here and run slowly on most of them. Mixture-of-experts models suit unified memory, because they need the capacity and spare the bandwidth. The other half of the work, processing the prompt, is limited by compute instead of bandwidth, and there NVIDIA's chips lead:  [Phoronix](https://www.phoronix.com/review/dell-pro-max-gb10-llama-cpp) found the GB10 faster than AMD's chip on prompt processing for gpt-oss-120b, with generation speeds roughly level.

## The machines

### Apple Mac Studio, M5 Max and M5 Ultra

[Apple announced](https://www.apple.com/newsroom/2026/08/apple-introduces-new-mac-studio-with-m5-max-and-m5-ultra/) the M5 generation Mac Studio on 25 August 2026. The M5 Max takes up to 128GB at 614 GB/s, from $2,499 for the base configuration. The M5 Ultra takes up to 512GB at 1.2 TB/s, which Apple puts at 50% above the M3 Ultra, from $5,499; the 512GB configuration ships in late October. Apple claims prompt processing up to four times faster than the M3 Ultra in LM Studio, and supports clustering up to four machines over Thunderbolt 5 with RDMA.

The M5 Ultra has the most bandwidth and the most capacity of any desktop machine in this list. The constraint is the operating system. Metal, MLX and the Metal backends of llama.cpp and Ollama run only on macOS, and Docker on macOS does not expose the GPU to containers, so inference runs as native macOS processes and cannot share an image with a Linux server.

### NVIDIA DGX Spark and GB10 systems

The DGX Spark pairs a 20-core Arm CPU with a Blackwell GPU on the GB10 chip, with 128GB of LPDDR5X at 273 GB/s and ConnectX-7 200GbE networking. It runs CUDA on Arm64 Linux. Acer, ASUS, Dell, Gigabyte, HP, Lenovo and MSI sell their own GB10 machines.

Prices have risen with memory costs. The 128GB Founders Edition launched at $3,999 and now [lists at $6,950](https://www.tweaktown.com/news/113885/nvidias-new-dgx-spark-has-half-the-ram-and-costs-more-than-the-original-128gb-model-did-at-launch/index.html), and Phoronix priced Dell's 128GB GB10 machine at $6,332. A 64GB version at $4,999 is due from partners on 23 October. Two units link over a single cable to pool memory and bandwidth; NVIDIA reports up to 1.7 times the speed of one unit, short of double because of the network hop.

The case for a GB10 machine is CUDA. Most inference software targets it first, and prompt processing is faster than on the alternatives. The costs are Arm64 container images (most AI images are built for x86-64) and the bandwidth, which matches AMD's.

### AMD Ryzen AI Max+ 395 (Strix Halo)

AMD's chip pairs 16 Zen 5 cores with a 40 compute unit RDNA 3.5 GPU and 128GB of LPDDR5X-8000 on a 256-bit bus, about 256 GB/s. It is x86-64, so standard container images and Linux distributions run unchanged. ROCm and Vulkan both work for inference. On Linux, about 96 to 100GB of the pool can be given to the GPU through kernel parameters.

Several mini PCs use it. US prices for 128GB configurations in early October 2026 ran from $3,449 for the Framework Desktop (without storage, and out of stock) through $3,499 for the GMKtec EVO-X2 to $4,349 for the Beelink GTR9 Pro with dual 10GbE. AMD's own Ryzen AI Halo reference machine sells at $3,999. The Framework Desktop launched in 2025 at about $2,000 for 128GB, so these prices too have followed memory costs.

A refresh, reportedly branded Ryzen AI Max 400, is expected in the fourth quarter with the same silicon at higher clocks. The successor architecture is not expected before 2028.

### NVIDIA Jetson AGX Thor

The Jetson AGX Thor has the same 128GB and 273 GB/s as the DGX Spark in a module built for robotics and edge deployment, on Arm64 with JetPack. NVIDIA raised Jetson prices in July 2026, and the developer kit went from $3,499 to $5,499. Containers need `--runtime=nvidia` in place of `--gpus all`, and many Python packages need Arm64 builds from NVIDIA's Jetson index. It suits inference that has to run on a device in the field; for a desk, the DGX Spark offers the same memory with less friction.

### NVIDIA RTX Spark laptops and small desktops

NVIDIA's N1X chips bring the same design to Windows laptops and compact desktops, with up to 128GB of unified memory on the larger configuration. Acer, ASUS, Dell, Gigabyte, HP, Lenovo, Microsoft and MSI have announced machines for an October 2026 window. Neither prices nor memory bandwidth had been published at the time of writing, and bandwidth is the figure that will decide their value for inference.

### NVIDIA DGX Station GB300

At the top sits a different class of machine. The DGX Station pairs a B300 GPU with 252GB of HBM3e at 7.1 TB/s and a CPU with 496GB of LPDDR5X, about 750GB of coherent memory in total, drawing up to 1,600W. MSI lists its version at $85,000; other makers quote on request. It belongs in a server budget, and is included here because it shows where the design leads when bandwidth is bought with HBM.

## Summary

| Machine | Memory | Bandwidth | Price (US, October 2026) | Software |
|---|---|---|---|---|
| Mac Studio M5 Ultra | up to 512GB | 1.2 TB/s | from $5,499 | macOS only: MLX, Metal |
| Mac Studio M5 Max | up to 128GB | 614 GB/s | from $2,499 | macOS only: MLX, Metal |
| DGX Spark and GB10 systems | 64GB or 128GB | 273 GB/s | $4,999 (64GB); about $6,300 to $6,950 (128GB) | CUDA, Arm64 Linux |
| Ryzen AI Max+ 395 mini PCs | 128GB | 256 GB/s | $3,449 to $4,349 | ROCm, Vulkan, x86-64 Linux |
| Jetson AGX Thor | 128GB | 273 GB/s | $5,499 | CUDA, JetPack, Arm64 |
| RTX Spark (N1X) | up to 128GB | not published | not published | CUDA, Windows |
| DGX Station GB300 | about 750GB | 7.1 TB/s (HBM) | about $85,000 | CUDA, Linux |

Prices are moving faster than specifications. The rises at NVIDIA and among the AMD machine makers this year track the cost of memory, and any figure here should be checked against a live listing before buying.

## How to choose

We can reduce the choice to three questions, taken in order.

**Which models must fit?** Size the weights and KV cache first (the [VRAM calculator](/tools/vram-calculator.html) does the arithmetic). Up to about 100GB, every machine here qualifies. Past 128GB, the M5 Ultra is the only single desktop machine, short of clustering two GB10 units.

**Dense or mixture-of-experts?** Dense models at 70B and above need bandwidth, which points to the M5 Ultra or to discrete GPUs. Mixture-of-experts models run well on any of these machines, and the cheaper 256 GB/s options become sensible.

**Which software has to run?** If the same container must run here and in the cloud, rule out the Mac. If the stack assumes CUDA, a GB10 machine avoids porting work. If x86-64 compatibility and price matter most, the AMD machines win. A machine that holds the model but cannot run the deployment pipeline saves nothing.

Capacity is what these machines sell, and every one of them now offers enough of it for most local work. Bandwidth and software decide which one fits. (For the wider hardware and hosting decision, see [AI inference infrastructure](/library/87-inference-infrastructure.html); for what a measured local run costs to operate, see [our 14-model benchmark](/library/95-private-inference-costs.html).)
