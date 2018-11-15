"use strict";
const download = require("./download");
const gitPath = require("./git-path");
const spawn = require("./spawn");
const path = require("path");
const os = require("os");
const fs = require("fs-extra");

async function getGitInstallVersion (gitInstallPath) {
	const git = gitPath.findFile(gitInstallPath, "cmd/git.exe");
	if (!git) {
		return;
	}
	const stdout = await spawn(
		git,
		[
			"--version",
		],
		{
			stdio: "pipe",
		}
	).catch(() => "");
	if (stdout && /^(?:\w+\s+)+?(\d+\..+?)$/im.test(stdout)) {
		return RegExp.$1;
	}
}

async function installGit (version) {
	/* istanbul ignore if */
	if (process.platform !== "win32" && !/\bMicrosoft\b/i.test(os.release())) {
		console.error("`git-win` not support this platform, please install from Windows.");
		process.exit(1);
	}
	const gitInstallPath = gitPath.getGitDir();
	const gitInstallVersion = gitInstallPath && await getGitInstallVersion(gitInstallPath);
	if (gitInstallPath && (version ? gitInstallVersion.startsWith(version) : gitInstallVersion)) {
		return gitInstallPath;
	}

	const setuppack = await download(version);
	const args = [
		"/VERYSILENT",
		"/NORESTART",
		"/NOCANCEL",
		"/SP-",
		"/CLOSEAPPLICATIONS",
		"/RESTARTAPPLICATIONS",
	];
	const remain = process.env.npm_config_argv && JSON.parse(process.env.npm_config_argv).remain;
	if (remain && remain.length) {
		args.push(...remain);
	}

	await fs.chmod(setuppack, 0o755);

	console.log(`${setuppack} ${args.join(" ")}\nWaiting for git installation to complete.`);

	await spawn(setuppack, args, {
		stdio: "inherit",
		detached: true,
	});
	console.log("Installation complete.");

	await autocrlf().catch(console.error);
	return installGit(version);
}

async function autocrlf () {
	if (!process.env.ProgramData) {
		return;
	}
	const file = path.join(process.env.ProgramData, "Git/config");
	let contents = await fs.readFile(file, "utf-8");
	let changed;
	contents = contents.replace(/(\bautocrlf\s+=\s*)(\S+)/, (s, prefix, value) => {
		if (/^true$/i.test(value)) {
			s = prefix + "input";
			changed = true;
		}
		return s;
	});
	if (changed) {
		await fs.writeFile(file, contents);
	}
}

module.exports = installGit;

if (process.mainModule === module) {
	fs.unlink("nul", () => {});
	installGit(process.env.npm_config_git_version).catch(
		error => {
			console.error(error);
			process.exitCode = 1;
		}
	);
}
