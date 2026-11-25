---
date: 2026-11-25
layout: article
title: "Why CUDA Matters: The Software Behind NVIDIA's Lock-In"
seo_title: "Why Is CUDA So Important? cuBLAS, Fortran and NVIDIA Lock-In"
description: "NVIDIA's hold on GPU computing rests on CUDA's software: libraries that copied Fortran and BLAS conventions, kernels retuned for every GPU generation, old code kept running, and one stack from a home lab card to a data centre."
keywords: ["why is cuda important", "what is cuda", "cuda lock-in", "nvidia moat", "nvidia vendor lock-in", "cuda vs rocm", "cublas", "cuda fortran", "cudnn", "flashattention hopper blackwell", "ptx forward compatibility", "cuda alternatives", "zluda", "hip vs cuda", "cuda home lab"]
topic: "Infrastructure"
cta: private-inference
related:
  - 78-gpu-market-2026
  - 114-unified-memory-machines-2026
  - 87-inference-infrastructure
  - 63-private-inference-stack
  - 70-training-commodity
---

# Why CUDA Matters: The Software Behind NVIDIA's Lock-In

This month NVIDIA marked twenty years since the GeForce 8800 GTX went on sale, on 8 November 2006. It was a $599 gaming card, and it was the first GPU that could run CUDA. Every NVIDIA GPU since has run the same programming model, and NVIDIA has spent those two decades building software on top of it.

The hardware has rivals. AMD's MI355X carries 288GB of HBM3e, and AMD's Strix Halo mini PCs hold 128GB of memory for less than the cheapest DGX Spark (both are compared in our [GPU options guide](/library/78-gpu-market-2026.html) and [unified memory article](/library/114-unified-memory-machines-2026.html)). What keeps NVIDIA's customers is maintenance: it adopts the interfaces each community of users already writes against, retunes the code underneath for every generation of hardware, and keeps old code running. The same stack runs on a gaming card and in a data centre, so work reaches every user at once.

## One stack

A developer with a used RTX 3090 installs the same driver, the same CUDA toolkit, the same PyTorch wheel and the same container toolkit as a team renting H100s. A kernel that runs on the desktop also runs on the server - assuming both devices have the same compute capability. Habits learned at home carry over too: reading an out-of-memory error, profiling a slow kernel, tuning a vLLM configuration. The DGX Spark and Jetson Thor extend the same stack to Arm64.

Scale does change a few things. Data centre parts add NVLink, ECC memory, etc. NVIDIA also separates the two markets by licence: since late 2017 the GeForce driver licence has excluded data centre deployment.

The alternatives are narrower. ROCm officially supports a short list of consumer cards, principally RDNA3 and RDNA4, and Apple's Metal stack runs only on macOS, with no data centre counterpart. Every gaming PC with an NVIDIA card is a free CUDA training environment, and NVIDIA's data centre customers hire the people with that experience.

## Working for your audience

GPU computing's first serious customers were in high-performance computing: weather, chemistry, physics, engineering simulation. Much of that code is Fortran, and it calls BLAS and LAPACK for linear algebra and FFTW for Fourier transforms. NVIDIA's libraries copied those interfaces.

