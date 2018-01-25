'use strict';
const updateShell = require('../src/update-shell');
const gitInstallPath = require('../src/index');
const spawn = require('../src/spawn');
const expect = require('chai').expect;
const fs = require('fs-extra');
const path = require('path');

describe('update shell', () => {
	it('mock shell path', async () => {
		await updateShell('C:\\mock');
		const bashCmd = await fs.readFile('bin/bash.cmd', 'utf8');
		expect(bashCmd).to.match(/^@set "GIT_INSTALL_ROOT=C:\\mock"$/m);
	});

	it('default shell path', async () => {
		await updateShell();
		const bashCmd = await fs.readFile('bin/bash.cmd', 'utf8');
		expect(bashCmd).to.match(/^@set "GIT_INSTALL_ROOT=%ProgramFiles%\\Git"$/m);
	});

	it('real shell path', async () => {
		await updateShell(gitInstallPath);
		const bashCmd = await fs.readFile('bin/bash.cmd', 'utf8');
		expect(bashCmd).to.match(/^@set "GIT_INSTALL_ROOT=(.*)"$/m);
		expect(RegExp.$1).to.equal(gitInstallPath);
	});

	it('run posix command', async () => {
		const result = await spawn(
			path.resolve('bin/bash.cmd'),
			[
				'-c',
				'echo $(git ls-files | grep ^test\\/\\.*\\.js$)',
			],
			{
				stdio: null,
			}
		);
		expect(result).to.match(/^(test\/.+?\.js )+test\/.+?\.js\n$/);
	});
});
