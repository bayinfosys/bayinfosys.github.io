---
date: 2026-10-19
layout: article
title: "Unified Memory Machines for Local AI: DGX Spark, Strix Halo, Mac Studio and Jetson Thor (Late 2026)"
seo_title: "Unified Memory for Local LLMs: DGX Spark vs Strix Halo vs Mac Studio M5 (2026)"
description: "Unified memory machines hold 64GB to 512GB of model weights in one box, and memory bandwidth decides how fast they generate. DGX Spark, AMD Strix Halo and Gorgon Halo, Mac Studio M5, Jetson Thor and RTX Spark compared on capacity, bandwidth, price and what it takes to run containers on each."
keywords: ["unified memory llm", "dgx spark alternative", "dgx spark 64gb", "strix halo llm", "ryzen ai max 395 llm", "ryzen ai max pro 495", "mac studio m5 ultra llm", "m5 ultra 512gb", "apple silicon vs gpu for ai inference", "docker gpu macos", "jetson agx thor llm", "local llm 128gb", "memory bandwidth tokens per second", "rtx spark n1x"]
topic: "Infrastructure"
last_modified_at: 2026-10-31
related:
  - 87-inference-infrastructure
  - 78-gpu-market-2026
  - 95-private-inference-costs
  - 40-private-inference
  - 63-private-inference-stack
---

# Unified Memory Machines for Local AI: DGX Spark, Strix Halo, Mac Studio and Jetson Thor (Late 2026)

A discrete GPU keeps model weights in its own memory, and no consumer card holds more than 32GB. A unified memory machine shares one large pool between CPU and GPU, so a desktop box can hold 64GB to 512GB of weights. That has made these machines a category of their own for local inference, alongside the cards covered in our [GPU options guide](/library/78-gpu-market-2026.html) (the wider hosting and hardware decision is in [AI inference infrastructure](/library/87-inference-infrastructure.html)).

Capacity decides which models fit. Bandwidth decides how fast they run, and the operating system decides how much work it takes to run a server stack on them. We set out the arithmetic that connects capacity and bandwidth, list the machines available at the end of October 2026, cover what it takes to run containers on each, and finish with a way to choose between them.

## Capacity, bandwidth and tokens per second

Generating each token of output reads every active weight from memory once. Memory bandwidth divided by the bytes read per token therefore sets a ceiling on generation speed. (The ceiling ignores the KV cache and other overheads; measured speeds land somewhat below it.)

A dense 70B model at 4-bit quantisation reads about 40GB per token. A mixture-of-experts model reads only its active experts: gpt-oss-120b holds about 64GB of weights but activates roughly 5B parameters per token, about 3GB.

| Machine | Bandwidth | Ceiling, dense 70B Q4 | Ceiling, gpt-oss-120b |
|---|---|---|---|
| AMD Ryzen AI Max+ 395 and PRO 495 | 256 GB/s | 6 tokens/s | 85 tokens/s |
| DGX Spark, Jetson Thor | 273 GB/s | 7 tokens/s | 90 tokens/s |
| RTX Spark (N1X) | about 300 GB/s | 7 tokens/s | 100 tokens/s |
| Mac Studio M5 Max | 614 GB/s | 15 tokens/s | 200 tokens/s |
| Mac Studio M5 Ultra | 1.2 TB/s | 30 tokens/s | 400 tokens/s |

