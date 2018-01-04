#!/usr/bin/env node

/*
 * Copyright 2013-2018, All Rights Reserved.
 *
 * Code licensed under the BSD License:
 * https://github.com/node-gh/gh/blob/master/LICENSE.md
 *
 * @author Henrique Vicente <henriquevicente@gmail.com>
 * @author Eduardo Lundgren <eduardo.lundgren@gmail.com>
 * @author Zeno Rocha <zno.rocha@gmail.com>
 * @author Ryan Garant <ryantgarant@gmail.com>
 */

'use strict'

var verbose = process.argv.indexOf('--verbose') !== -1
var insane = process.argv.indexOf('--insane') !== -1

if (verbose || insane) {
    process.env.GH_VERBOSE = true
}

if (insane) {
    process.env.GH_VERBOSE_INSANE = true
}

require('../lib/cmd.js').run()
