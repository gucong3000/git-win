"use strict";
const expect = require("chai").expect;
const fs = require("fs-extra");
const path = require("path");
const os = require("os");
const gitPath = require("../src/git-path");
const gitWin = require("../src/");

function fsStat (path) {
	if (process.platform !== "win32") {
		path = path.replace(/[\\/]+/g, "/").replace(/^\w+:/, s => "/mnt/" + s[0].toLowerCase());
	}
	return fs.stat(path);
}

describe("git path", () => {
	it("get git dir", async () => {
		expect(gitWin.root).to.be.a("string");
		expect(path.win32.resolve(gitWin.root)).to.equal(gitWin.root);
		// expect(gitWin.root).to.equal(undefined);
		expect((await fsStat(gitWin.root)).isDirectory()).to.equal(true);
		expect((await fsStat(path.join(gitWin.root, gitWin.mingw))).isDirectory()).to.equal(true);
		expect(gitWin.mingw).to.be.a("string");
		expect(gitWin.mingw).to.match(/^mingw(32|64)$/);
	});

	describe("get git dir by `PATH` env", () => {
		const gitRoot = "/mnt/" + gitWin.root[0].toLowerCase() + gitWin.root.slice(2).replace(/\\/g, "/");
		[
			gitRoot + "/cmd",
			gitRoot + "/usr/bin",
			gitRoot + "/usr/bin/core_perl",
			gitRoot + "/usr/bin/vendor_perl",
			gitRoot + "/bin",
			gitRoot + "/mingw64/bin",
			gitRoot.slice(4) + "/cmd",
			gitRoot.slice(4) + "/usr/bin",
			gitRoot.slice(4) + "/usr/bin/core_perl",
			gitRoot.slice(4) + "/usr/bin/vendor_perl",
			gitRoot.slice(4) + "/bin",
			gitRoot.slice(4) + "/mingw64/bin",
		].forEach(PATH => {
			it(PATH, () => {
				expect(
					gitPath.getGitDirByPathEnv(PATH)
				).to.equal(gitWin.root);
			});
		});

		it("gitPath.getGitDirByPathEnv()", () => {
			expect(
				gitPath.getGitDirByPathEnv()
			).to.equal(gitWin.root);
		});
	});

	it("get git dir form registry", () => {
		expect(
			gitPath.getGitDirByRegstry() || gitPath.getGitDirByRegstry(64) || gitPath.getGitDirByRegstry(32)
		).to.equal(gitWin.root);
	});

	it("get git mingw dir", () => {
		delete require.cache[require.resolve("../src/git-path")];
		const gitPath = require("../src/git-path");
		expect(
			gitPath.getMingwDir(gitWin.root)
		).to.equal(gitWin.mingw);
	});

	it("lookup for git dir", () => {
		if (process.platform === "win32") {
			expect(
				gitPath.lookupGitDir()
			).to.equal(gitWin.root);
		} else {
			expect(
				gitPath.lookupGitDir([
					"C:\\Program Files\\Git",
				])
			).to.equal(gitWin.root);
		}
		expect(
			gitPath.lookupGitDir([
				gitWin.root.replace(/\\/g, "/"),
			])
		).to.equal(gitWin.root);
		expect(
			gitPath.lookupGitDir([
				gitWin.root[0].toLowerCase() + gitWin.root.slice(1),
			])
		).to.equal(gitWin.root);
		expect(
			gitPath.lookupGitDir([
				path.posix.join("/mnt", gitWin.root[0].toLowerCase(), gitWin.root.slice(3).replace(/\\/g, "/")),
			])
		).to.equal(gitWin.root);
		expect(
			gitPath.lookupGitDir([
				path.posix.join(gitWin.root[0].toLowerCase(), gitWin.root.slice(3).replace(/\\/g, "/")),
			])
		).to.equal(undefined);
		console.log(path.posix.join(gitWin.root[0].toLowerCase(), gitWin.root.slice(3).replace(/\\/g, "/")));
	});
});

