---
layout:         post
title:          "Install Spark JobServer on AWS EMR"
tags:           linux aws
date:           2018-05-23 16:00:00 GMT
keywords:
---

Few days ago I had to install and run [Spark JobServer](https://github.com/spark-jobserver/spark-jobserver) on a Amazon EMR cluster.

Spark JobServer is not among the list of applications natively supported by EMR, so googled a bit and I've found instructions [here](https://aws.amazon.com/blogs/big-data/installing-and-running-jobserver-for-apache-spark-on-amazon-emr/) and [here](https://github.com/spark-jobserver/spark-jobserver/blob/master/doc/EMR.md). Unfortunately they are a bit outdated and I run into multiple issues while following the tutorials. In this post I will share how I solved it.

I assume you already have a running EMR cluster, and I will focus exclusively on how to run Spark JobServer on top of it. The procedure is:

1. Compile Spark JobServer against your version of Spark (depends on the EMR release you're using)
2. Package the compiled Spark JobServer along with your config in a `.tar.gz`
3. Install the package on a EMR master node


## Compile and Package Spark JobServer

To ease the compilation and make it easily reproduceable, I compiled it with Docker. The following `Dockerfile` compiles Spark JobServer `0.8.0` against Spark `2.3.0` to run on `emr-5.13.0` (the latest EMR release available as of today). In order to work correctly, it needs three files:

- `config/emr-5.13.0.conf`: adjust it according to the config you need
- `config/emr-5.13.0.sh`: defaults should be good
- `config/shiro.ini`

To run it - that is, to compile and package Spark JobServer - you have to build the Docker image from the folder where the `Dockerfile` is located:

```
docker build -t spark-jobserver-compile -f Dockerfile .
```

Once the `docker build` completes, you will have two artifacts **inside the Docker image**:

- `/tmp/job-server/spark-job-server-0.8.0-emr-5.13.0.tar.gz`
- `/tmp/job-server/spark-job-server-tests-0.8.0.jar`

You can extract them from the Docker image running the `cp` command with a shared volume. For example:

```
mkdir output
docker run --rm -v "./output:/mnt" spark-jobserver-compile bash -c 'cp /tmp/job-server/spark-job-server-*-emr-*.tar.gz /tmp/job-server/spark-job-server-tests-*.jar /mnt'
```

<script src="https://gist.github.com/pracucci/3ce7e162ad640dada72c5c20d95b781e.js"></script>


## Install the package on EMR master node

To install the package on the EMR master node you have to transfer it to the EMR master node instance, unpack it and start the JobServer. I do:

- Upload the package to S3
- Upload an installation script to S3
- Add an EMR Bootstrap Action to install via the installation script
- Add an EMR Step to start the Spark JobServer (we can't do it in the bootstrap action because it's executed **before** EMR installs other applications on the nodes)


### Add an EMR Bootstrap Action to install the package

I store the following script - called `spark-job-server-bootstrap.sh` - on S3, in a bucket we're going to call `BUCKET` in our example. The script downloads the package from S3, uncompress it in the right location and creates a shutdown action to stop Spark JobServer on node shutdown.

<script src="https://gist.github.com/pracucci/21e2fed8037ed20e9e939effbae1115a.js"></script>


To run it in bootstrap action during the EMR cluster creation:

```
aws emr create-cluster --bootstrap-actions Path=s3://BUCKET/spark-job-server-bootstrap.sh,Args=[]
```


### Add an EMR Step to start the Spark JobServer

Starting the Spark JobServer is easy. You've just to run the `/mnt/lib/spark-jobserver/server_start.sh` installed by `spark-job-server-bootstrap.sh` as part of the bootstrap action. However, we wanna do it automatically once the cluster is Ready, so we add an EMR Step at cluster creation time:

```
aws emr create-cluster --bootstrap-actions Path=s3://BUCKET/spark-job-server-bootstrap.sh,Args=[] --steps Type="CUSTOM_JAR",Name="Start Spark JobServer",Jar="command-runner.jar",Args=["/bin/bash","-c","'if [ -e /mnt/lib/spark-jobserver/server_start.sh ]; then cd /mnt/lib/spark-jobserver && ./server_start.sh; fi'"],ActionOnFailure="TERMINATE_CLUSTER"
```

_Please note that we can't run Spark JobServer in `spark-job-server-bootstrap.sh` because when the bootstrap action is called EMR hasn't installed the applications yet (ie. Spark) and so Spark JobServer dependencies will still be missing. On the contrary, the EMR step is executed once the bootstrap has completed (including the native applications) and the cluster is Ready to run jobs._


## How to test Spark JobServer?

The building phase above has generated also `spark-job-server-tests-0.8.0.jar`. We can use it to run a simple `WordCount` job on our Spark JobServer. To do it, we have to:

- Upload the tests JAR to Spark JobServer
- Create a test context
- Run the `WordCount` job

Set the `EMR_MASTER_IP` environment variable to the EMR master node IP and make sure the port `8090` (Spark JobServer) is reacheable from your client (do not open it publicly on the internet).

Then:

```
# Upload a JAR
curl --data-binary @spark-job-server-tests-0.8.0.jar http://$EMR_MASTER_IP:8090/jars/testapp
curl http://$EMR_MASTER_IP:8090/jars

# Create context
curl -d "" "$EMR_MASTER_IP:8090/contexts/test?num-cpu-cores=1&memory-per-node=512m&spark.executor.instances=1"
curl http://$EMR_MASTER_IP:8090/contexts

# Run WordCount example
curl -d "input.string = a b c a b see" "$EMR_MASTER_IP:8090/jobs?appName=testapp&classPath=spark.jobserver.WordCountExample&context=test&sync=true"
```
