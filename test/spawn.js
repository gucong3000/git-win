"use strict";
const expect = require("chai").expect;
const spawn = require("../src/spawn");

describe("git path", () => {
	it("git --version", () => {
		return spawn("git", ["--version"]);
	});
	it("git --version", () => {
		return spawn("git", ["--version"], {
			stdio: "pipe",
		}).then(result => {
			expect(result.trim()).to.match(/^git version (\d+\.)+windows(.\d+)?$/);
		});
	});
	it("not a git command", () => {
		let error;
		return spawn("git", ["not_exist"]).catch(ex => {
			error = ex;
		}).then(() => {
			expect(error.message).to.equal("non-zero exit code 1");
		});
	});
	it("not a git command", () => {
		let error;
		return spawn("git", ["not_exist"], {
			stdio: "pipe",
		}).catch(ex => {
			error = ex;
		}).then(() => {
			expect(error.message.trim()).to.equal("git: 'not_exist' is not a git command. See 'git --help'.");
		});
	});
});
