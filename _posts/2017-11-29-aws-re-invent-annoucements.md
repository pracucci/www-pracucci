---
layout:         post
title:          "AWS re:invent 2017 annoucements"
tags:           aws kubernetes
date:           2017-11-29 17:00:00 GMT
keywords:
---

A straight-to-the-point recap of all the new services and improvements announced during the AWS re:invent 2017.


## EC2 Instances

### New family of instances launched

- `M5` - new generation of general purpose instances
- `H1` - big data optimized instances
- `I3.metal` - bare metal high I/O


**`M5` instances** ([announcement](https://aws.amazon.com/blogs/aws/m5-the-next-generation-of-general-purpose-ec2-instances/))
- EBS only, VPC-only, HVM-only, and EBS-Optimized
- Phisical processor based on Intel Xeon Platinum 2.5Ghz (`M4` family is based on Zeon 2.4Ghz)
- 14% better price/performance than the M4 instances on a per-core basis

| Instance Name | vCPUs | RAM  | Networking    | EBS-Optimized Bandwidth | On-Demand pricing `us-east-1` |
| ------------- | ----- | ---- | ------------- | ----------------------- | ----------------------------- |
| m5.large      | 2     | 8G   | Up to 10 Gbps | Up to 2120 Mbps         | $0.096 / hour                 |
| m5.xlarge     | 4     | 16G  | Up to 10 Gbps | Up to 2120 Mbps         | $0.192 / hour                 |
| m5.2xlarge    | 8     | 32G  | Up to 10 Gbps | Up to 2120 Mbps         | $0.384 / hour                 |
| m5.4xlarge    | 16    | 64G  | Up to 10 Gbps | 2120 Mbps               | $0.768 / hour                 |
| m5.12xlarge   | 48    | 192G | 10 Gbps       | 5000 Mbps               | $2.304 / hour                 |
| m5.24xlarge   | 96    | 384G | 25 Gbps       | 10000 Mbps              | $4.608 / hour                 |

**`H1` instances** ([announcement](https://aws.amazon.com/blogs/aws/new-h1-instances-fast-dense-storage-for-big-data-applications/))
- Features large amount of magnetic storage from 1 up to 8 x 2TB HDD

**`I3.metal`** ([announcement](https://aws.amazon.com/blogs/aws/new-amazon-ec2-bare-metal-instances-with-direct-access-to-hardware/))
- 2x Intel Xeon E5-2686 v4 processors running at 2.3 GHz, with a total of 36 hyperthreaded cores (72 logical processors)
- 512 GiB memory
- 15.2 TB SSD-based storage
- 25 Gbps networking
- Now in preview


### Spot instances ([announcement](https://aws.amazon.com/blogs/aws/amazon-ec2-update-streamlined-access-to-spot-capacity-smooth-price-changes-instance-hibernation/))

**Smoother Price Changes**

Spot prices change are moving to a model where prices adjust more gradually, based on longer-term trends in supply and demand.

**New Streamlined Access**

It's now possible to turn on spot instances via `RunInstances` API, immediately getting an instance ID, with no more need to poll an API to check if the spot request has been processed and accepted.

**Instance Hibernation**

Spot instances now support instance hibernation, where the in-memory state is written to the root EBS volume of the instance. The private IP address is also preserved across stop/start cycles.


[![](https://www.awsgeek.com/images/amazon-ec2-spot-instances.jpg)](https://www.awsgeek.com/images/amazon-ec2-spot-instances.jpg)
_Courtesy of [awsgeek.com](https://www.awsgeek.com/posts/amazon-ec2-spot-instances/)._


## Containers and Kubernetes

### [EKS: Elastic Container Service for Kubernetes](https://aws.amazon.com/eks/) ([announcement](https://aws.amazon.com/blogs/aws/amazon-elastic-container-service-for-kubernetes/))

- EKS manages only masters for you - you've manage nodes by yourself and have them join the cluster.
- EKS will vertically scale masters - in a rolling update to honor HA - based on load and number of nodes
- EKS is not a K8S fork and supports the latest version. The user specifies the minor version (ie. 1.x) and EKS manages upgrades to patch level. Automatic upgrades across minor versions (ie. 1.7 to 1.8) is also possibile. EKS will support the latest 3 minor versions and notify when a version is deprecated.
- EKS supports bith Horizontal Pod Autoscaler (HPA) and nodes autoscaler out of the box
- Integrated with CloudTrail, CloudWatch Logs, VPC, IAM (partnered with Heptio), PrivateLink. You can assign **RBAC** roles directly to each **IAM** entity. You can also use PrivateLink if you want to access your Kubernetes masters directly from your own Amazon VPC. With PrivateLink, your Kubernetes masters and the Amazon EKS service endpoint appear as an elastic network interface with private IP addresses in your Amazon VPC.
- Uses Project Calico from Tigera to manage network policies
- Supports Kubernetes add-ons, running on master. Currently K8S dashboard and KubeDNS, but will support more add-ons in future
- AWS built a CNI plugin to add **native VPC networking for pods** and open sourced it at [amazon-vpc-cni-k8s](https://github.com/aws/amazon-vpc-cni-k8s/)
- Coming: AWS will release EKS optimized AMI based on Amazon Linux and built with packer
- Coming: EKS will manage nodes too in the future, but they focus on master right now
- Now in preview

![](https://media.amazonwebservices.com/blog/2017/eks_s1_sushi_donut_1.png)



### [AWS Fargate](https://aws.amazon.com/fargate/) ([announcement](https://aws.amazon.com/blogs/compute/aws-fargate-a-product-overview/))

- Run containers without managing servers or clusters
- No clusters to manage
- Manages underlying infrastructure
- Apparently similar to [Azure Container Instances](https://azure.microsoft.com/en-us/services/container-instances/)
- Each task running with Fargate can get its own ENI
- Coming: AWS Fargate support for Amazon EKS will be available in 2018
- Generally available

Resources:

- [Securing Struts in AWS Fargate](https://blog.aquasec.com/securing-struts-in-aws-fargate)

![](https://pbs.twimg.com/media/DP1xgrmUQAAL_Og.jpg)



## Database

### [Aurora Multi-Master](https://aws.amazon.com/rds/aurora/) (single-region)

- Scale out read and writes
- Multi-region coming in 2018
- Now in [preview](https://pages.awscloud.com/amazon-aurora-multimaster-preview.html)

### [Aurora Serverless](https://aws.amazon.com/rds/aurora/)

- On-demand, auto-scaling database for applications with unpredictable or cyclical workloads
- Pay per second
- Now in [preview](https://pages.awscloud.com/amazon-aurora-serverless-preview.html)

### [DynamoDB Global Tables](https://aws.amazon.com/dynamodb/global-tables/)

- Fully managed, multi-master, multi-region
- Generally available

### [DynamoDB Backup and Restore](https://aws.amazon.com/dynamodb/backup-restore/)

- On-deman and continuous backups
- Point In Time Restore (up to the second) for the last 45 days
- Generally available

### [Amazon Neptune](https://aws.amazon.com/neptune/) ([announcement](https://aws.amazon.com/blogs/aws/amazon-neptune-a-fully-managed-graph-database-service/))

- Fully-managed graph database
- Supports Apache TinkerPop and SPARQL
- 6 replicas of data, across 3 AZs
- Backup and restore
- Now in [preview](https://pages.awscloud.com/NeptunePreview.html)


## Message broker

### [Amazon MQ](https://aws.amazon.com/amazon-mq/)

Managed message broker service for [Apache ActiveMQ](http://activemq.apache.org/).


## Networking

### Inter-Region VPC peering

You can now connect two or more VPCs in different AWS regions, solving the problem to have private connectivity between VPCs located in two different AWS regions. Highly available, no single point of failure. All traffic is routed via the AWS backbone (Amazon Global Network) and encrypted.

Data transferred across Inter-Region VPC Peering connections is charged at the **standard inter-region data transfer rates** (~ $0.02 / GB in [most of the regions](https://aws.amazon.com/ec2/pricing/on-demand/)).

Currently available in `us-east-1`, `us-east-2`, `us-west-2` and `eu-west-1`

![](https://pbs.twimg.com/media/DP1uEIPUQAAGFNb.jpg:large)


### New PrivateLink endpoints ([announcement](https://aws.amazon.com/blogs/aws/new-aws-privatelink-endpoints-kinesis-ec2-systems-manager-and-elb-apis-in-your-vpc/))

New AWS PrivateLink endpoints to connect via private VPC networking (IPs in the VPC CIDR block) to the AWS services: Kinesis, Service Catalog, EC2 Systems Manager, Amazon EC2 APIs, and ELB APIs.


### Amazon Time Sync Service ([announcement](https://aws.amazon.com/about-aws/whats-new/2017/11/introducing-the-amazon-time-sync-service/))

Similar to the Google public one, AWS is now offering an internal NTP server not susceptible to leap second (it gets automatically smoothed out over a larger time window). The Amazon Time Sync Server is available at the `169.254.169.123` IP address from any instance running on **VPC**.

Currently the new `C5` and `M5` instances don't support it, but support will be introduced soon. Check out [this page](http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/set-time.html) for more information.


## Lambda

### AWS Serverless Application Repository

- Now in preview


### API Gateway with VPC integration

_No reference yet._


## Storage / Analytics

### S3 Select ([announcement](https://aws.amazon.com/blogs/aws/s3-glacier-select/))

- Pull out only the data you need from S3 objects
- New API to select and retrieve data within objects
- Based on SQL-like syntax

### Glacier Select ([announcement](https://aws.amazon.com/blogs/aws/s3-glacier-select/))

- Run queries directly on data stored on Glacier


## Machine learning

### [Amazon SageMaker](https://aws.amazon.com/sagemaker/) ([announcement](https://aws.amazon.com/blogs/aws/sagemaker/))

- Easily build, train and deploy machine learning models
- Multi AZs
- Supports A/B testing to test new algorithms before deploying to production
- Generally available

### [AWS DeepLens](https://aws.amazon.com/deeplens/) ([announcement](https://aws.amazon.com/blogs/aws/deeplens/))

- Wireless HD **video camera** for developers
- Features on-board compute optimized for deep learning
- Integrates with SageMaker and Lambda
- Pre-orders available on amazon.com at 249$

### [Amazon Rekognition Video](https://aws.amazon.com/rekognition/video-features/) ([announcement](https://aws.amazon.com/blogs/aws/launch-welcoming-amazon-rekognition-video-service/))

- Get video in input
- Detects people, activities, details out of the input video

![](https://media.amazonwebservices.com/blog/2017/RekognitionVideo-01-VideoConsole-2.png)


## Media

### [Amazon Kinesis Video Streams](https://aws.amazon.com/kinesis/video-streams/)

- Ingest and store video, audio and other time-encoded data
- Generally available

![](https://pbs.twimg.com/media/DP0uboCUEAAz-00.jpg)


### [Amazon Transcribe](https://aws.amazon.com/transcribe/) ([announcement](https://aws.amazon.com/blogs/aws/amazon-transcribe-scalable-and-accurate-automatic-speech-recognition/))

- Automated speech recognition, to transcribe audio into text
- Can analyze audio files stored on S3 in many formats (WAV, MP3, Flac, ...)
- Multiple languages (**english** and **spanish** right now, more languages will be added in the next future)
- Intelligent punctuation and formatting
- Timestamp generation
- Support for telephony audio
- Recognize multiple speaker (not available yet)
- Now in [preview](https://pages.awscloud.com/amazon-transcribe-preview.html)

### [Amazon Translate](https://aws.amazon.com/translate/)

- Translate text between languages
- Supports real-time translation
- Supports batch operations / analysis
- Recognize source language (not available yet)
- Now in [preview](https://pages.awscloud.com/amazon-translate-preview.html)

### [Amazon Comprehend](https://aws.amazon.com/comprehend/) ([announcement](https://aws.amazon.com/blogs/aws/amazon-comprehend-continuously-trained-natural-language-processing/))

- Natural language processing service
- Generally available

![](https://media.amazonwebservices.com/blog/2017/di_con_main_2.png)


## IoT

### AWS IoT 1-Click

- Register a device, get a list of lambdas, click a butto to trigger a lambda
- Now in preview

### AWS IoT Device Management

- Fleet management for connected devices
- Automate provisione of fleet of devices
- Organize device inventory
- Monitor and query the fleet
- Remotely manage devices
- Generally available

### AWS IoT Device Defender

- Security management for IoT devices
- Audit device policies
- Monitor device behaviour
- Identity anomalies and out of compliance behaviours
- Generate alerts
- Coming in 2018

### AWS IoT Analytics

- Cleans, processes, stores and queries analytics
- Now in preview


### Alexa for Business

- Integrated to work well with conference systems and just say "Hey Alexa, start a meeting"

Generally available.


### Amazon FreeRTOS ([announcement](https://aws.amazon.com/blogs/aws/announcing-amazon-freertos/))

Amazon FreeRTOS is an **IoT microcontroller operating system** that simplifies development, security, deployment, and maintenance of microcontroller-based edge devices. Amazon FreeRTOS extends the FreeRTOS kernel, a popular real-time operating system, with libraries that enable local and cloud connectivity, security, and (coming soon) over-the-air updates.


## Security

### [Amazon GuardDuty](https://aws.amazon.com/guardduty/) ([announcement](https://aws.amazon.com/blogs/aws/amazon-guardduty-continuous-security-monitoring-threat-detection/))

Amazon GuardDuty is a service that inspect networking attivity via VPC Flow Logs, CloudTrail and DNS logs to detect suspected behaviour. Findings are provided in the AWS console and as CloudWwatch Events to alert on. You can also setup Lambda functions to automatically remediate specific types of issues or fire the alert via an external system (ie. Slack).

Generally available.


## IDE

### AWS Cloud9 ([announcement](https://aws.amazon.com/blogs/aws/aws-cloud9-cloud-developer-environments/))

A browser-based IDE to write, run and debug your code.

Generally available.


## Pics from Werner's Keynote

![](https://pbs.twimg.com/media/DP5eW9JW4AAGJfC.jpg)

![](https://pbs.twimg.com/media/DP5gMZMWkAEMufu.jpg)

