'use strict';
parseInt(process.versions.node) < 9 && require('babel-register');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const cp = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs-extra');
const download = require('../src/download');
const proxyquire = require('proxyquire');
const check = require('../src/check-download');

chai.use(chaiAsPromised);

const expect = chai.expect;
const assert = chai.assert;

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

describe('get release', () => {
	it('use cache when network failure', () => {
		const getRelease = proxyquire('../src/get-release', {
			got: () => (
				Promise.reject(new Error('Network failure'))
			),
		});
		return getRelease(2).then(release => {
			assert.equal(release.id, 8710511);
		});
	});
});

describe('get check download', () => {
	const file = path.join(os.tmpdir(), 'Git-mock.exe');
	const contents = 'mock content';

	beforeEach(() => (
		fs.outputFile(file, contents)
	));
	afterEach(() => (
		fs.unlink(file).catch(() => {})
	));
	it('File size too small', async () => {
		await expect(
			check(file, 0xFF, 'mock_hash')
		).to.rejectedWith('unfinished');
		await expect(
			fs.stat(file).then(stats => stats.isFile())
		).eventually.to.be.true;
	});
	// Promise.resolve(2 + 2).should.eventually.equal(4);
	it('File size too large', async () => {
		await expect(
			check(file, 1, 'mock_hash')
		).to.rejectedWith('size');
		await expect(
			fs.stat(file)
		).to.rejectedWith('no such file or directory');
	});

	it('Bad Hash mismatched', async () => {
		await expect(
			check(file, Buffer.byteLength(contents), 'mock_hash')
		).to.rejectedWith('hash');
		await expect(
			fs.stat(file)
		).to.rejectedWith('no such file or directory');
	});
});

describe('git download', () => {
	beforeEach(() => {
		delete process.env.GIT4WIN_MIRROR;
		delete process.env.npm_config_git4win_mirror;
		cp.spawnSync('del', [path.join(os.tmpdir(), 'Git*.exe')], {
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
