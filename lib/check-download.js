var crypto = require('crypto');
var fs = require('fs');

function check(file, size, hashCode) {
	return new Promise(function(resolve, reject) {
		fs.stat(file, function(err, stats) {
			if(err) {
				reject(err);
			} else if(stats.size < size) {
				reject('unfinished');
			} else if(stats.size > size) {
				fs.unlink(file, function() {
					reject('size');
				});
			} else {
				console.log('check hash of ' + file);
				var hash = crypto.createHash('sha256');
				var input = fs.createReadStream(file);
				input.on('readable', function() {
					var data = input.read();
					if (data) {
						hash.update(data);
					} else if(hashCode === hash.digest('hex')) {
						resolve(file);
					} else {
						fs.unlink(file, function() {
							reject('hash');
						});
					}
				});
			}
		});
	});
}

module.exports = check;
