'use strict';
module.exports = {
	'parserOptions': {
		'sourceType': 'script',
		'ecmaFeatures': {
			'impliedStrict': false,
		},
	},
	'extends': 'standard',
	'root': true,
	'rules': {
		'strict': [
			'error',
			'safe',
		],
		'prefer-arrow-callback': [
			'error',
		],
		'comma-dangle': [
			'error',
			'always-multiline',
		],
		'semi': [
			'error',
			'always',
		],
		'indent': [
			'error',
			'tab',
			{
				'SwitchCase': 1,
			},
		],
		'no-console': [
			'off',
		],
		'no-var': [
			'error',
		],
		'prefer-const': [
			'error',
		],
		'no-tabs': [
			'off',
		],
	},
};
