var assert = require('assert');
var gitInstallPath = require('./lib/git-path')();
assert.ok(gitInstallPath, 'Git not found, please install Git and try again.\nhttps://git-for-windows.github.io/\nhttps://npm.taobao.org/mirrors/git-for-windows/');
module.exports = gitInstallPath;
if(process.mainModule === module) {
	console.log(gitInstallPath);
}
