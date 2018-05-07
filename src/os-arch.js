"use strict";
module.exports = /64$/.test(process.env.PROCESSOR_ARCHITEW6432 || process.arch) ? 64 : 32;