[cuBLAS](https://docs.nvidia.com/cuda/cublas/) stores matrices in column-major order with 1-based indexing, for compatibility with existing Fortran environments. C and C++ are row-major, so the documentation tells C programmers to write macros to index their own arrays. cuFFT's API is modelled on FFTW, and a separate library, cuFFTW, implements the FFTW3 interface itself so that existing FFTW applications can move with few changes. For a code whose heavy lifting happens inside library calls, a first GPU port could be little more than linking against a different library.

For Fortran itself, NVIDIA bought a compiler company. It acquired the Portland Group (PGI) in July 2013. PGI had developed CUDA Fortran with NVIDIA and was a leading backer of OpenACC, which marks loops for the GPU with compiler directives. PGI's compilers became the NVIDIA HPC SDK in 2020, with `nvfortran` in place of `pgfortran`. A team with a forty-year-old Fortran code base can move its hot loops to the GPU without rewriting the program - that was a major audience of early GPU adopters.

## Tuning kernels for each generation

A matrix multiplication is a simple operation, but has thousands of implementations for different types of hardware. The algorithm speed depends on tile sizes, the kernel schedules, the split-k factors and more; the best choice changes with shared memory architecture, tensor cores, bandwidth and numerous other hardware parameters. cuBLAS ships many kernel families and chooses between them at run time; NVIDIA reports that its heuristics pick the fastest implementation 93% of the time. cuDNN does the same for convolution and attention - fundamental to modern neural networks. Each release adds paths for the newest architecture.

FlashAttention's algorithm, exact attention computed in tiles so that the full attention matrix never reaches global memory, has not changed across versions. Its implementation has been rewritten for each generation. FlashAttention-2 reached about 35% utilisation on an H100, against 80 to 90% for a well-tuned matrix multiply. [FlashAttention-3](https://arxiv.org/abs/2407.08608) was rebuilt around Hopper's asynchronous tensor cores and its Tensor Memory Accelerator and reached 75%. Blackwell then roughly doubled tensor core throughput while shared memory and the exponential units did not keep pace, so [FlashAttention-4](https://arxiv.org/abs/2603.05451) was redesigned again, reaching 1,613 TFLOPS (71% utilisation) on a B200. Its authors came from Princeton, Together AI, Meta, NVIDIA and Colfax Research, and PyTorch's FlexAttention picked it up as a backend on Hopper and Blackwell. This is an example of the depth of penetration Nvidia hardware has in research communities, and how open they are as a company to working with research organisations.

Each generation requires new tuning, which NVIDIA pays its own engineers to do. This means tuned libraries ship when hardware ships.
As the research community does its kernel work on NVIDIA hardware, often with NVIDIA engineers among the authors, and develops improvements, the hardware and software performance improves.
A rival would need to compete in both hardware and software, and then develop those professional research relationships. A major challenge.

## The driver layer

Beneath CUDA is a driver layer, which transforms application calls to direct hardware operations.
Before CUDA, NVIDIA developed a strong maintenance in the drivers they produced for each new generation of hardware.
Every draw call a game makes passes through the graphics driver, and the driver is NVIDIA's code. It recognises each game and applies a profile written for it, which can substitute tuned versions of the game's shaders, reorder or drop wasteful API calls, and work around the game's own misreadings of the specification.
NVIDIA formalised the work in its Game Ready programme in 2014, exchanging pre-release builds with studios so that the profile is ready on launch day, and by 2022 put each driver at more than 25 million lines of code.
The gains can be large: the Gamescom 2019 driver (436.02) claimed up to 23% more frames per second than its predecessor in Apex Legends, Battlefield V, Forza Horizon 4, Strange Brigade and World War Z, credited to unspecified software optimisations.

The operating system protects that privilege.
The kernel-mode half of the driver runs with full access to the machine, so 64-bit Windows has refused unsigned kernel drivers since Vista, and on a fresh installation of Windows 10 version 1607 or later with Secure Boot on, the signature must come from Microsoft.
Only NVIDIA can change the layer between a game and the GPU.
The security model that keeps malware out of the kernel also keeps out users and competitors.

This extended to features outside NVIDIAs wheelhouse: for example, OpenGL 3.1 removed features that 3.0 had marked as deprecated.
NVIDIA kept shipping drivers with nothing removed, recommended that developers create compatibility profile contexts, and stated that it had no plans to drop support for any version of OpenGL on existing or future hardware.
Engineering and visualisation software with decades-old OpenGL code kept running on each new card.
This creates a stability, reliability and longevity that is rare in computing hardware.

CUDA inherited the policy and the position.
A CUDA binary can carry two forms of each kernel: compiled machine code for specific GPUs, and PTX, an intermediate form that the driver compiles at load time for whatever GPU it finds.
PTX runs on any GPU newer than the one it targeted, so applications built with every CUDA toolkit from 2.1 to 12.8 run on Blackwell, provided they include PTX.
The window does close eventually: CUDA 13 dropped support for older GPUs.

(The Linux complaints begin here! For most of CUDA's life the kernel module was proprietary, and had to be rebuilt against every kernel update. They broke often enough to become a running joke. NVIDIA published open kernel modules in 2022. The user-space driver and CUDA itself remain closed.)

## Closing the exits

There are two ways to run CUDA code elsewhere without rewrites: translate the source and recompile, or run the compiled binaries through a translation layer.

AMD's HIP takes the first route. AMD's HIPIFY tools port code largely by renaming: `cudaMalloc` becomes `hipMalloc`, `cudaMemcpy` becomes `hipMemcpy`, and most CUDA libraries have a ROCm counterpart under a similar name. The port works, and the code base stays organised around CUDA's design, with NVIDIA still setting the interface its competitor implements.

The second route has a legal challenge. NVIDIA's terms have prohibited using translation layers to run CUDA output on other hardware since 2021, and the clause has appeared in the installed EULA since CUDA 11.6.

Comparisons between NVIDIA's hardware and its rivals' are close, and in places the rivals lead.
However, the cost of leaving CUDA is significant. Fortran code, two decades of tuned kernels, support for old binaries that still run, and in engineers who learned the ecosystem at home - these days, maybe as teenage hackers.
Twenty years of maintenance which a rival has to fund the same work for its own hardware before it can compete.

Competition is coming in specific domains. AI inference inference is one highly contested use case which we describe in our [GPU options guide](/library/78-gpu-market-2026.html).
