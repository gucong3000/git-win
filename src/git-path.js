"use strict";
const cp = require("child_process");
const osArch = require("./os-arch");
const path = require("path");
const fs = require("fs");
const reEnvKey = /%(.+?)%/g;
const mingwVal = {};
const hasFileCache = {};
const isWin32 = process.platform === "win32";
const regExe = isWin32 ? path.win32.join(process.env.SystemRoot || process.env.windir || "C:/Windows", "System32/reg.exe") : "reg.exe";

/**
 * Query Git install dir from registry
 * @param arch {String} 64/32 architecture
 * @returns {String|undefined} Git install dir
 */
function getGitDirByRegstry (arch) {
	const args = [
		"QUERY",
		"HKLM\\SOFTWARE\\GitForWindows",
	];

	if (arch && osArch === "64") {
		args.push("/reg:" + arch);
	}

	const regQuery = cp.spawnSync(regExe, args, {
		encoding: "utf8",
	});
	if (regQuery.stdout && /^\s*InstallPath\s+REG(?:_[A-Z]+)+\s+(.+?)$/im.test(regQuery.stdout)) {
		let gitDir = RegExp.$1;
		const reMingw = new RegExp(`\\s+${gitDir.replace(/(\W)/g, "\\$1")}\\\\(mingw\\d+)(?:\\\\|$)`, "im");
		gitDir = pathResolve(gitDir);
		if (reMingw.test(regQuery.stdout)) {
			mingwVal[gitDir.toLowerCase()] = RegExp.$1;
		};

		return gitDir;
	}
}

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

function findGitDir (dirs) {
	const result = [];
	const has = {};
	dirs.forEach((dir) => {
		if (!dir) {
			return;
		}
		try {
			dir = envPathResolve(dir);
		} catch (ex) {
			return;
		}

		dir = pathResolve(dir);

		const key = dir.toLowerCase();
		if (has[key]) {
			return;
		}
		result.push(dir);
		has[key] = true;
	});
	return result.find((dir) => (
		findFile(dir, "cmd/git.exe")
	));
}

function pathResolve (strPath) {
	/* istanbul ignore if */
	if (!isWin32 && path.posix.isAbsolute(strPath)) {
		try {
			strPath = cp.spawnSync("wslpath", ["-w", strPath], {
				encoding: "utf8",
			}).stdout.trim() || strPath;
		} catch (ex) {
			//
		}
	}
	const mntPath = /^([a-z]):+/.exec(strPath) || /^\/(?:.+?\/)?([a-z]):*(?=\/|$)/i.exec(strPath);
	if (mntPath) {
		strPath = mntPath[1].toUpperCase() + ":" + strPath.slice(mntPath[0].length);
	}
	return path.win32.resolve(strPath);
}

/**
 * Guessing git install dir
 *
 * @returns {String|undefined} Git install dir
 */
function lookupGitDir (dirs = [
	// by install default
	"%ProgramW6432%/Git",
	"%ProgramFiles%/Git",
	// by install x32 under win x64 default
	"%ProgramFiles(x86)%/Git",
	// by install default with out Admin
	"%APPDATA%/Programs/Git",
	// by SourceTree
	"%APPDATA%/Atlassian/SourceTree/git_local",
	// by Cmder
	"%GIT_INSTALL_ROOT%",
	// by Cmder
	"%CMDER_ROOT%/vendor/git-for-windows",
]) {
	return findGitDir(dirs);
}

/**
 * Fild Git install dir by PATH env
 *
 * @returns {String|undefined} Git install dir
 */
function getGitDirByPathEnv (PATH = process.env.PATH) {
	const dirs = PATH.split(
		path.delimiter
	).map(dir => (
		dir && (/^(.*[\\/]Git)(?=[\\/]|$)/i.test(dir) || /^(.+?)[\\/]+(?:cmd|(?:usr|mingw\d+)[\\/]+bin)(?=[\\/]|$)/i.test(dir)) && RegExp.$1
	));
	return findGitDir(dirs);
}

function getGitDir () {
	return getGitDirByRegstry(osArch) || (osArch === "64" && getGitDirByRegstry("32")) || getGitDirByPathEnv() || lookupGitDir();
}

function findFile (...args) {
	let filePath = path.win32.resolve(...args);
	const key = filePath;
	if (!(key in hasFileCache)) {
		try {
			/* istanbul ignore if */
			if (!isWin32) {
				filePath = cp.spawnSync("wslpath", [filePath], {
					encoding: "utf8",
				}).stdout.trim();
			}
			hasFileCache[key] = filePath && fs.statSync(filePath).isFile() ? filePath : null;
		} catch (ex) {
			hasFileCache[key] = null;
		}
	}

	return hasFileCache[key];
}

/**
 * Get architecture of Git
 *
 * @param gitDir {String?} 64/32 Git install dir
 * @returns {String|undefined} architecture
 */
function getMingwDir (gitDir) {
	const key = gitDir.toLowerCase();
	if (key in mingwVal) {
		return mingwVal[key];
	}
	let result = [
		"64",
		"32",
	].filter(arch => arch !== osArch);
	result.unshift(osArch);
	result = result.map(arch => "mingw" + arch);
	result = result.find(mingwDir => {
		return findFile(gitDir, mingwDir + "/bin/git.exe");
	});
	mingwVal[key] = result;
	return result;
}

module.exports = {
	getGitDir,
	getGitDirByPathEnv,
	getGitDirByRegstry,
	lookupGitDir,
	getMingwDir,
	findFile,
};
