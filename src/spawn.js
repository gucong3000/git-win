'use strict';
const cp = require('child_process');
module.exports = (file, args, options) => {
	return new Promise((resolve, reject) => {
		const process = cp.spawn(file, args, Object.assign({
			stdio: 'inherit',
		}, options));
		let stdout = '';
		let stderr = '';
		if (process.stdout) {
			process.stdout.on('data', (data) => {
				stdout += data;
			});
		}
		if (process.stderr) {
			process.stderr.on('data', (data) => {
				stderr += data;
			});
		}
		process.on('error', reject);
		process.on('close', (code) => {
			// code === null when child_process is killed
			if (code) {
				reject(new Error(stderr || ('non-zero exit code ' + code)));
			} else {
				resolve(stdout || process);
			}
		});
	});
};
