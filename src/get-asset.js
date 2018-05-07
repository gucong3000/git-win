"use strict";
const osArch = require("./os-arch");
const getRelease = require("./get-release");

/**
 * 获取某个版本的git的发布信息
 *
 * @param {String} version 版本号
 * @returns {Promise<Object>} 发布信息
 */
async function getAssets (version) {
	const release = await getRelease(version);
	const asset = release.assets.find(asset => (
		/(\d+)-bit\.exe$/.test(asset.name) && +RegExp.$1 === osArch
	));

	return asset;
}

module.exports = getAssets;
