'use strict';
const crypto = require('crypto');
const fs = require('fs');

/**
 * 检查本地下载好的文件的尺寸和hash
 * 文件超过正确尺寸或尺寸正确但hash不对时会删除文件
 * 尺寸不正确或hash不正确会抛出异常
 * @param {String} file 文件路径
 * @param {any} size 正确的文件大小
 * @param {any} hashCode 正确的hash值
 * @returns {Promise<String>} 文件路径
 */
function check (file, size, hashCode) {
	return new Promise((resolve, reject) => {
		fs.stat(file, (err, stats) => {
			if (err) {
				reject(err);
			} else if (stats.size < size) {
				reject(new Error('unfinished'));
			} else if (stats.size > size) {
				fs.unlink(file, () => {
					reject(new Error('size'));
				});
			} else {
				console.log('check hash of ' + file);
				const hash = crypto.createHash('sha256');
				const input = fs.createReadStream(file);
				input.on('readable', () => {
					const data = input.read();
					if (data) {
						hash.update(data);
					} else if (hashCode === hash.digest('hex')) {
						resolve(file);
					} else {
						fs.unlink(file, () => {
							reject(new Error('hash'));
						});
					}
				});
			}
		});
	});
}

module.exports = check;
