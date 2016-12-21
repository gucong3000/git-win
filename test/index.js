var describe = require('mocha').describe;
// var before = require('mocha').before;
// var after = require('mocha').after;
var it = require('mocha').it;
var assert = require('assert');

var fs = require('mz/fs');
var git = require('../');

describe('git download', function() {
	it('github', function() {
		this.timeout(0xffffff);
		process.env.GIT4WIN_MIRROR = 'https://github.com/git-for-windows/git/releases/download/';
		return require('../lib/download')().then(function() {
			assert.ok(git);
		});
	});
	it('npm.taobao.org', function() {
		this.timeout(0xffffff);
		process.env.GIT4WIN_MIRROR = 'https://npm.taobao.org/mirrors/git-for-windows/';
		return require('../lib/download')('2.10.0').then(function() {
			assert.ok(git);
		});
	});
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
