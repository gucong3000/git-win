var spawn = require('child_process').spawn;
var osTmpdir = require('os-tmpdir');
var path = require('path');
var os = require('os');
// var downloadStatus = require('download-status');
// https://api.github.com/repos/$GitHub_Owner/$GitHub_Repo/releases/latest
var getLatest = require('./get-latest');

function getAsset(ver) {
	if(ver) {
		var name = 'Git-' + ver + '-' + os.arch().replace(/^x?/, '') + '-bit.exe';
		var browser_download_url = 'https://github.com/git-for-windows/git/releases/download/v' + ver + '.windows.1/' + name;
		return Promise.resolve({
			name,
			browser_download_url
		});
	} else {
		return getLatest().then(function(asset) {
			return asset[os.arch()];
		});
	}
}

function down(ver) {
	return getAsset(ver).then(function(asset) {
		var url = asset.browser_download_url;
		var mirror = process.env.GIT_FOR_WINDOWS_MIRROR;
		if(mirror) {
			url = url.replace(/^.+?\/v/, mirror);
		}
		console.log(url);
		var dist = path.join(osTmpdir(), asset.name);
		new Promise(function(resolve, reject) {
			var wget = spawn(path.join(__dirname, '../bin/wget.exe'), [
				'--no-check-certificate',
				'-t',
				'0',
				url,
				'-O',
				dist
			], {
				stdio: 'inherit'
			}, resolve);

			wget.on('error', reject);

		});
	});
}

module.exports = down;
