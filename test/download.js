"use strict";
const expect = require("chai").expect;
const download = require("../src/download");
const proxyquire = require("proxyquire");
const spawn = require("../src/spawn");
const inGFW = require("in-gfw");
const fs = require("fs-extra");
const path = require("path");
const os = require("os");

describe("git download", () => {
	beforeEach(async () => {
		delete process.env.GIT4WIN_MIRROR;
		delete process.env.npm_config_git4win_mirror;
		if (process.env.CI) {
			await spawn("del", [path.join(os.tmpdir(), "Git*.exe")], {
				shell: true,
			});
		}
	});

	it("2.17", async () => {
		const file = await download("2.17");

		expect(file).to.match(/[\\/]Git-2\.17(?:\.\d+)*-\w+-bit\.exe$/);

		expect(
			(await fs.stat(file)).isFile()
		).to.be.equal(true);

		expect(
			await download("2.17")
		).to.equal(file);
	});

	it("latest", async () => {
		process.env.GIT4WIN_MIRROR = inGFW.osSync() ? "https://npm.taobao.org/mirrors/git-for-windows/" : "https://github.com/git-for-windows/git/releases/download/";
		const file = await download();

		expect(file).to.match(/[\\/]Git-(?:\d+\.)+\d-\w+-bit\.exe$/);

		expect(
			(await fs.stat(file)).isFile()
		).to.be.equal(true);
	});
});

describe("download mock test", () => {
	let CI;
	before(() => {
		CI = process.env.CI;
		delete process.env.CI;
	});
	after(() => {
		process.env.CI = CI;
	});
	beforeEach(async () => {
		delete process.env.GIT4WIN_MIRROR;
		delete process.env.npm_config_git4win_mirror;
		curlError = null;
		nuggetError = null;
		fsMock = {};
	});
	let fsMock;
	let curlError;
	let nuggetError;
	const download = proxyquire("../src/download", {
		"./get-asset": async (version) => {
			const asset = {
				name: `Git-${version}-64-bit.exe`,
			};
			asset.browser_download_url = `https://github.com/git-for-windows/git/releases/download/v${version}.windows.1/${asset.name}`;
			return asset;
		},
		"./check-download": async (file) => {
			if (!fsMock[file]) {
				throw new Error(file);
			}
		},
		"./spawn": async (curl, args) => {
			if (curlError) {
				throw curlError;
			}
			const output = args[args.indexOf("--output") + 1];
			fsMock.dist = output;
			fsMock.url = args[args.length - 1];
			fsMock[fsMock.dist] = fsMock.url;
			fsMock.curl = true;
		},
		"nugget": (url, { target }, cb) => {
			process.nextTick(() => {
				if (nuggetError) {
					cb(nuggetError);
				} else {
					fsMock.dist = target;
					fsMock.url = url;
					fsMock[fsMock.dist] = fsMock.url;
					fsMock.nugget = true;
					cb();
				}
			});
		},
		"in-gfw": {
			net: async () => false,
		},
	});

	it("curl 1.0.0 from github", async () => {
		await download("1.0.0");
		expect(fsMock.curl).to.equal(true);
		expect(fsMock.nugget).to.equal(undefined);
		expect(fsMock.url).to.equal("https://github.com/git-for-windows/git/releases/download/v1.0.0.windows.1/Git-1.0.0-64-bit.exe");
		expect(fsMock.dist.endsWith("Git-1.0.0-64-bit.exe")).to.equal(true);
	});

	it("curl 1.0.0 from taobao", async () => {
		process.env.GIT4WIN_MIRROR = "https://npm.taobao.org/mirrors/git-for-windows/";
		await download("1.0.0");
		expect(fsMock.curl).to.equal(true);
		expect(fsMock.nugget).to.equal(undefined);
		expect(fsMock.url).to.equal("https://npm.taobao.org/mirrors/git-for-windows/v1.0.0.windows.1/Git-1.0.0-64-bit.exe");
		expect(fsMock.dist.endsWith("Git-1.0.0-64-bit.exe")).to.equal(true);
	});

	it("nugget 1.0.0 from github", async () => {
		curlError = Object.assign(new Error("curl"), {
			errno: "ENOENT",
		});
		await download("1.0.0");
		expect(fsMock.nugget).to.equal(true);
		expect(fsMock.curl).to.equal(undefined);
		expect(fsMock.url).to.equal("https://github.com/git-for-windows/git/releases/download/v1.0.0.windows.1/Git-1.0.0-64-bit.exe");
		expect(fsMock.dist.endsWith("Git-1.0.0-64-bit.exe")).to.equal(true);
	});

	it("nugget 1.0.0 from taobao", async () => {
		process.env.GIT4WIN_MIRROR = "https://npm.taobao.org/mirrors/git-for-windows";
		curlError = Object.assign(new Error("curl"), {
			errno: "ENOENT",
		});
		await download("1.0.0");
		expect(fsMock.nugget).to.equal(true);
		expect(fsMock.curl).to.equal(undefined);
		expect(fsMock.url).to.equal("https://npm.taobao.org/mirrors/git-for-windows/v1.0.0.windows.1/Git-1.0.0-64-bit.exe");
		expect(fsMock.dist.endsWith("Git-1.0.0-64-bit.exe")).to.equal(true);
	});

	it("catch curl error", async () => {
		curlError = new Error("curl");
		let catchError;
		try {
			await download("1.0.0");
		} catch (ex) {
			catchError = ex;
		}
		expect(catchError).to.equal(curlError);
	});

	it("catch nugget error", async () => {
		curlError = Object.assign(new Error("curl"), {
			errno: "ENOENT",
		});
		nuggetError = new Error("nugget");
		let catchError;
		try {
			await download("1.0.0");
		} catch (ex) {
			catchError = ex;
		}
		expect(catchError).to.equal(nuggetError);
	});
});
