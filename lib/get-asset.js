var os = require('os');
var getRelease = require('./get-release');

/**
 * 获取某个版本的git的发布信息
 *
 * @param {String} version 版本号
 * @returns {Promise<Object>} 发布信息
 */
function getAssets(version) {
	var arch = os.arch().replace(/^.*?(\d+)$/, '$1');
	return getRelease(version).then(function(releases) {
		var result;
		releases.assets.some(function(asset) {
			var info = asset.name.match(/(\d+)-bit\.exe$/);
			if(info && info[1] === arch) {
				result = asset;
			}
			return result;
		});
		// console.log();
		if(result && /\s+-+\s+\|\s+-+\s+/.test(releases.body)) {
			RegExp.rightContext.split(/\n+/).forEach(function(tr) {
				var tds = tr.trim().split(/\s*\|\s*/);
				if(result.name === tds[0]) {
					result.hash = tds[1];
					return true;
				}
			});
		}
		return result;
	});
}

module.exports = getAssets;
