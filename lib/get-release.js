// 从github API 提取数据

const path = require('path');
const fs = require('fs');
const got = require('got');
let cache;
try {
	cache = require('./data-cache.json');
} catch (ex) {
	//
}

/**
 * 数据本地缓存增加数据
 *
 * @param {String} url 数据来源url
 * @param {any} data 任何数据
 */
function updateCache (url, data) {
	cache[url] = data;
	fs.writeFile(path.join(__dirname, 'data-cache.json'), JSON.stringify(cache), () => {

	});
}

function getData (url) {
	// http请求数据
	return got(url).then((response) => {
		if (response.statusCode !== 200 || response.statusCode !== 304) {
			return cache[url];
		}
		const data = JSON.parse(response.body);
		updateCache(url, data);
		return data;
	}).catch(() => {
		// 网络不通时使用本地缓存数据
		return cache[url];
	});
}

/**
 * 超找所有release
 *
 * @returns {Array<Object>} release数组
 */
function releases () {
	return getData('https://api.github.com/repos/git-for-windows/git/releases').then((releases) => {
		// 过滤草案和预发布
		return releases.filter((release) => {
			return !(release.prerelease || release.draft);
		});
	});
}

/**
 * 按版本号查找最新的release
 *
 * @param {String} version 版本号，不填默认最新
 * @returns {Promise<Object>} 最新的releases的json信息
 */
function getRelease (version) {
	if (!version) {
		return getData('https://api.github.com/repos/git-for-windows/git/releases/latest');
	}
	return releases().then((releases) => {
		let result;
		releases.forEach((release) => {
			if ((release.tag_name.replace(/^[\D]*/, '').indexOf(version) === 0) && (!result || new Date(release.created_at) > new Date(result.created_at))) {
				result = release;
			}
		});
		return result;
	});
}

module.exports = getRelease;
