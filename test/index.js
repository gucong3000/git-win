var describe = require('mocha').describe;
// var before = require('mocha').before;
// var after = require('mocha').after;
var it = require('mocha').it;
var assert = require('assert');

var fs = require('mz/fs');
var git = require('../');

describe('git path', function() {
	it('git exist', function() {
		assert.ok(git);
	});
	it('git exist', function() {
		return fs.stat(git).then(function(stats) {
			assert.ok(stats.isDirectory());
		});
	});
});
