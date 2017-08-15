#!/usr/bin/env node
const download = require('./download');
const cp = require('child_process');

function inst (version) {
	return download(version).then((setuppack) => {
		console.log('Waiting for git installation to complete.');
		cp.spawnSync(setuppack, [
			'/VERYSILENT',
			'/NORESTART',
			'/NOCANCEL',
			'/SP-',
			'/COMPONENTS="icons,icons\\quicklaunch,ext,ext\\shellhere,ext\\guihere,assoc,assoc_sh"',
		], {
			stdio: 'inherit',
		});
		console.log('Done.');
	});
}

if (process.mainModule === module) {
	inst(process.argv[2]).catch((e) => {
		console.error(e);
		process.exitCode = 1;
	});
}

module.exports = inst;
