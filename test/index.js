"use strict";
parseInt(process.versions.node) < 9 && require("babel-register");

const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

if (process.platform !== "win32") {
	require("./posix-helper");
}
require("./api");
require("./check");
require("./release");
require("./download");
require("./install");
require("./spawn");
