'use strict';
// 从github API 提取数据

const path = require('path');
const fs = require('fs-extra');
const got = require('got');
const cache = require('./data-cache.json');

/**
 * 数据本地缓存增加数据
 *
 * @param {String} url 数据来源url
 * @param {any} data 任何数据
 */
async function updateCache (url, data) {
	data = data.filter((release) => {
		if (!(release.prerelease || release.draft)) {
			const sha256 = {};
			release.body.replace(/^\s*(.+?\.exe)\s*\|\s*(\w+)\s*$/igm, (s, key, value) => {
				sha256[key] = value;
			});
			delete release.body;

			release.assets = release.assets.filter(asset => {
				if (asset.content_type === 'application/executable' && !/^PortableGit$/i.test(asset.name)) {
					delete asset.download_count;
					asset.hash = sha256[asset.name];
					return true;
				}
			});
			return true;
		}
	});
	cache[url] = data;
	await fs.writeFile(path.join(__dirname, 'data-cache.json'), JSON.stringify(cache, null, '\t'));
	return data;
}

async function getData (url) {
	// http请求数据
	try {
		const response = await got(url, {
			json: true,
		});
		return updateCache(url, response.body);
	} catch (ex) {
		return cache[url];
	}
}

/**
 * 查找所有release
 *
 * @returns {Array<Object>} release数组
 */
async function getReleases () {
	const releases = await getData('https://api.github.com/repos/git-for-windows/git/releases');
	return releases;
}

/**
 * 按版本号查找最新的release
 *
 * @param {String} version 版本号，不填默认最新
 * @returns {Promise<Object>} 最新的releases的json信息
 */
async function getRelease (version) {
	const releases = await getReleases();
	if (version) {
		return releases.find(release => (
			release.tag_name.indexOf(version) === 1
		));
	} else {
		return releases[0];
	}
}

module.exports = getRelease;
