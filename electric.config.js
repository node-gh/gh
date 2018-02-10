"use strict";

var marble = require("marble");

module.exports = {
	codeMirrorLanguages: ["javascript", "shell"],
	metalComponents: ["electric-marble-components"],
	sassOptions: {
		includePaths: ["node_modules", marble.src]
	},
	vendorSrc: ["node_modules/marble/build/fonts/**"]
};
