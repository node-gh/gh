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

    operations.push(base.login);
    operations.push(base.checkVersion);
    operations.push(git.getRepositoryName);
    operations.push(git.getCurrentBranch);

    async.series(operations, function(err, results) {
        options.user = options.user || base.getUser();
        options.number = options.number || parseInt(remain[1], 10);
        options.repo = options.repo || results[0];
        options.currentBranch = options.currentBranch || results[1];

        new commandImpl(options).run();
    });
}
else {
    logger.error('Command not found');
}