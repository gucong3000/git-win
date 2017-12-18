'use strict';
const expect = require('chai').expect;
const proxyquire = require('proxyquire');
// const fs = require('fs-extra');

describe('git install', () => {
	it('should update npmrc', async () => {
		let errCount = 0;
		let cmdArgs;
		delete process.env.npm_config_script_shell;

		await proxyquire('../src/install', {
			'./git-path': {
				getGitDir: () => {
					if (errCount > 3) {
						return 'C:\\mock\\Git';
					}
				},
			},
			'./inst.js': () => {
				errCount++;
			},
			'./spawn': (cmd, args) => {
				cmdArgs = args[args.length - 1];
			},
		});
		expect(cmdArgs).to.be.equal('C:\\mock\\Git\\usr\\bin\\bash.exe');
	});
	it('should not update npmrc', async () => {
		let errCount = 0;
		let cmdArgs;
		process.env.npm_config_script_shell = 'C:\\mock\\Git\\usr\\bin\\bash.exe';

		await proxyquire('../src/install', {
			'./git-path': {
				getGitDir: () => {
					if (errCount > 3) {
						return 'C:\\mock\\Git';
					}
				},
			},
			'./inst.js': () => {
				errCount++;
			},
			'./spawn': (cmd, args) => {
				cmdArgs = args[args.length - 1];
			},
		});
		expect(cmdArgs).to.be.undefined;
	});
});
