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

var verbose = process.argv.indexOf('--verbose') !== -1;

if (verbose) {
    process.env.GH_VERBOSE = true;
}

require('../lib/cmd.js').run();
