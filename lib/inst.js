var download = require('./download');
var child_process = require('child_process');

function inst(version) {
	return download(version).then(function(setuppack) {
		console.log('Waiting for git installation to complete.');
		child_process.spawnSync(setuppack, [
			'/SP-',
			'/VERYSILENT',
			// /DIR="x:\dirname"

		], {
			stdio: 'inherit'
		});
		console.log('Done.');
	});
}

if(process.mainModule === module) {
	inst(process.argv[2]);
}

module.exports = inst;
