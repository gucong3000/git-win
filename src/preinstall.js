'use strict';
function holdErr (error) {
	if (error) {
		console.error(error);
		process.exit(1);
	}
}

if (!require('util').promisify) {
	const fs = require('fs');
	fs.readFile('package.json', 'utf8', (err, pkg) => {
		holdErr(err);
		pkg = JSON.parse(pkg);
		pkg.dependencies['util.promisify'] = '^1.0.0';
		pkg = JSON.stringify(pkg, null, 2);
		fs.writeFile('package.json', pkg, holdErr);
	});
}
