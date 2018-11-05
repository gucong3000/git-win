"use strict";
// 从github API 提取数据

const path = require("path");
const fs = require("fs-extra");
const got = require("got");
let cache;
try {
	cache = require("./data-cache.json");
} catch (ex) {
	cache = [];
}

/**
 * 数据本地缓存增加数据
 *
 * @param {String} url 数据来源url
 * @param {any} data 任何数据
 */
async function updateCache (data) {
	cache = cache.filter(
		(oldRelease) => (
			!data.some(newRelease => newRelease.id === oldRelease.id)
		)
	);
	data = data.filter((release) => {
		if ((release.prerelease || release.draft)) {
			return false;
		}
		const sha256 = {};
		release.body.replace(/^\s*(.+?\.exe)\s*\|\s*(\w+)\s*$/igm, (s, key, value) => {
			sha256[key] = value;
		});
		delete release.body;

		release.assets = release.assets.filter(asset => {
			if (asset.content_type === "application/executable" && !/^PortableGit$/i.test(asset.name)) {
				delete asset.download_count;
				asset.hash = sha256[asset.name];
				return true;
			}
		});
		return true;
	});

	cache = data.concat(cache);
	await fs.writeFile(path.join(__dirname, "data-cache.json"), JSON.stringify(cache, null, "\t") + "\n");
	return cache;
}

async function getData (url) {
	// http请求数据
	try {
		const response = await got(url, {
			json: true,
		});
		return updateCache(response.body);
	} catch (ex) {
		return cache;
	}
}

/**
 * 查找所有release
 *
 * @returns {Array<Object>} release数组
 */
async function getReleases () {
	const releases = await getData("https://api.github.com/repos/git-for-windows/git/releases");
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
