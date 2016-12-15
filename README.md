git-win
===========

[![NPM version](https://img.shields.io/npm/v/git-win.svg?style=flat-square)](https://www.npmjs.com/package/git-win)
[![AppVeyor](https://img.shields.io/appveyor/ci/gucong3000/git-win.svg)](https://ci.appveyor.com/project/gucong3000/git-win)

Use Git Bash as shell on windows

## Why
- Support [PATHEXT](https://github.com/joyent/node/issues/2318)
- Support [shebangs](http://pt.wikipedia.org/wiki/Shebang)
- Support [bash](https://pt.wikipedia.org/wiki/Bash) shell

## Install

```bash
npm install --save git-win
```

## Usage

```javascript
require('git-win');
const spawn = require('child_process').spawn;
const ls = spawn('cat', ['README.md']);

ls.stdout.on('data', (data) => {
	console.log(`stdout: ${data}`);
});

ls.stderr.on('data', (data) => {
	console.log(`stderr: ${data}`);
});

ls.on('close', (code) => {
	console.log(`child process exited with code ${code}`);
});
```
