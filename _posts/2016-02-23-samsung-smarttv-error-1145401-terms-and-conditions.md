---
layout:         post
title:          "Samsung SmartTV error 1145401: Terms and Conditions"
tags:
date:           2016-02-23 07:00:00 GMT
---

If you landed here, you probably just purchased a Samsung SmartTV and after few minutes realized that you can't run the SmartTV because unable to download the terms and conditions (error: 1145401). I struggled on this for few hours as well, tried many tricks found on internet (and none was working), and finally realized that it **requires a firmware upgrade to fix it**.

The firmware upgrade automatically downloaded by the TV is actually few versions behind the latest version available on the website, thus **you need to download the latest firmware upgrade version from the Samsung website to fix it**.

You can find some "quick" instructions below. Upgrading the firmware from version 1400 to 1443 (latest version available at the time of writing) fixed the issue to me.


### Look for the latest firmware upgrade

1. Open [http://www.samsung.com](http://www.samsung.com/)
2. Look for your TV model in the top right search bar
3. Open your TV model product page and scroll down to "Support"
4. You should find a download called "**Upgrade File (USB type)**" and the version number


### Check the latest firmware upgrade version

You should now check if the latest firmware upgrade file version is newer than your TV software version. To get the software version running on your TV you should turn on the TV > _Menu_ > _Support_ > _Software upgrade_ > and check the number close to "current version".

_In my case, for example, the TV software version was 1400, the TV wasn't displaying any software upgrade available, but on the website the latest software upgrade version was 1443 (and this version fixed the issue)._


### Download and install the software upgrade

If the software upgrade on the Samsung website is newer than the one running on your TV, follow these steps to upgrade it:

1. Download the software upgrade file from the Samsung website
2. Copy the `.exe` file to a USB memory key
3. Run the `.exe` file from the USB memory key (unfortunately this step requires Windows)
4. Ensure that the USB memory now contains a directory called `T-HKMDEUC`, containing another directory called `image`
5. Safe remove the USB memory from your computer
6. Attach the USB memory to your TV
7. _Menu_ > _Software Upgrade_ > _Search for upgrades_ > Select to search in the attached USB memory
8. Follow the instructions and your TV firmware will be upgraded


### Did it solve your issue?

If it solved your issue, please leave a comment below.
