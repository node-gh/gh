/*
 * Copyright 2014, All Rights Reserved.
 *
 * Code licensed under the BSD License:
 * https://github.com/node-gh/gh/blob/master/LICENSE.md
 *
 * @author Eduardo Lundgren <edu@rdo.io>
 * @author Henrique Vicente <henriquevicente@gmail.com>
 */

'use strict';

var base = require('./base'),
    configs = require('./configs'),
    github = require('github');

var baseConfig = configs.getConfig();

exports.github = new github({
    debug: false,
    host: baseConfig.api.host,
    protocol: baseConfig.api.protocol,
    version: baseConfig.api.version
});

// Inject the github object to the base module
base.github = exports.github;