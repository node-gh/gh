#!/usr/bin/env node

/*
* Copyright 2013 Eduardo Lundgren, All Rights Reserved.
*
* Code licensed under the BSD License:
* https://github.com/eduardolundgren/blob/master/LICENSE.md
*
* @author Eduardo Lundgren <eduardolundgren@gmail.com>
*/

var fs = require('fs'),
    nopt = require('nopt'),
    base = require('../lib/base'),
    logger,
    parsed,
    remain,
    options,
    commandImpl,
    commandFilePath;

logger = base.logger;
parsed = nopt(process.argv),
remain = parsed.argv.remain;

if (!remain.length) {
    logger.oops('usage: gh [command] [payload] [--flags]');
}

commandFilePath = __dirname + '/../lib/cmds/' + remain[0] + '.js';

if (fs.existsSync(commandFilePath)) {
    commandImpl = require(commandFilePath).Impl;
    options = nopt(
        commandImpl.COMMAND_DETAILS.options,
        commandImpl.COMMAND_DETAILS.shorthands, process.argv, 2);

    new commandImpl().run(options);
}
else {
    logger.oops('command not found');
}