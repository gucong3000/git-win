'use strict';
const expect = require('chai').expect;
const proxyquire = require('proxyquire');

describe('git release', () => {
	it('use cache when network failure', async () => {
		const getRelease = proxyquire('../src/get-release', {
			got: () => (
				Promise.reject(new Error('Network failure'))
			),
		});
		await expect(
			getRelease(2)
		).eventually.to.have.property('id', 9334485);
	});
});
