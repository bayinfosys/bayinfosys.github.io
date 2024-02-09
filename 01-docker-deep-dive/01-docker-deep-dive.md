# What is Docker? A Deep Dive into Containers

Docker is a technology which allows us to package software into **containers** which can more easily be distributed for use by others. Much like shipping containers revolutionised the transport of goods by standardising ships, ports, and other infrastructure; software containers have revolutionised the deployment of software.

Such an impactful technology has also had economic benefits. These are discussed in a wonderful book called [Trillions](https://www.wiley.com/en-gb/Trillions%3A+Thriving+in+the+Emerging+Information+Ecology-p-9781118176078) by Peter Lucas et al.

Since its introduction in 2013, docker has facilitied the rapid growth of cloud computing, supported the creation of new software fields (e.g., DevOps), and helped establish the software-as-a-service business model. For more history, see [here](https://en.wikipedia.org/wiki/Docker_(software)).

Since the technology is now well established, new cohorts of developers are entering the workforce every year without experiencing "life-before-docker" and, in my experience, the best ones ask "how exactly does this magical black box work?".

In this article I will demystify some of the building blocks of this transformational technology to help those interested in the technical basis have enough grounding to learn more.

The article is in three sections:
1) Foundational Linux Primitives
2) Internals of a Container
3) Deployment Considerations

## Section 1: Foundational Linux Primitives

