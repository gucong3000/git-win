"use strict";
parseInt(process.versions.node) < 9 && require("@babel/register");

require("./api");
require("./check");
require("./release");
require("./download");
require("./install");
require("./spawn");
