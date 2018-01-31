'use strict';
const cp = require('child_process');
const path = require('path');
const fs = require('fs-extra');
const reEnvKey = /%(.+?)%/g;

function envPathResolve (strPath) {
	return strPath.replace(
		reEnvKey,
		(s, envKey) => {
			if (process.env[envKey]) {
				s = envPathResolve(process.env[envKey]);
			} else {
				throw envKey;
			}
			return s;
		}
	);
}

function pathResolve (strPath) {
	try {
		return strPath && path.resolve(envPathResolve(strPath));
	} catch (ex) {
		//
	}
}

/**
 * 猜测git安装目录，在常见的安装地址去查询
 *
 * @returns {String|undefined} git安装目录
 */
function lookupGitDir () {
	return [
		// by install default
		'%ProgramW6432%/Git',
		'%ProgramFiles%/Git',
		// by install x32 under win x64 default
		'%ProgramFiles(x86)%/Git',
		// by install default with out Admin
		'%APPDATA%/Programs/Git',
		// by SourceTree
		'%APPDATA%/Atlassian/SourceTree/git_local',
		// by Cmder
		'%GIT_INSTALL_ROOT%',
		// by Cmder
		'%CMDER_ROOT%/vendor/git-for-windows',
	].map(
		pathResolve
	).find((dir) => {
		if (dir) {
			const filePath = path.join(dir, 'cmd/git.exe');
			try {
				return fs.statSync(filePath).isFile();
			} catch (ex) {
				// console.error(filePath, ex);
			}
		}
	});
}

/**
 * 在注册表中查询git安装位置
 * @param platform {String} 64/32 位注册表视图访问的注册表项
 * @returns {String|undefined} git安装目录
 */
function getGitDirByRegstry (platform) {
	const args = [
		'QUERY',
		'HKLM\\SOFTWARE\\GitForWindows',
		'/v',
		'InstallPath',
	];

	if (platform) {
		args.push('/reg:' + platform);
	}

	const regQuery = cp.spawnSync('REG', args);
	if (!regQuery.status && /^\s*InstallPath\s+REG(?:_[A-Z]+)+\s+(.+?)$/m.test(regQuery.stdout.toString())) {
		return RegExp.$1;
	}
}

/**
 * 使用where命令查找git安装文件夹
 *
 * @returns {String|undefined} git安装目录
 */
function getGitDirByPathEnv () {
	const gitDir = process.env.Path.split(
		path.delimiter
	).map(
		pathResolve
	).find(dir => {
		if (dir && /\\cmd\\*$/.test(dir)) {
			const filePath = path.join(dir, 'git.exe');
			try {
				return fs.statSync(filePath).isFile();
			} catch (ex) {
				//
			}
		}
	});
	if (gitDir) {
		return gitDir.replace(/\\cmd\\*$/, '');
	}
}

module.exports = {
	getGitDir: function () {
		return getGitDirByRegstry() || getGitDirByRegstry(64) || getGitDirByRegstry(32) || getGitDirByPathEnv() || lookupGitDir();
	},
	getGitDirByPathEnv,
	getGitDirByRegstry,
	lookupGitDir,
};
