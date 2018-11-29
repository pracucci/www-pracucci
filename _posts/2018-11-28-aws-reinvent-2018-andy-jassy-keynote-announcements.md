---
layout:         post
title:          "Announcements during AWS re:invent 2018 - Andy Jassy Keynote"
tags:           aws
date:           2018-11-28 16:00:00 GMT
keywords:
---

## Databases

- [**DynamoDB Read/Write capacity on demand**](https://aws.amazon.com/dynamodb/pricing/on-demand/)<br />
  no longer have to pre-provision r/w capacity - pay per request pricing

  Example of pricing in `eu-west-1`:
  - **Provisioned capacity**
    - Write capacity: `$0.000735` per WCU / hour<br />
      _1 unit for each 1KB write op / sec, 2 units for transactional writes_
    - Read capacity: `$0.000147` per RCU / hour<br />
      _1 unit for each 4KB strongly consistent read op / sec, 2 units for transactional reads, 0.5 for eventually consistent reads_
    - Storage: `$0.283` / GB
  - **On-demand capacity**
    - Write capacity: `$1.414` per million write units<br />
      _1 unit for each 1KB write op, 2 units for transactional writes_
    - Read capacity: `$0.2827` per million read units<br />
      _1 unit for each 4KB strongly consistent read op, 2 units for transactional reads, 0.5 units for eventually consistent reads_
    - Storage: `$0.283` / GB

- [**Amazon Timestream**](https://aws.amazon.com/timestream/) (preview)<br />
  serverless timeseries database - data is stored on different backends (in-memory, SSD, magnetic) with different retentions and pricing


## Storage

- [**New S3 storage class: Glacier Deep Archive**](https://aws.amazon.com/s3/storage-classes/) (coming soon)<br />
  replace tape archives - about $1 / TB storage - eleven 9s of durability - retrieval time within 12 hours

- [**EFS IA** (Infrequent Access Storage)](https://aws.amazon.com/about-aws/whats-new/2018/11/coming-soon-amazon-efs-infrequent-access-storage-class/) (coming soon)

- [**AWS Lake Formation**](https://aws.amazon.com/lake-formation/)


## Machine Learning

- [**Amazon Elastic Inference**](https://aws.amazon.com/machine-learning/elastic-inference/)<br />
  attach GPU acceleration to any EC2 instance for faster machine learning inference

- [**AWS Inferentia**](https://aws.amazon.com/machine-learning/inferentia/) (late 2019)<br />
  AWS-designed machine learning inference chip

- [**Amazon SageMaker Ground Truth**](https://aws.amazon.com/sagemaker/groundtruth/)<br />
  build training datasets using machine learning

- **Amazon SageMaker RL**<br />
  reinforcement learning algorithms available in SageMaker

- **AWS Marketplace for machine learning**

- [**AWS DeepRacer**](https://aws.amazon.com/blogs/aws/aws-deepracer-go-hands-on-with-reinforcement-learning-at-reinvent/) (preview on Amazon.com)<br />
  ML-powered 1/18th scale race-car equippted with a camera, accelerometer and gyroscope

- [**Amazon Textract**](https://aws.amazon.com/textract/) (preview)<br />
  OCR capable of extracting layout as well (ie. tables)

- [**Amazon Personalize**](https://aws.amazon.com/personalize/)<br />
  ML-powered recommendations as a service

- [**Amazon Forecast**](https://aws.amazon.com/forecast/)<br />
  ML-powered time-series forecasting as a service


## Security

- [**AWS Control Tower**](https://aws.amazon.com/controltower/)<br />
  setup a landing zone in a multi-account AWS environment

- [**AWS Security Hub**](https://aws.amazon.com/security-hub/)<br />
  centrally view and manage security alerts and automate compliance checks


## Blockchain

- [**Amazon Quantum Ledger Database**](https://aws.amazon.com/qldb/) (preview)<br />
  managed ledger database providing a transparent, immutable, and cryptographically verifiable transaction log - [internally used by AWS since few years](https://twitter.com/colmmacc/status/1067832198059970561)

- [**Amazon Managed Blockchain**](https://aws.amazon.com/managed-blockchain/) (preview)


## Hybrid

- [**AWS Outposts**](https://aws.amazon.com/outposts/) (2019)<br />
  run AWS infrastructure on premise
