const cp = require('child_process');
const osHomedir = require('os-homedir');
const path = require('path');
const fs = require('fs-extra');

const gitPaths = {
	// by install default
	'ProgramFiles': 'Git',
	// by install x32 under win x64 default
	'ProgramFiles(x86)': 'Git',
	// by Cmder
	'GIT_INSTALL_ROOT': '',
	// by Cmder
	'CMDER_ROOT': 'vendor/git-for-windows',
};

/**
 * 猜测git安装目录，在常见的安装地址去查询
 *
 * @returns {String|undefined} git安装目录
 */
function guessGitPath () {
	const paths = Object.keys(gitPaths).map((key) => {
		if (process.env[key]) {
			return path.join(process.env[key], gitPaths[key]);
		}
	}).concat([
		// by install default with out Admin
		'AppData/Local/Programs/Git',
		// by SourceTree
		'AppData/Local/Atlassian/SourceTree/git_local',
	].map((subdir) => {
		return path.join(osHomedir(), subdir);
	})).filter(Boolean);

	let gitInstallPath;

	paths.some((path) => {
		let stats;
		try {
			stats = fs.statSync(path);
		} catch (ex) {
			//
		}
		if (stats && stats.isDirectory()) {
			gitInstallPath = path;
		}
		return gitInstallPath;
	});
	return gitInstallPath;
}

/**
 * 在注册表中查询git安装位置
 *
 * @returns {String|undefined} git安装目录
 */
function readRegGitInstallPath () {
	let output;
	try {
		output = cp.spawnSync('REG', ['QUERY', 'HKLM\\SOFTWARE\\GitForWindows', '/v', 'InstallPath']).output;
	} catch (ex) {
		//
	}

	if (output && output[1] && /\bInstallPath\s+\w+\s+(.+?)\r?\n/.test(output[1].toString())) {
		return RegExp.$1;
	}
}

/**
 * 使用where命令查找git安装文件夹
 *
 * @returns {String|undefined} git安装目录
 */
function whereIsGit () {
	let output;
	try {
		output = cp.spawnSync('where', ['git']).output;
	} catch (ex) {
		//
	}

	if (output && output[1] && /^(.+?)\\cmd\\git.exe$/i.test(output[1].toString().trim())) {
		return RegExp.$1;
	}
}

module.exports = function () {
	return whereIsGit() || readRegGitInstallPath() || guessGitPath();
};
