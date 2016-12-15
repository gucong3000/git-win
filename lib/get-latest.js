var got = require('got');

function getLast() {
	return got('https://api.github.com/repos/git-for-windows/git/releases/latest').then(response => {
		var result = {};
		var latestReleases = JSON.parse(response.body);
		result.version = latestReleases.tag_name;
		latestReleases.assets.forEach(function(asset) {
			var info = asset.name.match(/(\d+)-bit\.exe$/);
			if(info) {
				var arch = 'x' + info[1];
				if(!result[arch]) {
					result[arch] = asset;
				}
			}
		});
		return result;
	});
}

module.exports = getLast;
