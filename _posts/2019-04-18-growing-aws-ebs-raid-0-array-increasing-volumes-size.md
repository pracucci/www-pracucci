---
layout:         post
title:          "Growing an AWS EBS RAID 0 array, increasing volumes size"
tags:           aws
date:           2019-04-18 05:00:00 GMT
keywords:
---

This week [@voxnest](https://www.voxnest.com) we had to add more disk capacity to one of our PostgreSQL clusters. Despite it looks a common situation, we never did it so far, because we initially created our clusters with a large RAID 0 array of EBS Volumes. At least, with what we believed to be large enough.

To increase a RAID array made of EBS Volumes you have two main **options**:
1. **Add more EBS Volumes to the RAID array**
2. **Increase the capacity (size) of existing EBS Volumes**

Looking for some documentation, we found a lot of documented procedures about #1 while didn't find much information about #2.

There are pros and cons on both, but to keep it simple we would prefer to not change the number of volumes building up the array because of the automation we have around our PostgreSQL clusters. Our automation currently assumes that all clusters have a RAID 0 composed by the same number of EBS Volumes: adding 1+ volumes only to a specific cluster would require us to revisit and retest it.

_All in all, we found out the procedure to be quite simple and I'm going to share it with you in case you will have the same needs._


### Pre-requisites

- RAID 0 array built on top of EBS Volumes with `mdadm`
- Ensure with `mdadm --detail /dev/RAID-DEVICE` the metadata version is 1.1 or above


### Procedure

1. Get information about the current RAID (used to compare later - only "Array Size" should change)
   ```
   mdadm --detail /dev/RAID-DEVICE
   ```

2. Grow EBS Volumes on AWS
   - Modify each EBS Volume size
   - Wait until EBS Volumes change has completed (including the "optimizing" phase)

3. Drain the instance
   - If you can, drain all production traffic from the instance

4. Grow RAID
   - Stop service using the RAID (ie. PostgreSQL)

   - Unmount file system
     ```
     umount /MOUNT-PATH
     ```

   - Stop the RAID
     ```
     mdadm --stop /dev/RAID-DEVICE
     ```

   - Re-assemble RAID updating volumes size
     ```
     # The key here is --update=devicesize which re-reads the block devices
     # sizes and update the RAID metadata accordingly. Subsequent reassembles
     # of the RAID do NOT need this option anymore.

     mdadm --assemble --update=devicesize /dev/RAID-DEVICE LIST-OF-DEVICES
     ```

   - Ensure the RAID has the new expected size
     ```
     mdadm --detail /dev/RAID-DEVICE
     ```

   - Mount filesystem
     ```
     mount -t TYPE /dev/RAID-DEVICE /MOUNT-PATH
     ```

   - Grow the filesystem size
     ```
     # This procedure depends on the filesystem type you're using. The following
     # example shows how it works on XFS.

     xfs_info   /MOUNT-PATH
     xfs_growfs /MOUNT-PATH
     xfs_info   /MOUNT-PATH
     ```

   - Ensure the filesystem has the new expected size
     ```
     df -h
     ```

   - Start service using the RAID (ie. PostgreSQL)

5. Put the instance back in rotation (_only if drained it at step #3_)

