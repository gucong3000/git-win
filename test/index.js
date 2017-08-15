'use strict';
const describe = require('mocha').describe;
// var before = require('mocha').before;
// var after = require('mocha').after;
const it = require('mocha').it;
const assert = require('assert');

const fs = require('mz/fs');
const git = require('../');

describe('git download', () => {
	if (process.env.CI) {
		it('github', function () {
			this.timeout(0xffffff);
			process.env.GIT4WIN_MIRROR = 'https://github.com/git-for-windows/git/releases/download/';
			return require('../lib/download')().then(fs.stat).then((stats) => {
				assert.ok(stats.isFile());
			});
		});
	} else {
		it('npm.taobao.org', function () {
			this.timeout(0xffffff);
			process.env.GIT4WIN_MIRROR = 'https://npm.taobao.org/mirrors/git-for-windows/';
			return require('../lib/download')('2.10.0').then(fs.stat).then((stats) => {
				assert.ok(stats.isFile());
			});
		});
	}
});

describe('git path', () => {
	it('git exist', () => {
		assert.ok(git);
	});
	it('git exist', () => {
		return fs.stat(git).then((stats) => {
			assert.ok(stats.isDirectory());
		});
	});
});