describe("resolve path", () => {
	[
		gitWin.root,
		gitWin.root + "\\",
		gitWin.root.replace(/\\/g, "/"),
		gitWin.root.replace(/\\/g, "/") + "///",
		"x:/program files/git",
		"X:/Program Files/Git",
		"X:/Program Files/Git/",
		"X:\\Program Files\\Git",
		"X:\\Program Files\\Git\\",
		"x:\\cygwin64",
		"X:\\cygwin64",
		"X:\\cygwin64\\",
	].forEach((root) => {
		it(`gitWin.resolve("${root}")`, () => {
			expect(
				gitWin.resolve(root)
			).to.equal("/");
		});
	});

	it("gitWin.toWin32(\"/bin/sh\")", () => {
		expect(
			gitWin.toWin32("/bin/sh")
		).to.equal(path.win32.join(gitWin.root, "/usr/bin/sh"));
	});

	it("gitWin.resolve(\"/bin/bash\")", () => {
		expect(
			gitWin.toWin32("/bin/bash")
		).to.equal(path.win32.join(gitWin.root, "/usr/bin/bash"));
	});

	it("gitWin.toWin32(\"/bin/dash\")", () => {
		expect(
			gitWin.toWin32("/bin/dash")
		).to.equal(path.win32.join(gitWin.root, "/usr/bin/dash"));
	});

	it("gitWin.toPosix(\"/bin/dash\")", () => {
		expect(
			gitWin.toPosix("/bin/dash")
		).to.equal("/bin/dash");
	});

	it("gitWin.resolve(\"/c\")", () => {
		expect(
			gitWin.resolve("/c")
		).to.equal("C:\\");
	});

	it("gitWin.resolve(\"c:\")", () => {
		expect(
			gitWin.resolve("c:")
		).to.equal("C:\\");
	});

	it("gitWin.toWin32(\"/c\")", () => {
		expect(
			gitWin.toWin32("/c")
		).to.equal("C:\\");
	});

	it("gitWin.toWin32(\"c:\")", () => {
		expect(
			gitWin.toWin32("c:")
		).to.equal("C:\\");
	});

	it("gitWin.resolve(\"c:\\\")", () => {
		expect(gitWin.resolve("c:\\")).to.equal("C:\\");
	});

	it("gitWin.toWin32(\"c:\\\")", () => {
		expect(gitWin.toWin32("c:\\")).to.equal("C:\\");
	});

	if (!path.posix.isAbsolute(os.tmpdir())) {
		it("gitWin.toWin32(\"/tmp\")", () => {
			expect(
				gitWin.toWin32("/tmp")
			).to.equal(os.tmpdir());
		});
	}

	it("gitWin.toWin32(\"~/\")", () => {
		expect(
			gitWin.toWin32("~/")
		).to.equal("%HOME%");
	});

	it("gitWin.resolve(\"~////\")", () => {
		expect(
			gitWin.resolve("~////")
		).to.equal("~");
	});

	it("gitWin.resolve(\"~\")", () => {
		expect(
			gitWin.resolve("~")
		).to.equal("~");
	});

	[
		"mingw00/bin/curl",
		"mingw64/bin/curl",
		"mingw32/bin/curl",
	].forEach((curl) => {
		const file = path.win32.join(gitWin.root, curl);
		it(`gitWin.resolve("${file}")`, () => {
			expect(
				gitWin.resolve(file)
			).to.equal("/" + gitWin.mingw + "/bin/curl");
		});
	});

	const mixedRoot = gitWin.root.slice(2).replace(/\\/g, "/");
	[
		"/cygdrive/" + gitWin.root[0].toLowerCase() + mixedRoot,
		"/" + gitWin.root[0].toLowerCase() + mixedRoot,
		"/cygdrive/" + gitWin.root[0].toLowerCase() + mixedRoot,
		"/" + gitWin.root[0].toLowerCase() + mixedRoot,
	].forEach((root) => {
		const file = root + "/usr/bin/bash";
		it(`gitWin.resolve("${file}")`, () => {
			expect(
				gitWin.resolve(file)
			).to.equal("/usr/bin/bash");
		});
	});

	it("gitWin.resolve(\"/mnt/x/app/Git\")", () => {
		expect(
			gitWin.resolve("/mnt/x/app/Git")
		).to.equal("X:\\app\\Git");
	});

	const file = gitWin.root + "bin/bash";
	it(`gitWin.resolve("${file}")`, () => {
		expect(
			gitWin.resolve(file)
		).to.equal(path.win32.normalize(file));
	});

	it("gitWin.resolve(\"bin/sh\")", () => {
		expect(
			gitWin.resolve("bin/sh")
		).to.equal(path.normalize("bin/sh"));
	});

	it("gitWin.resolve(\"bin/bash\")", () => {
		expect(
			gitWin.resolve("bin/bash")
		).to.equal(path.normalize("bin/bash"));
	});

	it("gitWin.toWin32(\"bin/sh\")", () => {
		expect(
			gitWin.toWin32("bin/sh")
		).to.equal("bin\\sh");
	});

	it("gitWin.toWin32(\"bin/bash\")", () => {
		expect(
			gitWin.toWin32("bin/bash")
		).to.equal("bin\\bash");
	});

	it("gitWin.toWin32(\"/binx/xxx\")", () => {
		expect(
			gitWin.toWin32("/binx/xxx")
		).to.equal(path.win32.join(gitWin.root, "/binx/xxx"));
	});

	it("gitWin.toWin32(\"\")", () => {
		expect(
			gitWin.toWin32("")
		).to.equal("");
	});

	it("gitWin.toPosix(\"\")", () => {
		expect(
			gitWin.toPosix("")
		).to.equal("");
	});

	it("gitWin.mingw", async () => {
		expect((await fsStat(`${gitWin.root}\\${gitWin.mingw}\\bin\\curl.exe`)).isFile()).to.equal(true);
	});

	[
		"/mingw00/",
		"/mingw64/",
		"/mingw32/",
		"/mingw00",
		"/mingw64",
		"/mingw32",
	].map((mingw) => {
		it(`gitWin.resolve("${mingw}")`, () => {
			expect(gitWin.resolve(mingw)).to.equal("/" + gitWin.mingw);
		});
		const posixCurl = `/${gitWin.mingw}/bin/curl`;
		const win32Curl = path.win32.join(gitWin.root, gitWin.mingw, "/bin/curl");
		it(`gitWin.resolve("${mingw}/bin/curl")`, () => {
			expect(gitWin.resolve(`${mingw}/bin/curl`)).to.equal(posixCurl);
			expect(gitWin.toWin32(`${mingw}/bin/curl`)).to.equal(win32Curl);
		});
	});

	[
		"/mingw",
		"/mingwX",
		"/Xmingw",
		"/mingw_",
		"/_mingw",
	].map((dir) => {
		const win32Path = path.win32.join(gitWin.root, dir);

		it(`gitWin.resolve("${dir}")`, () => {
			expect(gitWin.resolve(dir)).to.equal(dir);
		});
		it(`gitWin.resolve("${win32Path}")`, () => {
			expect(gitWin.resolve(win32Path)).to.equal(dir);
		});
		it(`gitWin.toWin32("${dir}")`, () => {
			expect(gitWin.toWin32(dir)).to.equal(win32Path);
		});
		it(`gitWin.toWin32("${win32Path}")`, () => {
			expect(gitWin.toWin32(win32Path)).to.equal(win32Path);
		});
	});

	const ComSpec = "C:\\Windows\\system32\\cmd.exe";
	it(`gitWin.resolve("${ComSpec}")`, () => {
		expect(gitWin.resolve(ComSpec)).to.equal(ComSpec);
	});
	it(`gitWin.toWin32("${ComSpec}")`, () => {
		expect(gitWin.toWin32(ComSpec)).to.equal(ComSpec);
	});
	it(`gitWin.toPosix("${ComSpec}")`, () => {
		expect(gitWin.toPosix(ComSpec)).to.equal("/c/Windows/system32/cmd.exe");
	});
	const cygComSpec = "/cygdrive/c/Windows/system32/cmd.exe";
	it(`gitWin.resolve("${cygComSpec}")`, () => {
		const comSpec = gitWin.resolve(cygComSpec);
		expect(comSpec).to.equal(ComSpec);
	});
	it(`gitWin.toWin32("${cygComSpec}")`, () => {
		const comSpec = gitWin.toWin32(cygComSpec);
		expect(comSpec).to.equal(ComSpec);
	});
	it(`gitWin.toPosix("${cygComSpec}")`, () => {
		expect(gitWin.toPosix(ComSpec)).to.equal("/c/Windows/system32/cmd.exe");
	});
});

