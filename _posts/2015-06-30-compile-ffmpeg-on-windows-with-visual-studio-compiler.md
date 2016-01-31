---
layout:         post
title:          Compile ffmpeg libs on Windows with Visual Studio compiler
keywords:       ffmpeg, windows, visual studio
date:           2015-06-30 05:00:00 GMT
---

Today I spent some time to compile `ffmpeg` libs on Windows. [Most documentation out there](https://trac.ffmpeg.org/wiki/CompilationGuide) is not updated to 2015, yet compiling `ffmpeg` on Windows is pretty easy. If you're looking for a copy and paste solution, keep reading.

[{% image 2015-06-30-ffmpeg.png %}](https://www.ffmpeg.org)


## Pre-requisites

 - Visual Studio 2013 or 2015
 - MSYS2
 - YASM

### Visual Studio

Latest `ffmpeg` versions compile both with Visual Studio 2013 and 2015. Previous versions don't compile with VS2015 because they expect that VS compiler has no `snprintf` support while it was introduced in VS2015.


### MSYS2

1. Download and run the installer at [​http://msys2.github.io](​http://msys2.github.io). Follow the instructions and install it in `C:\workspace\windows\msys64`
2. Install required tools: `pacman -S make gcc diffutils`
3. Rename `C:\workspace\windows\msys64\usr\bin\link.exe` to `C:\workspace\windows\msys64\usr\bin\link_orig.exe`, in order to use MSVC `link.exe` (*naming conflict*)

### YASM

1. Download [Win64.exe](http://yasm.tortall.net/Download.html) and move it to `C:\workspace\windows`
2. Rename `yasm-<version>-win64.exe` to `yasm.exe`
3. Add `C:\workspace\windows` to PATH environment variable (`setx PATH "%PATH%;C:\workspace\windows`)


## Ready to compile

### Launch msys2 shell from Visual Studio Code shell

1. Run VS2013 prompt
2. Run `C:\workspace\windows\msys64\msys_shell.bat`: will open msys2 shell inheriting `%PATH%` from VS2013 prompt
3. Ensure `which cl` exists and `which link` points to MSVC
4. `cd /c/path/to/ffmpeg`
5. `./configure` and `make`

Basic `configure` switches:

{% highlight bash %}
./configure \
    --toolchain=msvc \
    --arch=x86 \
    --enable-yasm \
    --enable-asm\
    --enable-shared \
    --disable-static
{% endhighlight %}
