'use strict';
const expect = require('chai').expect;
const check = require('../src/check-download');
const fs = require('fs-extra');
const path = require('path');
const os = require('os');

describe('git check download', () => {
	const file = path.join(os.tmpdir(), 'Git-mock.exe');
	const contents = 'mock content';

	beforeEach(() => (
		fs.outputFile(file, contents)
	));
	afterEach(() => (
		fs.unlink(file).catch(() => {})
	));
	it('File size too small', async () => {
		await expect(
			check(file, 0xFF, 'mock_hash')
		).to.rejectedWith('unfinished');
		await expect(
			fs.stat(file).then(stats => stats.isFile())
		).eventually.to.be.true;
	});
	// Promise.resolve(2 + 2).should.eventually.equal(4);
	it('File size too large', async () => {
		await expect(
			check(file, 1, 'mock_hash')
		).to.rejectedWith('size');
		await expect(
			fs.stat(file)
		).to.rejectedWith('no such file or directory');
	});

	it('Bad Hash mismatched', async () => {
		await expect(
			check(file, Buffer.byteLength(contents), 'mock_hash')
		).to.rejectedWith('hash');
		await expect(
			fs.stat(file)
		).to.rejectedWith('no such file or directory');
	});
});
