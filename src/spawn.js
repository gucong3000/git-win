'use strict';
const cp = require('child_process');
module.exports = (file, args, options) => {
	return new Promise((resolve, reject) => {
		const process = cp.spawn(file, args, Object.assign({
			stdio: 'inherit',
		}, options));
		process.on('error', reject);
		process.on('close', (code) => {
			// code === null when child_process is killed
			if (code) {
				reject(new Error('non-zero exit code ' + code));
			} else {
				resolve(process);
			}
		});
	});
};
