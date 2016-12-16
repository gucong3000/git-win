var os = require('os');
var getRelease = require('./get-release');
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
