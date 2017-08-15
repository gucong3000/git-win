const describe = require('mocha').describe;
// var before = require('mocha').before;
// var after = require('mocha').after;
const it = require('mocha').it;
const assert = require('assert');

const cp = require('child_process');
const path = require('path');
const osTmpdir = require('os-tmpdir');
const fs = require('fs-extra');

describe('git download', () => {
	beforeEach(() => {
		delete process.env.GIT4WIN_MIRROR;
		delete process.env.npm_config_git4win_mirror;
		cp.spawnSync('del', [path.join(osTmpdir(), 'Git*.exe')], {
			shell: true,
		});
	});
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
			return require('../lib/download')('2.14.1').then(fs.stat).then((stats) => {
				assert.ok(stats.isFile());
			});
		});
	}
});

describe('git path', () => {
	const git = require('../');
	it('git exist', () => {
		assert.ok(git);
	});
	it('git exist', () => {
		return fs.stat(git).then((stats) => {
			assert.ok(stats.isDirectory());
		});
	});
});
