"use strict";
const gitPath = require("./git-path");
const cp = require("child_process");
const assert = require("assert");
const path = require("path");
const rePathSep = /[\\/]+/g;
const {
	win32: pathWin32,
	posix: pathPosix,
} = path;
const etcPath = pathWin32.join.bind(
	pathWin32,
	[
		process.env.windir,
		process.env.SystemRoot,
		"C:/Windows",
	].find(Boolean) + "/System32/drivers/etc"
);
const etcMount = [
	["/etc/protocols", etcPath("protocol")],
	["/etc/hosts", etcPath("hosts")],
	["/etc/networks", etcPath("networks")],
	["/etc/services", etcPath("services")],
];

function toPosix (strPath) {
	return strPath.replace(rePathSep, "/");
}

function rightPath (absPath) {
	return absPath.slice(RegExp.lastMatch.length);
}

class Cygwin {
	constructor (root) {
		root = root ? pathWin32.resolve(root) : gitPath.getGitDir();
		assert.ok(root, "Git not found, please install Git and try again.\nhttps://git-for-windows.github.io/\nhttps://npm.taobao.org/mirrors/git-for-windows/");

		this.root = root;

		this.reRoot = new RegExp(`^${root.replace(/\W/g, s => (
			s === "\\" ? rePathSep.source : "\\" + s
		))}(?:${rePathSep.source}|$)`, "i");

		this.cygdrive = "/cygdrive";

		const spawnOpts = {
			encoding: "utf8",
		};

		let mount;
		[
			"usr/bin/mount",
			"bin/mount",
		].find(file => {
			file = gitPath.findFile(root, file + ".exe") || file;
			mount = cp.spawnSync(file, spawnOpts).stdout;
			return mount;
		});
		mount = etcMount.concat(
			mount && mount.split(/\r?\n/g).map(fs => {
				fs = /^(.+?)\s+on\s+(.+?)\s+type/.exec(fs);
				if (!fs || fs[2] === "/") {
					return;
				}
				if (/^[A-Z]:$/.test(fs[1]) && fs[2].endsWith("/" + fs[1][0].toLowerCase())) {
					this.cygdrive = fs[2].slice(0, -2);
					return;
				}
				return [fs[2], this.resolve(fs[1]) || fs[1]];
			})
		).filter(Boolean);
		this.mount = new Map(mount);
	}

	get mingw () {
		return gitPath.getMingwDir(this.root);
	}

	fixPosixRoot (absPath) {
		if (
			[
				this.reRoot,
				/^[A-Z]:[\\/]+Program\s+Files(?:\s+\(x\d+\))?[\\/]+Git(?:[\\/]+|$)/i,
				/^[A-Z]:[\\/]+cygwin\d+(?:[\\/]+|$)/i,
			].some(regexp => regexp.test(absPath))
		) {
			return this.fixMinGWPath("/" + toPosix(rightPath(absPath)));
		}
	}

	fixMinGWPath (absPath) {
		if (this.mingw && /^[/\\]mingw\d+(?=[/\\]|$)/.test(absPath)) {
			absPath = "/" + this.mingw + rightPath(absPath);
		}
		return absPath;
	}

	resolve (...args) {
		args = args.filter(Boolean);
		if (!args.length) {
			return "";
		}
		for (let i = args.length - 1; i >= 0; i--) {
			if (pathPosix.isAbsolute(args[i])) {
				let absPath = pathPosix.resolve(...args.slice(i).map(toPosix));
				const cygPath = /^((?:\/.+?)?)\/([a-z]):*(?=\/|$)/i.exec(absPath);
				if (cygPath && (cygPath[1].endsWith("/cygdrive") || cygPath[1] === "/mnt" || cygPath[1] === this.cygdrive)) {
					absPath = pathWin32.join(cygPath[2].toUpperCase() + ":", absPath.slice(cygPath[0].length) || "/");
					return this.fixPosixRoot(absPath) || absPath;
				}
				return this.fixMinGWPath(absPath);
			} else if (/^[A-Z]:/i.test(args[i])) {
				args[i] = args[i].replace(/^[a-z](?=:)/, (s) => s.toUpperCase());
				const reDevice = new RegExp(`^${args[i][0]}:${rePathSep.source}`, "i");
				if (
					!args.slice(0, i).some(arg => reDevice.test(arg))
				) {
					args[i] = args[i][0] + ":/" + args[i].slice(2);
				}
				const absPath = pathWin32.resolve(...args);
				return this.fixPosixRoot(absPath) || absPath;
			} else if (/^~(?=\/|$)/.test(args[i])) {
				args[i] = args[i].slice(1);
				const absPath = pathPosix.resolve("/", ...args.slice(i).map(toPosix));
				/* eslint-disable-next-line no-template-curly-in-string */
				return absPath.replace(/^(?:\/+$)?/, "${HOME}");
			}
		}
		return this.fixPosixRoot(path.resolve(...args)) || path.join(...args.map(toPosix));
	}

	toWin32 (...args) {
		let file = this.resolve(...args);
		if (!file) {
			return file;
		}

		for (const [prefix, path] of this.mount) {
			if (file.startsWith(prefix)) {
				if (file.length === prefix.length) {
					file = path;
					break;
				} else if (rePathSep.test(file[prefix.length])) {
					file = path + file.slice(prefix.length);
					break;
				}
			}
		}

		if (pathPosix.isAbsolute(file)) {
			file = pathWin32.join(this.root, file);
		} else if (/^\$\{HOME\}(?=\/|$)/.test(file)) {
			file = pathWin32.join("%HOME%", rightPath(file));
		} else {
			file = pathWin32.normalize(file);
		}

		return file;
	}

	toPosix (...args) {
		let file = this.resolve(...args);
		if (!file) {
			return file;
		}
		if (/^[A-Z]:+/i.test(file)) {
			file = pathPosix.join(this.cygdrive || "/", file[0].toLowerCase(), toPosix(rightPath(file)));
		}
		return file;
	}
}
const git = new Cygwin();
module.exports = git;
