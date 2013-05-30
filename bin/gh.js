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
    base = require('../lib/base'),
    fs = require('fs'),
    git = require('../lib/git'),
    help = require('../lib/cmds/help').Impl.prototype,
    logger = require('../lib/logger'),
    nopt = require('nopt'),
    commandFilePath,
    commandImpl,
    operations,
    options,
    parsed,
    remain;

operations = [];
parsed = nopt(process.argv);
remain = parsed.argv.remain;

if (!remain.length) {
    help.run();
    process.exit(0);
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
    logger.error('Command not found');
}