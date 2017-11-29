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
- `I3m` - bare metal high I/O

### Spot instances

[![](https://www.awsgeek.com/images/amazon-ec2-spot-instances.jpg)](https://www.awsgeek.com/images/amazon-ec2-spot-instances.jpg)
_Courtesy of [awsgeek.com](https://www.awsgeek.com/posts/amazon-ec2-spot-instances/)._


## Containers and Kubernetes

### [Amazon Elastic Container Service for Kubernetes](https://aws.amazon.com/eks/) (EKS)

- Latest version of K8S
- Automated version upgrades and patches
- Integrated with CloudTrail, CloudWatch Logs, VPC, IAM, PrivateLink
- Uses Calico to manage networking
- Supports Kubernetes add-ons (K8S dashboard, KubeDNS, ...)
- Native VPC networking for pods (see: [amazon-vpc-cni-k8s](https://github.com/aws/amazon-vpc-cni-k8s/))
- Now in preview

### [AWS Fargate](https://aws.amazon.com/fargate/) ([announcement](https://aws.amazon.com/blogs/compute/aws-fargate-a-product-overview/))

- Run containers without managing servers or clusters
- No clusters to manage
- Manages underlying infrastructure
- AWS Fargate support for Amazon EKS will be available in 2018.
- Generally available

Resources:

- [Securing Struts in AWS Fargate](https://blog.aquasec.com/securing-struts-in-aws-fargate)


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


## Networking

### PrivateLink


## Storage / Analytics

### S3 Select

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
- Pre-orders available
