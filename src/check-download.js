"use strict";
const crypto = require("crypto");
const fs = require("fs-extra");

/**
 * 检查本地下载好的文件的尺寸和hash
 * 文件超过正确尺寸或尺寸正确但hash不对时会删除文件
 * 尺寸不正确或hash不正确会抛出异常
 * @param {String} file 文件路径
 * @param {any} size 正确的文件大小
 * @param {any} hashCode 正确的hash值
 * @returns {Promise<String>} 文件路径
 */
async function check (file, size, hashCode) {
	const stats = await fs.stat(file);
	if (stats.size < size) {
		throw new Error("unfinished");
	} else if (stats.size > size) {
		await unlink(file);
		throw new Error("size");
	} else {
		console.log("check hash of " + file);
		const hash = await getFileHash(file);
		if (hashCode === hash) {
			return file;
		} else {
			await unlink(file);
			throw new Error("hash");
		}
	}
}

async function getFileHash (file) {
	const hash = crypto.createHash("sha256");
	const input = fs.createReadStream(file);
	return new Promise((resolve, reject) => {
		input.on("readable", () => {
			const data = input.read();
			if (data) {
				hash.update(data);
			} else {
				resolve(hash.digest("hex"));
			}
		}).once("error", reject);
	});
}

function unlink (file) {
	return fs.unlink(file).catch(() => {});
}
module.exports = check;