describe("gitWin.toWin32()", () => {
	[
		[["c:/blah\\blah", "d:/games", "c:../a"], "C:\\blah\\a"],
		[["c:/ignore", "d:\\a/b\\c/d", "\\e.exe"], "D:\\e.exe"],
		[["c:/ignore", "c:/some/file"], "C:\\some\\file"],
		[["d:/ignore", "d:some/dir//"], "D:\\ignore\\some\\dir"],
		[["."], "."],
		// [["\\\\server/share", "..", "relative\\"], "\\\\server\\share\\relative"],
		[["c:/", "\\"], "C:\\"],
		[["c:/", "dir"], "C:\\dir"],
		[["c:/", "some//dir"], "C:\\some\\dir"],
		[["C:\\foo\\tmp.3\\", "..\\tmp.3\\cycles\\root.js"], "C:\\foo\\tmp.3\\cycles\\root.js"],
		[["c:/", "~/some/dir"], "%HOME%\\some\\dir"],
		[["c:/", "~/some//dir"], "%HOME%\\some\\dir"],
		[["c:/", "~\\some\\dir"], "%HOME%\\some\\dir"],
	].forEach(testCase => {
		it(JSON.stringify(testCase[0]) + " => " + testCase[1], () => {
			expect(gitWin.toWin32(...testCase[0])).to.equal(testCase[1]);
		});
	});
});

describe("gitWin.toPosix()", () => {
	[
		[["/var/lib", "../", "file/"], "/var/file"],
		[["/var/lib", "/../", "file/"], "/file"],
		[["a/b/c/", "../../.."], "."],
		[["."], "."],
		[["/some/dir", ".", "/absolute/"], "/absolute"],
		[["/foo/tmp.3/", "../tmp.3/cycles/root.js"], "/foo/tmp.3/cycles/root.js"],
		[["/foo/", "~/bar"], "~/bar"],
		[["~/foo/", "~/bar"], "~/bar"],
		[["~/foo/", "/bar"], "/bar"],
	].forEach(testCase => {
		it(JSON.stringify(testCase[0]) + " => " + testCase[1], () => {
			expect(gitWin.toPosix(...testCase[0])).to.equal(testCase[1]);
		});
	});
});
