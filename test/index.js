'use strict';
parseInt(process.versions.node) < 9 && require('babel-register');

const assert = require('assert');
const cp = require('child_process');
const path = require('path');
const osTmpdir = require('os-tmpdir');
const fs = require('fs-extra');
const download = require('../src/download');

describe('git path', () => {
	const git = require('../src/');
	const gitPath = require('../src/git-path.js');

	it('get git dir', () => {
		assert.ok(git);
	});

	it('git dir exist', () => {
		return fs.stat(git).then((stats) => {
			assert.ok(stats.isDirectory());
		});
	});

	it('get git dir by `PATH` env', () => {
		assert.equal(gitPath.getGitDirByPathEnv(), git);
	});

	it('get git dir form registry', () => {
		assert.equal(gitPath.getGitDirByRegstry() || gitPath.getGitDirByRegstry(64) || gitPath.getGitDirByRegstry(32), git);
	});

	it('lookup for git dir', () => {
		assert.equal(gitPath.lookupGitDir(), git);
	});
});

describe('git download', () => {
	beforeEach(() => {
		delete process.env.GIT4WIN_MIRROR;
		delete process.env.npm_config_git4win_mirror;
		cp.spawnSync('del', [path.join(osTmpdir(), 'Git*.exe')], {
			shell: true,
		});
	});

	if (process.env.CI) {
		it('2.13.0 @ github', () => {
			return download('2.13.0').then(file => {
				assert.ok(file.indexOf('\\Git-2.13.0') > 1);
				return fs.stat(file);
			}).then((stats) => {
				assert.ok(stats.isFile());
				return download('2.13.0');
			}).then(file => {
				assert.ok(file.indexOf('\\Git-2.13.0') > 1);
			});
		});
		it('latest @ github', () => {
			process.env.GIT4WIN_MIRROR = 'https://github.com/git-for-windows/git/releases/download/';
			return download().then(fs.stat).then((stats) => {
				assert.ok(stats.isFile());
			});
		});
	} else {
		it('2.13.0 @ npm.taobao.org', () => {
			process.env.GIT4WIN_MIRROR = 'https://npm.taobao.org/mirrors/git-for-windows/';
			return download('2.13.0').then(file => {
				assert.ok(file.indexOf('\\Git-2.13.0') > 1);
				return fs.stat(file);
			}).then((stats) => {
				assert.ok(stats.isFile());
				return download('2.13.0');
			}).then(file => {
				assert.ok(file.indexOf('\\Git-2.13.0') > 1);
			});
		});
		it('latest @ npm.taobao.org', () => {
			process.env.GIT4WIN_MIRROR = 'https://npm.taobao.org/mirrors/git-for-windows/';
			return download().then(fs.stat).then((stats) => {
				assert.ok(stats.isFile());
			});
		});
	}
});
