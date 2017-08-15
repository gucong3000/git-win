const cp = require('child_process');
const osTmpdir = require('os-tmpdir');
const path = require('path');
const checkDownload = require('./check-download');
const getAsset = require('./get-asset');

/**
 * 下载 Git for windows
 *
 * @param {String} version 要下载的版本号，可以为大版本，不指定具体小版本
 * @returns {Promise<String>} 下载好的文件的文件路径
 */
function down (version) {
	return getAsset(version).then((asset) => {
		let url = asset.browser_download_url;
		let mirror = process.env.npm_config_git4win_mirror || process.env.GIT4WIN_MIRROR;
		if (mirror) {
			mirror = mirror.replace(/\/*$/, '/');
			if (mirror.indexOf('npm.taobao.org') > 0) {
				url = url.replace(/^.+?\/download\/v?/, mirror);
			} else {
				url = url.replace(/^.+?\/download\//, mirror);
			}
		}
		const dist = path.join(osTmpdir(), asset.name);
		return checkDownload(dist, asset.size, asset.hash).catch(() => {
			cp.spawnSync(path.join(__dirname, '../bin/wget.exe'), [
				'--no-check-certificate',
				'--tries',
				'0',
				'--continue',
				url,
				'--output-document',
				dist,
			], {
				stdio: 'inherit',
			});
			return checkDownload(dist, asset.size, asset.hash);
		});
	});
}

module.exports = down;
