'use strict';
const os = require('os');
const getRelease = require('./get-release');

/**
 * 获取某个版本的git的发布信息
 *
 * @param {String} version 版本号
 * @returns {Promise<Object>} 发布信息
 */
async function getAssets (version) {
	const arch = os.arch().replace(/^.*?(\d+)$/, '$1');
	const release = await getRelease(version);
	const asset = release.assets.find(asset => {
		const info = asset.name.match(/(\d+)-bit\.exe$/);
		return info && info[1] === arch;
	});

	release.body.replace(/^\s*(.+?)\s*\|\s*(.+?)\s*$/gm, (s, key, value) => {
		if (asset.name === key) {
			asset.hash = value;
		}
	});

	return asset;
}

module.exports = getAssets;
