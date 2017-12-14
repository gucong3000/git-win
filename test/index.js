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

describe('git path', () => {
	const git = require('../src/');
	const gitPath = require('../src/git-path.js');

	it('get git dir', () => {
		expect(git).to.be.a('string');
	});

	it('git dir exist', async () => {
		await expect(
			fs.stat(git).then(stats => stats.isDirectory())
		).eventually.to.be.true;
	});

	it('get git dir by `PATH` env', () => {
		expect(
			gitPath.getGitDirByPathEnv()
		).to.equal(git);
	});

	it('get git dir form registry', () => {
		expect(
			gitPath.getGitDirByRegstry() || gitPath.getGitDirByRegstry(64) || gitPath.getGitDirByRegstry(32)
		).to.equal(git);
	});

	it('lookup for git dir', () => {
		expect(
			gitPath.lookupGitDir()
		).to.equal(git);
	});
});

describe('get release', () => {
	it('use cache when network failure', async () => {
		const getRelease = proxyquire('../src/get-release', {
			got: () => (
				Promise.reject(new Error('Network failure'))
			),
		});
		await expect(
			getRelease(2)
		).eventually.to.have.property('id', 8710511);
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
	beforeEach(async () => {
		delete process.env.GIT4WIN_MIRROR;
		delete process.env.npm_config_git4win_mirror;
		if (process.env.CI) {
			await cp.spawnSync('del', [path.join(os.tmpdir(), 'Git*.exe')], {
				shell: true,
			});
		}
	});

	if (process.env.CI) {
		it('2.13.0 @ github', async () => {
			const file = await download('2.13.0');

			expect(file).to.match(/\\Git-2\.13\.0-\w+-bit\.exe$/);

			await expect(
				fs.stat(file).then(stats => stats.isFile())
			).eventually.to.be.true;

			await expect(
				download('2.13.0')
			).eventually.to.equal(file);
		});
		it('latest @ github', async () => {
			process.env.GIT4WIN_MIRROR = 'https://github.com/git-for-windows/git/releases/download/';
			const file = await download();

			expect(file).to.match(/\\Git-(?:\d+\.)+\d-\w+-bit\.exe$/);

			await expect(
				fs.stat(file).then(stats => stats.isFile())
			).eventually.to.be.true;
		});
	} else {
		it('2.13.0 @ npm.taobao.org', async () => {
			process.env.GIT4WIN_MIRROR = 'https://npm.taobao.org/mirrors/git-for-windows/';
			const file = await download('2.13.0');

			expect(file).to.match(/\\Git-2\.13\.0-\w+-bit\.exe$/);

			await expect(
				fs.stat(file).then(stats => stats.isFile())
			).eventually.to.be.true;

			await expect(
				download('2.13.0')
			).eventually.to.equal(file);
		});
		it('latest @ npm.taobao.org', async () => {
			process.env.GIT4WIN_MIRROR = 'https://npm.taobao.org/mirrors/git-for-windows/';

			const file = await download();

			expect(file).to.match(/\\Git-(?:\d+\.)+\d-\w+-bit\.exe$/);

			await expect(
				fs.stat(file).then(stats => stats.isFile())
			).eventually.to.be.true;
		});
	}
});
