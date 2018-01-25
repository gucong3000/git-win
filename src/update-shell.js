'use strict';
const fs = require('fs-extra');
const path = require('path');
const npmBinDir = path.join(__dirname, '../bin') + path.sep;

function writeBin (gitInstallPath, shell) {
	return fs.outputFile(
		npmBinDir + shell + '.cmd',
		[
			`@set "GIT_INSTALL_ROOT=${gitInstallPath}"`,
			`@set "PATH=%PATH%;%GIT_INSTALL_ROOT%\\usr\\bin;%GIT_INSTALL_ROOT%\\usr\\share\\vim\\vim74"`,
			`@"%GIT_INSTALL_ROOT%\\usr\\bin\\${shell}.exe" %*`,
			'',
		].join('\r\n')
	);
}

module.exports = (gitInstallPath) => {
	if (!gitInstallPath) {
		gitInstallPath = '%ProgramFiles%\\Git';
	}
	return Promise.all([
		writeBin(gitInstallPath, 'bash'),
		writeBin(gitInstallPath, 'sh'),
		// fs.link(path.join(gitInstallPath, 'usr/bin'), '/bin').catch(console.error),
	]);
};
