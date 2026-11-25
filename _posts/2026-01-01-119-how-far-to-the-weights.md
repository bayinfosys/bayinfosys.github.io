---
date: 2026-11-26
layout: article
title: "How Far to the Weights? GPU Memory Latency and Bandwidth, from SRAM to SSD"
seo_title: "GPU Memory Bandwidth and Latency for LLMs: HBM, GDDR7, NVLink, SSD"
description: "Where a model's weights live sets how fast it generates. GPU latency and bandwidth from registers to hard disks, scaled to human distances and times, and the time a 70B model takes to write a 500-word answer from each tier."
keywords: ["memory bandwidth llm", "why vram matters for ai", "gpu memory latency", "hbm vs gddr7", "gddr7 vs hbm3e", "nvlink vs pcie", "infiniband for ai", "llm cpu offload speed", "llm on ssd", "latency numbers every programmer should know gpu", "tokens per second memory bandwidth"]
topic: "Infrastructure"
cta: private-inference
related:
  - 114-unified-memory-machines-2026
  - 118-why-cuda-matters
  - 78-gpu-market-2026
  - 87-inference-infrastructure
  - 95-private-inference-costs
---

# How Far to the Weights? GPU Memory Latency and Bandwidth, from SRAM to SSD

Jim Gray, the database researcher, explained storage with a map. If a CPU register is the inside of your head, the on-chip cache is this room, main memory is Sacramento, a disk is Pluto and a tape library is the Andromeda galaxy. Brendan Gregg's book *Systems Performance* makes the same point with a clock: if one CPU cycle took a second, a trip to main memory would take six minutes and a solid-state disk I/O two to six days.

Both tables were drawn for CPUs. We redraw them here for a GPU running a language model. Each tier of memory sits roughly an order of magnitude further from the GPU's cores than the previous, and that bottlenecks write performance. If we continue the analogy: GPUs are built to hide distance, but now the width of the road matters!

## The ladder

At the top sit the registers and on-chip SRAM: shared memory and L1 cache inside each streaming multiprocessor, and an L2 cache shared by the whole chip (50MB on an H100). Below them is the GPU's own memory. Data centre GPUs use HBM, DRAM stacked beside the GPU die on the same package; Blackwell Ultra's eight HBM3e stacks present an 8192-bit interface and deliver 8 TB/s.
Consumer cards use GDDR on the circuit board around the chip: the RTX 5090 runs GDDR7 over a 512-bit bus at 1.79 TB/s.
Unified memory machines such as the DGX Spark and Mac Studio share LPDDR between the CPU and GPU (covered in [our unified memory article](/library/114-unified-memory-machines-2026.html)).

Beyond the GPU's own memory, every tier is across a bus.
System RAM sits on the far side of a PCIe slot, which carries about 64 GB/s each way at PCIe 5.0 x16.
Other GPUs in the same server sit across NVLink, at 900 GB/s per GPU on Hopper and 1.8 TB/s on Blackwell.
Other servers sit across the network, InfiniBand or Ethernet with RDMA, at 800 Gb/s per port on NVIDIA's current InfiniBand.
Then storage: an NVMe SSD reads at up to about 14.8 GB/s on PCIe 5.0, a SATA SSD at about 0.55 GB/s, and a 7,200 rpm hard disk at about 0.28 GB/s.

(NVLink is an NVIDIA speciality. The RTX 3090 was the last GeForce card with an NVLink bridge; two RTX 4090s or 5090s talk over PCIe.)

## How far away is the data?

Starting with Gray's map.
The tables below use one clock cycle of an H100 at 1.755 GHz, about 0.57 ns.
Here one cycle becomes one metre.

| Operation | Latency | Distance |
|---|---|---|
| Register | 1 cycle | 1 m |
| L1 cache or shared memory | about 35 cycles | 35 m, across building |
| L2 cache | about 270 cycles | 270 m, the end of the street |
| HBM | about 660 cycles (375 ns) | 660 m |
| Another server's GPU, over InfiniBand with GPUDirect RDMA | about 2 us | 3.5 km |
| Launching a CUDA kernel | about 5 us | 9 km |
| NVMe SSD read | about 50 us | 88 km, roughly London to Cambridge |
| One token from a 70B model, at H100 bandwidth | 12 ms | 21,000 km, half-way around the world |
| Hard disk seek and rotation | about 12 ms | 21,000 km |
| Network round trip, San Francisco to London | 81 ms | 142,000 km, over a third of the way to the Moon |
| Downloading the 70B model at 100 Mb/s | 53 minutes | 5.6 billion km, about the distance to Pluto |

