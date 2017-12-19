#!/usr/bin/env node
'use strict';
const download = require('./download');
const spawn = require('./spawn');

async function inst (version) {
	const setuppack = await download(version);
	console.log('Waiting for git installation to complete.');
	await spawn(setuppack, [
		'/VERYSILENT',
		'/NORESTART',
		'/NOCANCEL',
		'/SP-',
		// '/COMPONENTS="icons,icons\\quicklaunch,ext,ext\\shellhere,ext\\guihere,assoc,assoc_sh"',
	], {
		stdio: 'inherit',
	});
	console.log('Installation complete.');
}

if (process.mainModule === module) {
	inst(process.argv[2]).catch((e) => {
		console.error(e);
		process.exitCode = 1;
	});
}

module.exports = inst;
