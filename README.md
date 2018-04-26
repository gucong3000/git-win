git-win
===========

[![NPM version](https://img.shields.io/npm/v/git-win.svg?style=flat-square)](https://www.npmjs.com/package/git-win)
[![AppVeyor](https://img.shields.io/appveyor/ci/gucong3000/git-win.svg)](https://ci.appveyor.com/project/gucong3000/git-win)
[![codecov](https://img.shields.io/codecov/c/github/gucong3000/git-win.svg)](https://codecov.io/gh/gucong3000/git-win)
[![David](https://img.shields.io/david/gucong3000/git-win.svg)](https://david-dm.org/gucong3000/git-win)

Install Git for Windows by npm.

## Why

- Show path of Git in your disk.
- Install Git when you have not installed.
- Silent installation Git.

## Install

Install `Git for Windows` from mirror

```bash
npm i -g git-win --git4win_mirror=https://npm.taobao.org/mirrors/git-for-windows
```

Install `Git for Windows` for specify version whith [flags to use by calling the installer](https://github.com/git-for-windows/git/wiki/Silent-or-Unattended-Installation)

```bash
npm i -g git-win --git-version=2.17 -- /COMPONENTS="icons,icons\\quicklaunch,ext,ext\\shellhere,ext\\guihere,assoc,assoc_sh"
```

## Usage

Get install path of Git:

```js
var git = require("git-win");
console.log(git);
```
