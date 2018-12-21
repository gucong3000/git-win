git-win
===========

[![NPM version](https://img.shields.io/npm/v/git-win.svg?style=flat-square)](https://www.npmjs.com/package/git-win)
[![AppVeyor](https://img.shields.io/appveyor/ci/gucong3000/git-win.svg)](https://ci.appveyor.com/project/gucong3000/git-win)
[![codecov](https://img.shields.io/codecov/c/github/gucong3000/git-win.svg)](https://codecov.io/gh/gucong3000/git-win)
[![David](https://img.shields.io/david/gucong3000/git-win.svg)](https://david-dm.org/gucong3000/git-win)

Install [Git for Windows](https://gitforwindows.org/) by npm.

## Why

- Show path of Git in your disk.
- Install Git when you have not installed.
- Silent installation Git.

## Install

Install [Git for Windows](https://gitforwindows.org/) from mirror

```bash
npm i -g git-win --git4win_mirror=https://npm.taobao.org/mirrors/git-for-windows
```

Install [Git for Windows](https://gitforwindows.org/) for specify version whith [flags to use by calling the installer](https://github.com/git-for-windows/git/wiki/Silent-or-Unattended-Installation)

```bash
npm i -g git-win --git-version=2.19 -- /COMPONENTS="icons,icons\\quicklaunch,ext,ext\\shellhere,ext\\guihere,assoc,assoc_sh"
```

## Usage

```js
const gitWin = require("git-win");

gitWin.toPosix("C:/Program Files/Git/bin/bash");	// `/bin/bash`
gitWin.toPosix("C:/Program Files/Git/mingw000");	// `/mingw64`
gitWin.toPosix("C:/Users");				// `/c/Users`

gitWin.toWin32("~/xxxxxxx");	// `%HOME%\xxxxxxx`
gitWin.toWin32("/bin/bash");	// `C:\Program Files\Git\usr\bin\bash`
gitWin.toWin32("/mingw000");	// `C:\Program Files\Git\mingw64`
gitWin.toWin32("/tmp/xxxx");	// `C:\Users\****\AppData\Local\Temp\xxxx`
```

## API

### gitWin.root

Show install directory of Git

### gitWin.resolve([...paths])

The `gitWin.resolve()` method resolves a sequence of paths into an path.
- `/mingw32` path prefix will be convert to real path name
- [The cygdrive path prefix](https://cygwin.com/cygwin-ug-net/using.html#cygdrive) will be convert to Windows drive path
- Git/Cygwin install directory path prefix will be convert to root path

### gitWin.toWin32([...paths])

Base on `gitWin.resolve()` but return an Windows style path.
- Support for [the Cygwin mount table](https://cygwin.com/cygwin-ug-net/using.html#mount-table)
- POSIX style root path will be convert to Git install directory
- tilde path prefix will be convert to `%HOME%`

### gitWin.toPosix([...paths])

Base on `gitWin.resolve()` but return an POSIX style path.
- Drive path prefix will be convert to [The cygdrive path prefix](https://cygwin.com/cygwin-ug-net/using.html#cygdrive)

### gitWin.mingw

Show directory name of MinGW

### gitWin.cygdrive

Show cygdrive path prefix

### gitWin.mount

Show [the Cygwin mount table](https://cygwin.com/cygwin-ug-net/using.html#mount-table)
