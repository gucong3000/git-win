var describe = require('mocha').describe;
// var before = require('mocha').before;
// var after = require('mocha').after;
var it = require('mocha').it;
var assert = require('assert');

var fs = require('mz/fs');
var git = require('../');

describe('git download', function() {
	if(process.env.CI) {
		it('github', function() {
			this.timeout(0xffffff);
			process.env.GIT4WIN_MIRROR = 'https://github.com/git-for-windows/git/releases/download/';
			return require('../lib/download')().then(fs.stat).then(function(stats) {
				assert.ok(stats.isFile());
			});
		});
	} else {
		it('npm.taobao.org', function() {
			this.timeout(0xffffff);
			process.env.GIT4WIN_MIRROR = 'https://npm.taobao.org/mirrors/git-for-windows/';
			return require('../lib/download')('2.10.0').then(fs.stat).then(function(stats) {
				assert.ok(stats.isFile());
			});
		});
	}
});

describe('git path', function() {
	it('git exist', function() {
		assert.ok(git);
	});
	it('git exist', function() {
		return fs.stat(git).then(function(stats) {
			assert.ok(stats.isDirectory());
		});
	});
});
