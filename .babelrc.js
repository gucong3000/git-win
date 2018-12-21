"use strict";
module.exports = {
	"presets": [
		[
			"@babel/preset-env",
			{
				"targets": process.env.NYC_CONFIG ? {} : {
					"node": 6,
				},
			},
		],
	],
	"plugins": [
		"@babel/plugin-transform-runtime",
	],
};
