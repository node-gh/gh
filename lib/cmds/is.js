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

function Issue(options, currentRepository) {
    this.options = options;
    this.currentRepository = currentRepository;
}

Issue.DETAILS = {
    options: {
        'all' : String,
        'comment': String,
        'list': Boolean,
        'number': Number,
        'repo': String,
        'user': String
    },
    shorthands: {
        'a': [ '--all'  ],
        'c': [ '--comment' ],
        'l': [ '--list' ],
        'n': [ '--number' ],
        'r': [ '--repo' ],
        'u': [ '--user' ]
    },
    description: 'Provides a set of util commands to work with Issues.'
};

Issue.prototype.run = function() {
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

Issue.prototype.list = function(repo) {
    var instance = this;

    base.github.issues.repoIssues({
        user: instance.options.user,
        repo: repo
    },
    function(err, issues) {
        if (err && !instance.options.all) {
            var msg = JSON.parse(err.message).message;
            logger.error(msg);
        }

        if (issues && issues.length > 0) {
            logger.logTemplateFile('is.handlebars', {
                user: instance.options.user,
                repo: repo,
                issues: issues
            });
        }
    });
};

Issue.prototype.listFromAllRepositories = function() {
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

Issue.prototype.comment = function(opt_callback) {
    var instance = this,
        options = instance.options,
        payload;

    message = logger.applyReplacements(options.comment);

    payload = {
        body: message,
        number: options.number,
        repo: options.repo,
        user: options.user
    };

    base.github.issues.createComment(payload, opt_callback);
};

exports.Impl = Issue;