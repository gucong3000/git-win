"use strict";
const expect = require("chai").expect;
const proxyquire = require("proxyquire");

describe("git release", () => {
	it("use cache when network failure", async () => {
		const getRelease = proxyquire("../src/get-release", {
			got: () => (
				Promise.reject(new Error("Network failure"))
			),
		});
		expect(
			await getRelease(2)
		).to.have.property("id").greaterThan(9749756);
	});
});
