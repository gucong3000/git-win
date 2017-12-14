'use strict';
parseInt(process.versions.node) < 9 && require('babel-register');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

require('./api');
require('./check');
require('./release');
require('./download');
