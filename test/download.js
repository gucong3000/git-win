'use strict';
const expect = require('chai').expect;
const download = require('../src/download');
const cp = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const os = require('os');

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
