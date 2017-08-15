const os = require('os');
const getRelease = require('./get-release');

/**
 * 获取某个版本的git的发布信息
 *
 * @param {String} version 版本号
 * @returns {Promise<Object>} 发布信息
 */
function getAssets (version) {
	const arch = os.arch().replace(/^.*?(\d+)$/, '$1');
	return getRelease(version).then((releases) => {
		let result;
		releases.assets.some((asset) => {
			const info = asset.name.match(/(\d+)-bit\.exe$/);
			if (info && info[1] === arch) {
				result = asset;
			}
			return result;
		});
		// console.log();
		if (result && /\s+-+\s+\|\s+-+\s+/.test(releases.body)) {
			RegExp.rightContext.split(/\n+/).forEach((tr) => {
				const tds = tr.trim().split(/\s*\|\s*/);
				if (result.name === tds[0]) {
					result.hash = tds[1];
					return true;
				}
			});
		}
		return result;
	});
}

module.exports = getAssets;
