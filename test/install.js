'use strict';
const os = require('os');
const expect = require('chai').expect;
const proxyquire = require('proxyquire');
// const fs = require('fs-extra');

describe('git install', () => {
	let mockVersion;
	let mockInstallDir;
	const install = proxyquire('../src/install', {
		'./git-path': {
			getGitDir: () => mockInstallDir.shift(),
		},
		'./spawn': (cmd, args) => {
			if (cmd.endsWith('\\cmd\\git.exe')) {
				if (mockVersion.length) {
					return Promise.resolve('git version ' + mockVersion.shift());
				}
			} else if (cmd.startsWith(os.tmpdir())) {
				const v = cmd.replace(/^.+\\Git-(.+)-\d+-bit.exe$/i, '$1');
				mockVersion.unshift(v);
				mockInstallDir.unshift('C:\\mock\\' + v + '\\Git');
				return Promise.resolve('');
			}
			return Promise.reject(new Error('mock error'));
		},
	});

	it('should use existed', async () => {
		mockVersion = ['2.15.1.windows.2'];
		mockInstallDir = ['C:\\mock\\2.15.1.windows.2\\Git'];
		const installDir = await install();
		expect(installDir).to.be.equal('C:\\mock\\2.15.1.windows.2\\Git');
	});

	it('should install new', async () => {
		mockVersion = [];
		mockInstallDir = [];
		const installDir = await install();
		expect(installDir).to.be.match(/^C:\\mock\\.+\\Git$/);
	});

	it('should install new when git break', async () => {
		mockVersion = [];
		mockInstallDir = ['C:\\mock\\break\\Git'];
		const installDir = await install();
		expect(installDir).to.be.match(/^C:\\mock\\.+\\Git$/);
	});

	it('should update git', async () => {
		mockVersion = ['2.14.3.windows.1'];
		mockInstallDir = ['C:\\mock\\2.14.3.windows.1\\Git'];
		const installDir = await install('2.15');
		expect(installDir).to.be.match(/^C:\\mock\\2\.15(?:\..+?)?\\Git$/);
	});
});
