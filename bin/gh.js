#!/usr/bin/env node

/*
 * Copyright 2013, All Rights Reserved.
 *
 * Code licensed under the BSD License:
 * https://github.com/node-gh/gh/blob/master/LICENSE.md
 *
 * @author Eduardo Lundgren <edu@rdo.io>
 */

'use strict';

var npm = require('npm'),
    logger = require('../lib/logger'),
    path = require('path');

npm.load(function (err) {
    if (err) {
        return logger.error(err);
    }

    // -- Env ------------------------------------------------------------------------------------------
    process.env.GH_PATH = path.join(__dirname, '../');

    require('../lib/cmd.js').run();
});
