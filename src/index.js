"use strict";
const gitPath = require("./git-path");
const cp = require("child_process");
const assert = require("assert");
const path = require("path");
const os = require("os");
const rePathSep = /[\\/]+/g;
const rePathTilde = /^~(?=[/\\]|$)/;

function toPosix (path) {
	return path.replace(rePathSep, "/");
}

function rightPath (absPath) {
	return absPath.slice(RegExp.lastMatch.length);
}

class Cygwin {
	constructor (root) {
		root = root ? path.win32.resolve(root) : gitPath.getGitDir();
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
			"/usr/bin/mount",
			"/bin/mount",
		].find(file => {
			mount = cp.spawnSync(path.join(root, file + ".exe"), spawnOpts).stdout;
			return mount;
		});
		mount = mount && mount.split(/\r?\n/g).map(fs => {
			fs = /^(.+?)\s+on\s+(.+?)\s+type/.exec(fs);
			if (!fs || fs[2] === "/") {
				return;
			}
			if (/^[A-Z]:$/.test(fs[1]) && fs[2].endsWith("/" + fs[1][0].toLowerCase())) {
				this.cygdrive = fs[2].slice(0, -2);
				return;
			}
			return [fs[2], this.resolve(fs[1]) || fs[1]];
		}).filter(Boolean);
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
		for (let i = args.length - 1; i >= 0; i--) {
			if (path.posix.isAbsolute(args[i])) {
				let absPath = path.posix.join(...args.slice(i).map(toPosix));
				const ctgPath = /^((?:\/.+?)?)\/([a-z]):*(?=\/|$)/i.exec(absPath);
				if (ctgPath && (ctgPath[1].endsWith("/cygdrive") || ctgPath[1] === "/mnt" || ctgPath[1] === this.cygdrive)) {
					absPath = path.win32.join(ctgPath[2].toUpperCase() + ":", absPath.slice(ctgPath[0].length) || "/");
					return this.fixPosixRoot(absPath) || absPath;
				}
				return this.fixMinGWPath(absPath);
			} else if (/^[A-Z]:/i.test(args[i])) {
				args[i] = args[i][0].toUpperCase() + ":/" + args[i].slice(2);
				const absPath = path.win32.join(...args.slice(i));
				return this.fixPosixRoot(absPath) || absPath;
			} else if (rePathTilde.test(args[i])) {
				args[i] = "/" + args[i].slice(1);
				const absPath = path.posix.join(...args.slice(i).map(toPosix));
				return this.fixPosixRoot(path.win32.join(process.env.HOME || os.homedir(), absPath)) || absPath.replace(/^(?:\/+$)?/, "~");
			}
		}
		if (args.length) {
			return path.join(...args.map(toPosix));
		} else {
			return "";
		}
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

		if (path.posix.isAbsolute(file)) {
			file = path.win32.join(this.root, file);
		} else if (rePathTilde.test(file)) {
			file = path.win32.join("%HOME%", file.slice(1));
		} else {
			file = path.win32.normalize(file);
		}

		return file;
	}

	toPosix (...args) {
		let file = this.resolve(...args);
		if (!file) {
			return file;
		}
		if (/^[A-Z]:+/i.test(file)) {
			file = path.posix.join(this.cygdrive || "/", file[0].toLowerCase(), toPosix(rightPath(file)));
		}
		return file;
	}
}
const git = new Cygwin();
module.exports = git;