Gray put his disk at Pluto. A model download lands in the same place.

## If a GPU cycle took one second

Gregg's version turns the futures into human-time.

| Operation | Latency | Scaled |
|---|---|---|
| Register | 0.57 ns | 1 second |
| L1 cache or shared memory | 20 ns | 35 seconds |
| L2 cache | 155 ns | 4.5 minutes |
| HBM | 375 ns | 11 minutes |
| Another server's GPU | 2 us | 1 hour |
| Launching a CUDA kernel | 5 us | 2.4 hours |
| NVMe SSD read | 50 us | 1 day |
| One token from a 70B model on an H100 | 12 ms | 8 months |
| Hard disk seek and rotation | 12 ms | 8 months |
| Network round trip, San Francisco to London | 81 ms | 4.5 years |
| Downloading the 70B model at 100 Mb/s | 53 minutes | 178,000 years |

Launching a kernel takes longer than reading memory on a GPU in another server, which is why inference engines fuse operations into fewer kernels and record whole sequences of launches as CUDA graphs.
One token from a 70B model, on the fastest GPU most organisations can rent, takes about as long as a hard disk takes to find a sector.

## What a GPU cannot hide

A CPU core waits for each memory access.
A GPU runs tens of thousands of threads and switches between groups of them (warps) every cycle, so while one warp waits 660 cycles for HBM, others compute.
The latency in the tables above is real, and a well-written kernel can spend that time doing something else.

Bandwidth cannot be hidden that way.
Generating tokens reads every active weight once, so a dense 70B model at 4-bit quantisation moves about 40GB per token, and the speed of the tier holding those 40GB sets a ceiling on tokens per second.
Prompt processing reuses each weight across many tokens and is limited by compute, but the generation that follows is limited by the road between the weights and the cores.
(The same reasoning drives the kernels: FlashAttention, covered in [our CUDA article](/library/117-why-cuda-matters.html), exists to keep attention's intermediate results in SRAM and off the HBM bus.)

The lower tiers matter in their own ways.
NVLink sets the speed of tensor parallelism, where one model is split across several GPUs and activations cross between them for every layer of every token; over PCIe that traffic is the bottleneck.
This is most relevant for training models across servers.
The SSD sets how long a model takes to load, and how practical it is to page weights or KV cache out of memory.

## How long to write a 500-word answer

The last table puts the weights of that dense 70B model (about 40GB at 4-bit) on each tier in turn, and asks how long the model would take to write a 500-word answer - about 650 tokens.

| Weights read from | Bandwidth | Tokens per second (ceiling) | 500-word answer |
|---|---|---|---|
| B300 HBM3e | 8 TB/s | 200 | 3 seconds |
| H100 HBM3 | 3.35 TB/s | 84 | 8 seconds |
| RTX 5090 GDDR7 | 1.79 TB/s | 45 | 15 seconds |
| Mac Studio M5 Ultra, unified LPDDR5X | 1.2 TB/s | 30 | 22 seconds |
| DGX Spark, unified LPDDR5X | 273 GB/s | 6.8 | 1.6 minutes |
| Another server, over 800 Gb/s InfiniBand | 100 GB/s | 2.5 | 4.3 minutes |
| Desktop DDR5-6000, dual channel | 96 GB/s | 2.4 | 4.5 minutes |
| System RAM across PCIe 5.0 x16 | 64 GB/s | 1.6 | 7 minutes |
| PCIe 5.0 NVMe SSD | 14.8 GB/s | 0.37 | 29 minutes |
| SATA SSD | 0.55 GB/s | 0.014 | 13 hours |
| Hard disk | 0.28 GB/s | 0.007 | 25 hours |
| Gigabit Ethernet | 0.125 GB/s | 0.003 | 2.4 days |

(These are ceilings: bandwidth divided by bytes per token, ignoring the KV cache, kernel overheads and any caching between tiers.)

From the top of the table to the bottom is a factor of about 64000.
The first five rows keep the weights on the same package or board as the cores, and all five finish within two minutes.
Everything below them reads across a link to somewhere else, and stretches the answer from minutes to days.
This table describes what happens when a model does not fit a package.
(To size the weights and KV cache for a given model and context, use the [VRAM calculator](/tools/vram-calculator.html).)
