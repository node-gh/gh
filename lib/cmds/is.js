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
        'all'    : String,
        'comment': String,
        'label'  : String,
        'list'   : Boolean,
        'message': String,
        'new'    : Boolean,
        'number' : Number,
        'repo'   : String,
        'title'  : String,
        'user'   : String
    },
    shorthands: {
        'a': [ '--all' ],
        'c': [ '--comment' ],
        'L': [ '--label' ],
        'l': [ '--list' ],
        'm': [ '--message' ],
        'N': [ '--new' ],
        'n': [ '--number' ],
        'r': [ '--repo' ],
        't': [ '--title' ],
        'u': [ '--user' ]
    },
    description: 'Provides a set of util commands to work with Issues.'
};

Issue.prototype.run = function() {
    var instance = this,
        options = instance.options,
        success;

    options.user = options.user || base.getUser();
    options.repo = options.repo || instance.currentRepository;

    if (options.comment) {
        logger.logTemplate('{{prefix}} [info] Adding comment on issue {{greenBright "#" options.number}}', {
            options: options
        });

        instance.comment(function(err) {
            success = logger.compileTemplate('{{issueLink}}', { options: options });
            logger.defaultCallback(err, null, success);
        });
    }

    if (options.new) {
        logger.logTemplate('{{prefix}} [info] Creating a new issue on {{greenBright options.user "/" options.repo}}', {
            options: options
        });

        instance.new(function(err, issue) {
            if (issue) {
                options.number = issue.number;
            }

            success = logger.compileTemplate('{{issueLink}}', { options: options });
            logger.defaultCallback(err, null, success);
        });
    }

    if (options.list) {
        if (options.all) {
            logger.logTemplate('{{prefix}} [info] Listing issues for {{greenBright options.user}}', {
                options: options
            });

            instance.listFromAllRepositories();
        }
        else {
            logger.logTemplate('{{prefix}} [info] Listing issues on {{greenBright options.user "/" options.repo}}', {
                options: options
            });

            instance.list(options.repo);
        }
    }
};

Issue.prototype.comment = function(opt_callback) {
    var instance = this,
        options = instance.options,
        payload;

    options.comment = logger.applyReplacements(options.comment);

    payload = {
        body: options.comment,
        number: options.number,
        repo: options.repo,
        user: options.user
    };

    base.github.issues.createComment(payload, opt_callback);
};

Issue.prototype.list = function(repo) {
    var instance = this,
        options = instance.options,
        payload;

    payload = {
        user: options.user,
        repo: repo
    };

    base.github.issues.repoIssues(payload, function(err, issues) {
        if (err && !options.all) {
            logger.error(logger.getErrorMessage(err));
        }

        if (issues && issues.length > 0) {
            logger.logTemplateFile('is.handlebars', {
                user: options.user,
                repo: repo,
                issues: issues
            });
        }
    });
};

Issue.prototype.listFromAllRepositories = function() {
    var instance = this,
        payload;

    payload = {
        type: 'all'
    };

    base.github.repos.getAll(payload, function(err, repositories) {
        repositories.forEach(function(repository) {
            instance.list(repository.name);
        });
    });
};

Issue.prototype.new = function(opt_callback) {
    var instance = this,
        options = instance.options,
        payload;

    if (options.message) {
        options.message = logger.applyReplacements(options.message);
    }

    if (options.label) {
        options.label = options.label.split(',');
    } else {
        options.label = [];
    }

    payload = {
        body: options.message,
        repo: options.repo,
        title: options.title,
        user: options.user,
        labels: options.label
    };

    base.github.issues.create(payload, opt_callback);
};

exports.Impl = Issue;