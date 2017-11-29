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

![](https://www.awsgeek.com/images/amazon-ec2-spot-instances.jpg)
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

### [AWS Fargate](https://aws.amazon.com/blogs/aws/aws-fargate/) ([announcement](https://aws.amazon.com/blogs/compute/aws-fargate-a-product-overview/))

- Run containers without managing servers or clusters
- No clusters to manage
- Manages underlying infrastructure


## Database

### Aurora Multi-Master (single-region)

- Scale out read and writes
- Multi-region coming in 2018

### Aurora Serverless

- On-demand, auto-scaling database for applications with unpredictable or cyclical workloads
- Pay per second

### DynamoDB Global Tables

- Fully managed, multi-master, multi-region

### DynamoDB Backup and Restore

- On-deman and continuous backups
- Point In Time Restore (up to the second) for the last 45 days

### Amazon Neptune ([announcement](https://aws.amazon.com/blogs/aws/amazon-neptune-a-fully-managed-graph-database-service/))

- Fully-managed graph database
- Supports Apache TinkerPop and SPARQL
- 6 replicas of data, across 3 AZs
- Backup and restore
- Now in preview


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

### Amazon SageMaker

- Easily build, train and deploy machine learning models
- Generally available
