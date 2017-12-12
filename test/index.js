'use strict';
const describe = require('mocha').describe;
// var before = require('mocha').before;
// var after = require('mocha').after;
const it = require('mocha').it;
const assert = require('assert');

const cp = require('child_process');
const path = require('path');
const osTmpdir = require('os-tmpdir');
const fs = require('fs-extra');
const download = require('../src/download');

describe('git download', () => {
	beforeEach(() => {
		delete process.env.GIT4WIN_MIRROR;
		delete process.env.npm_config_git4win_mirror;
		cp.spawnSync('del', [path.join(osTmpdir(), 'Git*.exe')], {
			shell: true,
		});
	});
	if (process.env.CI) {
		it('2.13.0 @ github', function () {
			this.timeout(0xffffff);
			return download('2.13.0').then(file => {
				assert.ok(file.indexOf('\\Git-2.13.0') > 1);
				return fs.stat(file);
			}).then((stats) => {
				assert.ok(stats.isFile());
			});
		});
		it('latest @ github', function () {
			this.timeout(0xffffff);
			return download().then(fs.stat).then((stats) => {
				assert.ok(stats.isFile());
			});
		});
	} else {
		it('2.13.0 @ npm.taobao.org', function () {
			this.timeout(0xffffff);
			process.env.GIT4WIN_MIRROR = 'https://npm.taobao.org/mirrors/git-for-windows/';
			return download('2.13.0').then(file => {
				assert.ok(file.indexOf('\\Git-2.13.0') > 1);
				return fs.stat(file);
			}).then((stats) => {
				assert.ok(stats.isFile());
			});
		});
		it('latest @ npm.taobao.org', function () {
			this.timeout(0xffffff);
			process.env.GIT4WIN_MIRROR = 'https://npm.taobao.org/mirrors/git-for-windows/';
			return download().then(fs.stat).then((stats) => {
				assert.ok(stats.isFile());
			});
		});
	}
});

describe('git path', () => {
	const git = require('../src/');
	it('git exist', () => {
		assert.ok(git);
	});
	it('git exist', () => {
		return fs.stat(git).then((stats) => {
			assert.ok(stats.isDirectory());
		});
	});
});