The [Unix Philosophy](https://en.wikipedia.org/wiki/Unix_philosophy) of "do one task well" results in a competitive and productive environment which produces solid foundations for future developmonet. Container technology, and docker especially, is founded on the virtualisation tools found in the `Linux` operating system -- itself built on Unix. These tools allow containers to run far more efficiently than traditional virtual machines.

In no particular order, the interesting tools in this area are:
+ `chroot` a way to change the root directory for a process, essentially creating a "box" within which the process operates and cannot leave.
    + https://linux.die.net/man/1/chroot
    + https://en.wikipedia.org/wiki/Chroot

+ `cgroups` are mechanisms for restricing resources available to a process. Think of them like permissions for resources. This limits the effect of what happens inside our `chroot` box affecting the host.
    + https://man7.org/linux/man-pages/man7/cgroups.7.html
    + https://en.wikipedia.org/wiki/Cgroups

+ `mount points` allow other resources (host directories, devices, etc) to be placed into the box for our process to access. This allows us to share external information with our box contents.
    + https://linux.die.net/man/8/mount
    + https://en.wikipedia.org/wiki/Mount_(Unix)

It is important to understand that a container is run by the `docker` process **in** the host operating system, and that the above methods attempt to isolate whatever is in the container -- and the effect of whatever is in the container -- from the host machine.

This gives the appearence of a virtual machine, but is far more efficient. Meaning we have many, many more containers on a given system, and create and destroy the containers more rapidly.

## Escaping

Attempts to access the host from inside the container is called **escaping** and comes under [container security](https://www.oreilly.com/library/view/container-security/9781492056690/).

In general, trying to use `docker` inside a container is one of the big anti-patterns of container development because it by-passes all the security of the above methods and allows escape.


## Non-Linux Docker

Operating systmes without a Unix-like kernel (i.e., Microsoft Windows) and non-Linux Unix kernels (MacOs, Android) struggle to replicate these processes completely, and often have bespoke software to support containers (usually called something like "Docker Desktop" and dependent on technology like Hyper-V or HyperKit). These can be a little flakey, and the unfamiliar terminology and technical concepts introduce barriers to docker based development on these systems.

This can introduce blockers and issues around deployment (see Section 3), for this reason I would always encourage developers and engineers to be familiar with Linux.


## Section 2: Internals of a Container Image

We build a **container image** with a simple text file usually called `Dockerfile`. For an introduction to this process see [here](https://docs.docker.com/get-started/02_our_app/).

The file is structured something like this:

```Dockerfile
FROM alpine
RUN printf "hello, world"
CMD printf "oh, hello again!"
```

and we build it with: `docker build -t my-container -f Dockerfile .`

Which results in the image `my-container`, which we can see with the command: `docker images`.

```bash
my-container       latest        863a25f0cf31   21 seconds ago   117MB
```

Usually, we don't consider container images as files, but we can save them to a file with: `docker save my-container > my-container.tar.gz`

Our container image will be saved as a `.tar.gz` file -- also known as a **tarball**.

Typically, container images are uploaded and downloaded from **repositories** on remote services. The most popular of which is [Docker Hub](https://hub.docker.com/). However, in situations where we have no access to repositories (no network, limited space) or we want strict control of the container sources, we can distribute and load the tarballs into docker with `docker load < my-container.tar.gz`.

### Extracting the Image Contents

Now we have the tarball, we can extract the contents and find out "what exactly is in a container image?".

Go ahead and do this by running `tar xvf my-container.tar.gz`.

We find the following structure:
```
[116M]  .
├── [116M]  blobs
│   └── [116M]  sha256
│       ├── [2.5K]  135bb0fcb4f944bae370a55f12d9c7777b56e2b690cacc763077e1fc174f1012
│       ├── [116M]  1777ac7d307bcbda4fe79323a921eda8d39d97513677ecda31b82244e7876520
│       ├── [ 602]  18b6ee1f675a3beee9ec0533ab7bd0e3fcddff2244fc241994cde7f3aa49b104
│       ├── [ 901]  2f61bb9c5de1b14edd9d11bc3b8fd89e898c8e3d8fed4acadd2fdb709a25d1a7
│       ├── [1.0K]  863a25f0cf310d480f006234b85b7f060c88d36ca6a91e1ec88d354b52386995
│       └── [ 406]  c72a86403e052f241fc416e66531275817de915dfd61196e9492413106e55c83
├── [ 417]  index.json
├── [ 769]  manifest.json
├── [  31]  oci-layout
└── [  95]  repositories
```

There are a bunch of files in the root of the archive (`index.json`, etc) and a bunch of large binary chunks under `./blobs/sha256`. These blobs are also `tar` files which can be extracted. The format of container images is an [open specification](https://github.com/opencontainers/image-spec).

### Exploring the manifest

Let's open `manifest.json` and see what we have:
```
[
  {
    "Config": "blobs/sha256/863a25f0cf310d480f006234b85b7f060c88d36ca6a91e1ec88d354b52386995",
    "RepoTags": [
      "my-container:latest"
    ],
    "Layers": [
      "blobs/sha256/1777ac7d307bcbda4fe79323a921eda8d39d97513677ecda31b82244e7876520",
      "blobs/sha256/135bb0fcb4f944bae370a55f12d9c7777b56e2b690cacc763077e1fc174f1012"
    ],
    "LayerSources": {
      "sha256:135bb0fcb4f944bae370a55f12d9c7777b56e2b690cacc763077e1fc174f1012": {
        "mediaType": "application/vnd.oci.image.layer.v1.tar",
        "size": 2560,
        "digest": "sha256:135bb0fcb4f944bae370a55f12d9c7777b56e2b690cacc763077e1fc174f1012"
      },
      "sha256:1777ac7d307bcbda4fe79323a921eda8d39d97513677ecda31b82244e7876520": {
        "mediaType": "application/vnd.oci.image.layer.v1.tar",
        "size": 121345536,
        "digest": "sha256:1777ac7d307bcbda4fe79323a921eda8d39d97513677ecda31b82244e7876520"
      }
    }
  }
]
```

This a `json` document describing the contents of the `blobs/sha256/` directory. The `LayerSources` field relates to the blobs directory and associates values to verify the contents.

The ability to create, share, cache, and compose layers securely is a very powerful feature.

### Exploring the Config

Let's look into the `Config` blob:
```
{
  "architecture": "amd64",
  "config": {
    "Env": [
      "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
    ],
    "Cmd": [
      "/bin/sh",
      "-c",
      "printf 'hello again!'"
    ],
    "ArgsEscaped": true,
    "OnBuild": null
  },
  "created": "2024-02-08T03:25:58.44798869Z",
  "history": [
    {
      "created": "2023-11-01T00:20:37.698234788Z",
      "created_by": "/bin/sh -c #(nop) ADD file:3e9b6405f11dd24ce62105c033f1d8b931d9409298553f63b03af1b6dd1dda35 in / "
    },
    {
      "created": "2023-11-01T00:20:38.103083542Z",
      "created_by": "/bin/sh -c #(nop)  CMD [\"bash\"]",
      "empty_layer": true
    },
    {
      "created": "2024-02-08T03:25:58.44798869Z",
      "created_by": "RUN /bin/sh -c printf 'hello world!' > run-output.txt # buildkit",
      "comment": "buildkit.dockerfile.v0"
    },
    {
      "created": "2024-02-08T03:25:58.44798869Z",
      "created_by": "CMD [\"/bin/sh\" \"-c\" \"printf 'hello again!'\"]",
      "comment": "buildkit.dockerfile.v0",
      "empty_layer": true
    }
  ],
  "os": "linux",
  "rootfs": {
    "type": "layers",
    "diff_ids": [
      "sha256:1777ac7d307bcbda4fe79323a921eda8d39d97513677ecda31b82244e7876520",
      "sha256:135bb0fcb4f944bae370a55f12d9c7777b56e2b690cacc763077e1fc174f1012"
    ]
  }
}
```

This is a history of the comands used to build the image described by our `Dockerfile` and a bunch of other things (some of which can be seen by running `docker inspect` on the image).

__Note__: we are able to see the exact command executed by our `RUN printf` statement. A common information security failure is to use secret keys in a `Dockerfile`. These keys then remain visible **even if they are not written to the container**. Removing secrets is a process called `scrubbing`. If you need to scrub a container, reconsider your process.

These commands can also be observed by running :`docker history my-container`
```
IMAGE          CREATED        CREATED BY                                      SIZE      COMMENT
863a25f0cf31   10 hours ago   CMD ["/bin/sh" "-c" "printf 'hello again!'"]    0B        buildkit.dockerfile.v0
<missing>      10 hours ago   RUN /bin/sh -c printf 'hello world!' > run-o…   12B       buildkit.dockerfile.v0
<missing>      3 months ago   /bin/sh -c #(nop)  CMD ["bash"]                 0B        
<missing>      3 months ago   /bin/sh -c #(nop) ADD file:3e9b6405f11dd24ce…   117MB 
```

### Exploring the Layers

The `Layers` field is a list of the of "disk images" which are mapped onto our `chroot` box (Section 1). These are always mapped in order so that they "build up" the disk image described by the `Dockerfile`, using a process called [union mounting](https://en.wikipedia.org/wiki/Union_mount). Hence, later commands will overwrite the output of previous commands in the running container. __Note__: both outputs will be present in the image, but only the last layer will be visible in the running container.

In this example you can see the first layer (1777) is ~116Mb -- a decent size and probably contains all the operating system data; the second layer (135b) is far smaller.

We can print this to stdout with `cat blobs/sha256/135bb0fcb4f944bae370a55f12d9c7777b56e2b690cacc763077e1fc174f1012`:
```
etc/0000755000000000000000000000000014561044704010024 5ustar0000000000000000run-output.txt0000644000000000000000000000001414561044704012147 0ustar0000000000000000hello world!
```

which is an uncompressed `tar` file representing the changes applied to the base image by our `RUN` command.

We can extract this with: `tar xvf blobs/sha256/135bb0fcb4f944bae370a55f12d9c7777b56e2b690cacc763077e1fc174f1012 -C .`

and observe the tree structure:
```
.
├── etc
└── run-output.txt
```

and the file contents: `cat run-output.txt`
```
hello world!
```

Hurray! That was probably the longest way to get that file out of the container image!

On extracting the 116Mb layer, you will find the base `debian` operating system provided by the image in the `FROM` statement at the top of the `Dockerfile`.

I will leave it to you to explore more container images in this way. You might be suprised what secrets people leave in their containers!


# Section 3: Deployment Considerations

Docker has had a massive impact on software distribution and replication. It has made huge contributions to the viability of cloud service providers, software houses to build and deploy to "the cloud", and for these systems to scale as people use them.

However, when deploying containers, there are a few things to bear in mind.

## Platform differences

Docker interacts differently with macOS, Windows, and Linux. Typically, cloud providers use linux based host machines for docker containers. Images built on [MacOs](https://pythonspeed.com/articles/docker-build-problems-mac/) and Windows cannot be deployed directly to cloud systems without some configuration.

These issues are generally related to underlying hardware and also affect, Raspberry Pi, NVidia Jetson, and so on. If you're lucky, you may be able to rebuild the image, but it can be a challenge.

__Avoid these conflicts by building your containers via a `CI/CD` process in hosted environment such as [GitHub](https://docs.docker.com/build/ci/github-actions/), [Gitlab](https://docs.gitlab.com/ee/user/packages/container_registry/build_and_push_images.html) or something similar.__

## AWS Lambda, Kubernetes, and all that

Once your container is setup and deployed to a cloud environment, the cloud will usually provision host environments to run the container.

There are minor differences between each of the providers and little quirks to each service. Generally, they will all limit the memory and CPU resources of the containers. Additionally, services may prevent write operations, network access, etc. These constraints can nearly always be replicated on your local machine by parameters to the `docker run` command.

For example, to run our container as it would on `AWS Lambda`: set the filesystem to readonly, mount a single writable `/tmp` directory, and limit the cpu and memory availability; we can use this command:
```
docker run -it --rm --read-only --tmpfs --cpus="0.5" --memory 300m my-container
```

There are many options for using `docker` to "stress" your software in a container in the [docs](https://docs.docker.com/config/containers/resource_constraints/).

__Replicating these issues are useful for testing and debugging cloud software.__

 ## Logging
 
 Logged data allows us to discover and review:
 + exact moments transactions failed, weeks after the event
 + provide the data to replicate the issue, and
 + support us with testing and validating fixes.
 
 Many providers capture the `stdout` (i.e., anything that goes to the screen!) as logs associated with the execution of your container. By using [structured logging](https://www.structlog.org/) and including **context** around the logged events (variable values, program state, etc.) the output of your software -- running remotely at scale -- will be a useful source of insight.

  for example, a plaintext log entry might look like:
 ```
 Error: Database connection failed at 3:45 PM on 2024-02-08
 ```

 whereas the corresponding structured log would be formatted:
 ```
 {
  "timestamp": "2024-02-08T15:45:00Z",
  "level": "error",
  "message": "Database connection failed",
  "context": {
    "service": "user-service",
    "operation": "database-connect",
    "retryAttempt": "3",
    "errorCode": "DB_CONN_FAIL"
  }
}
```

There is a large range of tools for ingesting, processing, and monitoring the data from those logs. It is so large there are actual deployment stacks around this process: `ELK` is Elasti-cache, LogStore and Kibana, which handle ingest, transformation, storage, and dashboarding of the (potentially large) volumes of data. Other tools include Prometheus, and Grafana.

Log data can contain sensitive information and grow quickly, so remember to consider security and storage costs.

__Having a strategy for logging data in our code, ingesting it on execution, and processing it for insight is a good idea.__


# Conclusion

This article has described (1) the main Linux tools used to create docker, (2) the contents and format of container images, and (3) touched on deployment of images on cloud providers; hopefully we have demystified the black-box which powers much of software development. At the very least, you should have new terms to research!

In future articles, I will discuss machine learning model deployment, and logging in more detail, so be sure to check back for these!

If you are a business interested in this technology, please get in touch to discuss further.

Thank you for reading this far! I know it's a long article with a lot of detail!