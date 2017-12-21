'use strict';
const download = require('./download');
const gitPath = require('./git-path');
const spawn = require('./spawn');
const path = require('path');

async function getGitInstallVersion (gitInstallPath) {
	const stdout = await spawn(
		path.join(
			gitInstallPath,
			'cmd/git.exe'
		),
		[
			'--version',
		],
		{
			stdio: 'pipe',
		}
	).catch(() => '');
	if (stdout && /^(?:\w+\s+)+?(\d+\..+?)$/im.test(stdout)) {
		return RegExp.$1;
	}
}

async function installGit (version) {
	const gitInstallPath = gitPath.getGitDir();
	const gitInstallVersion = gitInstallPath && await getGitInstallVersion(gitInstallPath);
	if (gitInstallPath && (version ? gitInstallVersion.startsWith(version) : gitInstallVersion)) {
		return gitInstallPath;
	}

	const setuppack = await download(version);
	console.log('Waiting for git installation to complete.');
	await spawn(setuppack, [
		'/VERYSILENT',
		'/NORESTART',
		'/NOCANCEL',
		'/SP-',
		// '/COMPONENTS="icons,icons\\quicklaunch,ext,ext\\shellhere,ext\\guihere,assoc,assoc_sh"',
	], {
		stdio: 'inherit',
	});
	console.log('Installation complete.');

	return installGit(version);
}

module.exports = installGit;

if (process.mainModule === module) {
	installGit(process.env.npm_config_git_version).catch(console.error);
}
