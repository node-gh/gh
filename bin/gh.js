#!/usr/bin/env node

/*
* Copyright 2013 Eduardo Lundgren, All Rights Reserved.
*
* Code licensed under the BSD License:
* https://github.com/eduardolundgren/blob/master/LICENSE.md
*
* @author Eduardo Lundgren <eduardolundgren@gmail.com>
*/

var async = require('async'),
    fs = require('fs'),
    nopt = require('nopt'),
    base = require('../lib/base'),
    git = require('../lib/git'),
    commandFilePath,
    commandImpl,
    logger,
    operations,
    options,
    parsed,
    remain;

logger = base.logger;
operations = [];
parsed = nopt(process.argv),
remain = parsed.argv.remain;

if (!remain.length) {
    logger.oops('usage: gh [command] [payload] [--flags]');
}

commandFilePath = __dirname + '/../lib/cmds/' + remain[0] + '.js';

if (fs.existsSync(commandFilePath)) {
    commandImpl = require(commandFilePath).Impl;

    options = nopt(
        commandImpl.DETAILS.options,
        commandImpl.DETAILS.shorthands, process.argv, 2);

    operations.push(git.getRepositoryName);
    operations.push(git.getCurrentBranch);
    operations.push(base.login);

    async.series(operations, function(err, results) {
        new commandImpl(options, results[0], results[1]).run();
    });
}
else {
    logger.oops('command not found');
}