git-win
===========

[![NPM version](https://img.shields.io/npm/v/git-win.svg?style=flat-square)](https://www.npmjs.com/package/git-win)
[![AppVeyor](https://img.shields.io/appveyor/ci/gucong3000/git-win.svg)](https://ci.appveyor.com/project/gucong3000/git-win)
[![codecov](https://img.shields.io/codecov/c/github/gucong3000/git-win.svg)](https://codecov.io/gh/gucong3000/git-win)

Install Git for Windows by npm.

## Why

- Set `Git Bash` as cross-platform shell for [npm run scripts](https://docs.npmjs.com/cli/run-script).
- Show path of Git in your disk.
- Install Git when you have not installed.
- Silent installation Git.

## Install

Install `Git for Windows` from mirror

```bash
npm i -g git-win --git4win_mirror=https://npm.taobao.org/mirrors/git-for-windows
```

Install `Git for Windows` for specify version

```bash
npm i -g git-win --git-version=2.13
```

## Usage

Get install path of Git:

```js
var git = require("git-win");
console.log(git);
```

Use cross-platform shell for [npm run scripts](https://docs.npmjs.com/cli/run-script).
In your package.json file, you can add scripts using `bash` or `sh`:

```json
"scripts": {
  "foo": "bash bin/my_script.sh",
  "bar": "sh -c \"[ ! `git diff` ]\" || echo file(s) changed!"
}
```