Measurements bear the ceilings out. ServeTheHome recorded 4.89 tokens per second for Llama 3.3 70B on a Ryzen AI Max+ 395 machine, against a ceiling of about 6, and llama.cpp reports of 52 to 56 tokens per second for gpt-oss-120b on the same chip sit under a ceiling of about 85. MacStories measured 48 tokens per second on the M5 Ultra for a dense 27B model at about 4 bits, against a ceiling near 75. (No dense 70B measurement on the M5 Ultra had been published at the time of writing. Figures well above a machine's ceiling usually mean a mixture-of-experts model, a smaller quantisation or speculative decoding.)

Two consequences follow. Dense 70B models fit on every machine here and run slowly on most of them. Mixture-of-experts models suit unified memory, because they need the capacity and spare the bandwidth.

The other half of the work, processing the prompt, is limited by compute, and there discrete GPUs keep a clear lead. On a 6,091-token prompt to the same 27B model, MacStories measured prompt processing at 3,031 tokens per second on an RTX 5090, 1,701 on the M5 Ultra and 414 on the M3 Ultra. (The Macs ran MLX and the PC a GGUF Q4_K_M build, so the quantisations differ.) Among the cheaper machines, Phoronix found the GB10 faster than AMD's chip on prompt processing for gpt-oss-120b, with generation speeds roughly level. For long prompts, such as retrieval over documents or a coding agent reading a repository, prompt processing decides how long the user waits for the first token.

## The machines

### Apple Mac Studio, M5 Max and M5 Ultra

Apple announced the M5 generation Mac Studio on 25 August 2026 and discontinued the M3 Ultra the same day. The M5 Max takes up to 128GB at 614 GB/s, from $2,499 for the base configuration. The M5 Ultra takes up to 512GB at 1.2 TB/s, which Apple puts at 50% above the M3 Ultra. In the US it starts at $6,799 with the 36-core CPU and 80-core GPU, and the 512GB option adds $15,500, for $22,299 in total; orders for that configuration opened in late October. Apple supports clustering up to four machines over Thunderbolt 5 with RDMA.

The M5 Ultra has the most bandwidth and the most capacity of any desktop machine in this list, and the fastest prompt processing outside a discrete GPU. Its constraint is the operating system, covered under containers below.

### NVIDIA DGX Spark and GB10 systems

The DGX Spark pairs a 20-core Arm CPU with a Blackwell GPU on the GB10 chip, with 128GB of LPDDR5X at 273 GB/s and ConnectX-7 200GbE networking. It runs CUDA on Arm64 Linux. Acer, ASUS, Dell, Gigabyte, HP, Lenovo and MSI sell their own GB10 machines.

Prices have risen with memory costs. The 128GB Founders Edition launched at $3,999 and now lists at about $6,950, and Phoronix priced Dell's 128GB GB10 machine at $6,332. A 64GB version went on sale on 23 October from $4,999 through Acer, ASUS, Dell, Gigabyte, HP and MSI. Two units link over a single cable to pool memory and bandwidth; NVIDIA reports up to 1.7 times the speed of one unit, short of double because of the network hop, and puts a pair of 64GB units at about $8,000.

The case for a GB10 machine is CUDA. Most inference software targets it first, and prompt processing is faster than on AMD's chip. The costs are Arm64 container images (most AI images are built for x86-64) and the bandwidth, which matches AMD's.

### AMD Ryzen AI Max+ 395 (Strix Halo) and PRO 495 (Gorgon Halo)

AMD's chip pairs 16 Zen 5 cores with a 40 compute unit RDNA 3.5 GPU and 128GB of LPDDR5X-8000 on a 256-bit bus, about 256 GB/s. It is x86-64, so standard container images and Linux distributions run unchanged. ROCm and Vulkan both work for inference. On Linux, about 96 to 100GB of the 128GB pool can be given to the GPU through kernel parameters.

Several mini PCs use it. US prices for 128GB configurations in early October 2026 ran from $3,449 for the Framework Desktop (without storage, and out of stock) through $3,499 for the GMKtec EVO-X2 to $4,349 for the Beelink GTR9 Pro with dual 10GbE. AMD's own Ryzen AI Halo reference machine sells at $3,999. The Framework Desktop launched in 2025 at about $2,000 for 128GB, so these prices too have followed memory costs.

The refresh, the Ryzen AI Max+ PRO 495 (codenamed Gorgon Halo), keeps the same CPU, GPU and memory speed, so bandwidth is unchanged. What it adds is capacity: 192GB configurations such as the GMKtec EVO-X5 Pro at $6,399 and the Minisforum MS-S1 MAX-P495 (under $7,400 on preorder), alongside 128GB machines such as iBuyPower's at $3,999, due in the fourth quarter.

### NVIDIA Jetson AGX Thor

The Jetson AGX Thor has the same 128GB and 273 GB/s as the DGX Spark in a module built for robotics and edge deployment, on Arm64 with JetPack. NVIDIA raised Jetson prices in July 2026, and the developer kit went from $3,499 to $5,499. Containers need `--runtime=nvidia` in place of `--gpus all`, and many Python packages need Arm64 builds from NVIDIA's Jetson index. It suits inference that has to run on a device in the field; for a desk, the DGX Spark offers the same memory with less friction.

### NVIDIA RTX Spark laptops and small desktops

NVIDIA's N1X brings the same design to Windows laptops and compact desktops, with up to 128GB of LPDDR5X on a 256-bit bus (about 300 GB/s in theory) and up to 96GB allocatable to the GPU. Laptops are shipping: StorageReview's Surface Laptop Ultra with 128GB costs $5,899.99 and ran a 35B mixture-of-experts coding model at 89 tokens per second. Compact desktops are announced for autumn 2026 without prices. A laptop is a portable development machine for these models more than a server, and the review unit cut power under sustained all-core load.

### NVIDIA DGX Station GB300

At the top sits a different class of machine. The DGX Station pairs a B300 GPU with 252GB of HBM3e at 7.1 TB/s and a CPU with 496GB of LPDDR5X, about 750GB of coherent memory in total, drawing up to 1,600W. MSI lists its version at $85,000; other makers quote on request. It belongs in a server budget, and is included here because it shows where the design leads when bandwidth is bought with HBM.

## Running containers on each machine

Most server inference stacks ship as Linux containers, and the machines differ most in what it takes to run one with access to the GPU.

**GB10 machines and Jetson Thor** run CUDA containers through the NVIDIA container toolkit, as a discrete GPU server does. The images must be built for `linux/arm64`, and on Thor the runtime flag changes as described above.

**AMD machines** run x86-64 images unchanged. GPU access through ROCm needs the container to see `/dev/kfd` and `/dev/dri`, with its user in the `video` and `render` groups, and a ROCm release that supports the chip's GPU (gfx1151; check the release notes). Vulkan builds of llama.cpp avoid ROCm altogether.

**The Mac** is the awkward case. Every container runtime on macOS (Docker Desktop, Podman, OrbStack, Lima) runs a Linux virtual machine, and Linux has no Metal, so MLX and PyTorch's Metal backend are unavailable inside a container. There are three ways round it.

- **Run the model server natively, beside the containers.** Docker's own Model Runner does this for vllm-metal: it ships the backend as an image, then extracts it and runs it as a macOS process, because containers have no Metal passthrough. The rest of a stack (database, API, cache) can stay in Compose, with model files on a host path.
- **Pass the GPU into a Podman VM with libkrun.** The Vulkan route reaches about 75 to 80% of native Metal speed for llama.cpp. Red Hat's newer API-remoting preview forwards llama.cpp's calls to Metal at close to native speed, with the caveats of a preview: llama.cpp only, one container at a time, and weaker isolation between guest and host. PyTorch and diffusers have no route in either case.
- **Run everything natively**, with the database from Homebrew and no containers. This works and diverges furthest from a Linux server deployment.

macOS also caps the memory the GPU may wire at roughly 75% of RAM by default. `sudo sysctl iogpu.wired_limit_mb=<megabytes>` raises the limit until the next reboot.

## Summary

| Machine | Memory | Bandwidth | Price (US, October 2026) | Software |
|---|---|---|---|---|
| Mac Studio M5 Ultra | up to 512GB | 1.2 TB/s | from $6,799; $22,299 with 512GB | macOS: MLX, Metal; containers without GPU |
| Mac Studio M5 Max | up to 128GB | 614 GB/s | from $2,499 | macOS: MLX, Metal; containers without GPU |
| DGX Spark and GB10 systems | 64GB or 128GB | 273 GB/s | from $4,999 (64GB); about $6,300 to $6,950 (128GB) | CUDA, Arm64 Linux |
| Ryzen AI Max+ 395 mini PCs | 128GB | 256 GB/s | $3,449 to $4,349 | ROCm, Vulkan, x86-64 Linux |
| Ryzen AI Max+ PRO 495 mini PCs | 128GB or 192GB | 256 GB/s | $3,999 (128GB); $6,399 and up (192GB) | ROCm, Vulkan, x86-64 Linux |
| Jetson AGX Thor | 128GB | 273 GB/s | $5,499 | CUDA, JetPack, Arm64 |
| RTX Spark (N1X) | up to 128GB | about 300 GB/s | $5,899.99 (Surface Laptop Ultra, 128GB) | CUDA, Windows on Arm |
| DGX Station GB300 | about 750GB | 7.1 TB/s (HBM) | about $85,000 | CUDA, Linux |

Prices are moving faster than specifications. The rises at NVIDIA, Apple and the AMD machine makers this year track the cost of memory, and any figure here should be checked against a live listing before buying.

## How to choose

We can reduce the choice to three questions, taken in order.

**Which models must fit?** Size the weights and KV cache first (the [VRAM calculator](/tools/vram-calculator.html) does the arithmetic). Up to about 100GB, every machine here qualifies apart from the 64GB Spark. Past 128GB, the single-box options are the 192GB AMD machines and the M5 Ultra, short of clustering two GB10 units.

**Dense or mixture-of-experts?** Dense models at 70B and above need bandwidth, which points to the M5 Ultra or to discrete GPUs. Mixture-of-experts models run well on any of these machines, and the cheaper 256 GB/s options become sensible. Long prompts add compute to the requirement, which favours the M5 Ultra and the GB10 over AMD.

**Which software has to run?** If the same containers must run here and in the cloud, a GB10 machine runs them with an Arm64 build and an AMD machine runs them unchanged. On a Mac, the model server runs as a native process beside the containers, or llama.cpp alone runs inside one through Podman. A machine that holds the model but cannot run the deployment pipeline saves nothing.

Capacity is what these machines sell, and every one of them now offers enough of it for most local work. Bandwidth and software decide which one fits. (For what a measured local run costs to operate, see [our 14-model benchmark](/library/95-private-inference-costs.html).)
