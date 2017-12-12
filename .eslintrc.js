'use strict';
module.exports = {
	'extends': 'standard',
	'root': true,
	'parserOptions': {
		'sourceType': 'script',
	},
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
