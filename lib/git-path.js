var child_process = require('child_process');
var osHomedir = require('os-homedir');
var path = require('path');
var fs = require('fs');

var gitPaths = {
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
function guessGitPath() {
	var paths = Object.keys(gitPaths).map(function(key) {
		if(process.env[key]) {
			return path.join(process.env[key], gitPaths[key]);
		}
	}).concat([
		// by install default with out Admin
		'AppData/Local/Programs/Git',
		// by SourceTree
		'AppData/Local/Atlassian/SourceTree/git_local',
	].map(function(subdir) {
		return path.join(osHomedir(), subdir);
	})).filter(Boolean);

	var gitInstallPath;

	paths.some(function(path) {
		var stats;
		try {
			stats = fs.statSync(path);
		} catch(ex) {
			//
		}
		if(stats && stats.isDirectory()) {
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
function readRegGitInstallPath() {
	var output;
	try {
		output = child_process.spawnSync('REG', ['QUERY', 'HKLM\\SOFTWARE\\GitForWindows', '/v', 'InstallPath']);
	} catch(ex) {
		//
	}

	if(output && /\bInstallPath\s+\w+\s+(.+?)\r?\n/.test(output.toString())) {
		return RegExp.$1;
	}
}

/**
 * 使用where命令查找git安装文件夹
 *
 * @returns {String|undefined} git安装目录
 */
function whereIsGit() {
	var output;
	try {
		output = child_process.spawnSync('where', ['git']);
	} catch(ex) {
		//
	}

	if(output && /^(.+?)\\cmd\\git.exe$/i.test(output.toString().trim())) {
		return RegExp.$1;
	}
}

module.exports = function() {
	return whereIsGit() || readRegGitInstallPath() || guessGitPath();
};
