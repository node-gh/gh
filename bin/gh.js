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
    tracker = require('../lib/tracker');

try {
    // -- Env ------------------------------------------------------------------------------------------
    process.env.GH_PATH = path.join(__dirname, '../');

    require('../lib/cmd.js').run();
} catch (e) {
    tracker.track('error');
    throw e;
}
