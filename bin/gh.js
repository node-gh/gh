#!/usr/bin/env node

/*
 * Copyright 2013-2015, All Rights Reserved.
 *
 * Code licensed under the BSD License:
 * https://github.com/node-gh/gh/blob/master/LICENSE.md
 *
 * @author Eduardo Lundgren <edu@rdo.io>
 */

'use strict';

var path = require('path'),
    fs = require('fs'),
    logger = require('../lib/logger'),
    pkg = require('../package.json'),
    semver = require('semver'),
    tracker = require('../lib/tracker'),
    configs = require('../lib/configs'),
    verbose = process.argv.indexOf('--verbose') === true;

// Check node version
function isCompatibleNodeVersion() {
    return semver.satisfies(process.version, pkg.engines.node);
}

if (verbose) {
    process.env.GH_VERBOSE = true;
}

if (!isCompatibleNodeVersion()) {
    logger.error('Please update your NodeJS version: http://nodejs.org/download');
}

if (!fs.existsSync(configs.getUserHomePath())) {
    configs.createGlobalConfig();
}

// If configs.PLUGINS_PATH_KEY is undefined, try to cache it before proceeding.
if (configs.getConfig()[configs.PLUGINS_PATH_KEY] === undefined) {
    configs.getNodeModulesGlobalPath();
}

// -- Env ------------------------------------------------------------------------------------------
try {
    process.env.GH_PATH = path.join(__dirname, '../');

    require('../lib/cmd.js').run();
} catch (e) {
    tracker.track('error');
    throw e;
}
