"use strict";
const expect = require("chai").expect;
const fs = require("fs-extra");

describe("git path", () => {
	const git = require("../src/");
	const gitPath = require("../src/git-path.js");

	it("get git dir", () => {
		expect(git).to.be.a("string");
	});

	it("git dir exist", async () => {
		await expect(
			fs.stat(git).then(stats => stats.isDirectory())
		).eventually.to.be.true;
	});

	it("get git dir by `PATH` env", () => {
		expect(
			gitPath.getGitDirByPathEnv()
		).to.equal(git);
	});

	it("get git dir form registry", () => {
		expect(
			gitPath.getGitDirByRegstry() || gitPath.getGitDirByRegstry(64) || gitPath.getGitDirByRegstry(32)
		).to.equal(git);
	});
	if (process.platform === "win32") {
		it("lookup for git dir", () => {
			expect(
				gitPath.lookupGitDir()
			).to.equal(git);
		});
	}
});
