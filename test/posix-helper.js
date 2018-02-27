'use strict';
const pathPrefix = process.env.PWD.replace(/^((?:\/\w+)?)\/\w\/.+$/, '$1');
const fs = require('fs');
const path = require('path');
Object.keys(fs).forEach((fn) => {
	if (typeof fs[fn] !== 'function') {
		return;
	}
	const oldFn = fs[fn];
	fs[fn] = function () {
		const args = arguments;
		if (args[0] && /^\w:/.test(args[0])) {
			args[0] = path.join(pathPrefix, args[0][0].toLowerCase(), args[0].slice(3).replace(/\\/g, '/'));
		}
		return oldFn.apply(this, args);
	};
});
