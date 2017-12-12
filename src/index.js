'use strict';
const assert = require('assert');
const gitInstallPath = require('./git-path').getGitDir();
assert.ok(gitInstallPath, 'Git not found, please install Git and try again.\nhttps://git-for-windows.github.io/\nhttps://npm.taobao.org/mirrors/git-for-windows/');
module.exports = gitInstallPath;
