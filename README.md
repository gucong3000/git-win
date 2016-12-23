git-win
===========

[![NPM version](https://img.shields.io/npm/v/git-win.svg?style=flat-square)](https://www.npmjs.com/package/git-win)
[![AppVeyor](https://img.shields.io/appveyor/ci/gucong3000/git-win.svg)](https://ci.appveyor.com/project/gucong3000/git-win)

Install Git for Windows by npm.

## Why
- Show path of Git in your disk.
- Install Git when you have not installed.
- Silent installation Git.

## Install

```bash
npm i -g git-win --git4win_mirror=https://npm.taobao.org/mirrors/git-for-windows
```

## Usage

### Show path of Git.

```bash
git-which
```

Or js API

```javascript
var git = require("git-win");
console.log(git);
```

### Silent installation Git.

```bash
git-inst
```
Or specify a version number

```bash
git-inst 2.11
```

```bash
git-which
```
