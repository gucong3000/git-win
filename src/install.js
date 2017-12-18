'use strict';
const gitPath = require('./git-path');
const inst = require('./inst.js');
const spawn = require('./spawn');
const path = require('path').win32;

async function installGit () {
	let gitInstallPath;
	while (!(gitInstallPath = gitPath.getGitDir())) {
		await inst();
	}
	return gitInstallPath;
}
async function npmrc (gitInstallPath) {
	const shell = path.join(gitInstallPath, 'usr/bin/bash.exe');
	if (process.env.npm_config_script_shell === shell) {
		return;
	}

	await spawn(
		'npm.cmd',
		[
			'config',
			'--global',
			'set',
			'script-shell',
			shell,
		]
	);
}

module.exports = installGit().then(npmrc).catch(console.error);
