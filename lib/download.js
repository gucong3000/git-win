var child_process = require('child_process');
var osTmpdir = require('os-tmpdir');
var path = require('path');
var checkDownload = require('./check-download');
var getAsset = require('./get-asset');

function down(version) {
	return getAsset(version).then(function(asset) {
		var url = asset.browser_download_url;
		var mirror = process.env.GIT_FOR_WINDOWS_MIRROR;
		if(mirror) {
			mirror = mirror.replace(/\/*$/, '/');
			if(mirror.indexOf('npm.taobao.org') > 0) {
				url = url.replace(/^.+?\/download\/v?/, mirror);
			} else {
				url = url.replace(/^.+?\/download\//, mirror);
			}
		}
		var dist = path.join(osTmpdir(), asset.name);
		return checkDownload(dist, asset.size, asset.hash).catch(function() {
			child_process.spawnSync(path.join(__dirname, '../bin/wget.exe'), [
				'--no-check-certificate',
				'--tries',
				'0',
				'--continue',
				url,
				'--output-document',
				dist
			], {
				stdio: 'inherit'
			});
			return checkDownload(dist, asset.size, asset.hash);
		});
	});
}

module.exports = down;
