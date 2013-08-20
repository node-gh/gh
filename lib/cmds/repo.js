/*
 * Copyright 2013, All Rights Reserved.
 *
 * Code licensed under the BSD License:
 * https://github.com/eduardolundgren/blob/master/LICENSE.md
 *
 * @author Henrique Vicente <henriquevicente@gmail.com>
 */

// -- Requires -----------------------------------------------------------------
var async = require('async'),
    base = require('../base'),
    clc = require('cli-color'),
    logger = require('../logger'),
    open = require('open'),
    url = require('url'),
    childProcess = require('child_process');

// -- Constructor --------------------------------------------------------------
function Repo(options) {
    this.options = options;

    if (!options.repo) {
        logger.error('You must specify a Git repository to run this command');
    }
}

// -- Constants ----------------------------------------------------------------
Repo.DETAILS = {
    alias: 're',
    description: 'Provides a set of util commands to work with Repositories.',
    options: {
        'detailed' : Boolean,
        'list'     : Boolean,
        'user'     : String,
        'type'     : ['all', 'owner', 'public', 'private', 'member']
    },
    shorthands: {
        'd': [ '--detailed' ],
        'l': [ '--list' ],
        'u': [ '--user' ],
        't' : [ '--type' ]
    },
    payload: function(payload, options) {
        options.list = true;
    }
};

Repo.TYPE_ALL = "all";
Repo.TYPE_OWNER = "owner";
Repo.TYPE_PUBLIC = "public";
Repo.TYPE_PRIVATE = "private";
Repo.TYPE_MEMBER = "member";

// -- Commands -----------------------------------------------------------------
Repo.prototype.run = function() {
    var instance = this,
        options = instance.options,
        config = base.getGlobalConfig();

    options.type = options.type || Repo.TYPE_ALL;
};

exports.Impl = Repo;