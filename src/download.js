"use strict";
const os = require("os");
const path = require("path");
const checkDownload = require("./check-download");
const getAsset = require("./get-asset");
const nugget = (require("util").promisify || require("util.promisify"))(require("nugget"));
const spawn = require("./spawn");
const inGFW = require("in-gfw");

async function tmpPath (fileName) {
	let tmpdir;
	/* istanbul ignore if */
	if (process.platform !== "win32") {
		const stdout = await spawn(
			"cmd.exe",
			[
				"/d",
				"/s",
				"/c",
				"SET",
			],
			{
				stdio: "pipe",
			}
		).catch(() => "");
		tmpdir = /^TMP?=(.*)$/igm.exec(stdout)[1];
		tmpdir = await spawn(
			"wslpath",
			[
				tmpdir,
			],
			{
				stdio: "pipe",
			}
		).catch(() => tmpdir);
		tmpdir = tmpdir.trim();
	} else {
		tmpdir = os.tmpdir();
	}

	return path.join(tmpdir, fileName);
}

/**
 * 下载 Git for windows
 *
 * @param {String} version 要下载的版本号，可以为大版本，不指定具体小版本
 * @returns {Promise<String>} 下载好的文件的文件路径
 */
async function download (version) {
	const asset = await getAsset(version);
	let url = asset.browser_download_url;
	let mirror = process.env.GIT4WIN_MIRROR || process.env.npm_config_git4win_mirror || (await inGFW.net("github.com", "npm.taobao.org") && "https://npm.taobao.org/mirrors/git-for-windows/");
	if (mirror) {
		mirror = mirror.replace(/\/*$/, "/");
		url = url.replace(/^.+?\/download\//, mirror);
	}
	const dist = await tmpPath(asset.name);
	await down(url, dist, asset);
	return dist;
}

async function down (url, dist, asset) {
	try {
		await checkDownload(dist, asset.size, asset.hash);
		return dist;
	} catch (ex) {
		//
	}
	console.log("Download from:", url);
	await nugget(url, {
		target: dist,
		quiet: process.env.CI,
		resume: true,
		strictSSL: false,
	});
	return down(url, dist, asset);
}

module.exports = download;
