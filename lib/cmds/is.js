/*
 * Copyright 2013 Zeno Rocha, All Rights Reserved.
 *
 * Code licensed under the BSD License:
 * https://github.com/eduardolundgren/blob/master/LICENSE.md
 *
 * @author Zeno Rocha <zno.rocha@gmail.com>
 */

var async = require('async'),
    base = require('../base'),
    clc = require('cli-color'),
    logger = require('../logger');

function Issues(options, currentRepository) {
    this.options = options;
    this.currentRepository = currentRepository;
}

Issues.DETAILS = {
    options: {
        'all' : String,
        'list': Boolean,
        'repo': String,
        'user': String
    },
    shorthands: {
        'a': [ '--all'  ],
        'l': [ '--list' ],
        'r': [ '--repo' ],
        'u': [ '--user' ]
    },
    description: 'Issues'
};

Issues.prototype.run = function() {
    var instance = this,
        options = instance.options;

    options.user = options.user || base.getUser();
    options.repo = options.repo || instance.currentRepository;

    if (options.list) {
        if (options.all) {
            instance.listFromAllRepositories();
        }
        else {
            instance.list(options.repo);
        }
    }
};

Issues.prototype.list = function(repo) {
    var instance = this;

    base.github.issues.repoIssues({
        user: instance.options.user,
        repo: repo
    },
    function(err, issues) {
        if (err && !instance.options.all) {
            var msg = JSON.parse(err.message).message;
            logger.error(msg);
            process.exit(0);
        }

        if (issues && issues.length > 0) {
            logger.logTemplate('is', {
                user: instance.options.user,
                repo: repo,
                issues: issues
            });
        }
    });
};

Issues.prototype.listFromAllRepositories = function() {
    var instance = this;

    base.github.repos.getAll({
        type: 'all'
    },
    function(err, repositories) {
        repositories.forEach(function(repository) {
            instance.list(repository.name);
        });
    });
};

exports.Impl = Issues;