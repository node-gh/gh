/*
 * Copyright 2013 Zeno Rocha, All Rights Reserved.
 *
 * Code licensed under the BSD License:
 * https://github.com/eduardolundgren/blob/master/LICENSE.md
 *
 * @author Zeno Rocha <zno.rocha@gmail.com>
 */

// -- Requires -----------------------------------------------------------------
var async = require('async'),
    base = require('../base'),
    clc = require('cli-color'),
    logger = require('../logger'),
    open = require('open');

// -- Constructor --------------------------------------------------------------
function Issue(options) {
    this.options = options;

    if (!options.repo) {
        logger.error('You must specify a Git repository to run this command');
    }
}

// -- Constants ----------------------------------------------------------------
Issue.DETAILS = {
    options: {
        'all'    : String,
        'close'  : Boolean,
        'comment': String,
        'label'  : String,
        'list'   : Boolean,
        'message': String,
        'new'    : Boolean,
        'number' : Number,
        'open'   : Boolean,
        'repo'   : String,
        'title'  : String,
        'user'   : String
    },
    shorthands: {
        'a': [ '--all' ],
        'C': [ '--close' ],
        'c': [ '--comment' ],
        'L': [ '--label' ],
        'l': [ '--list' ],
        'm': [ '--message' ],
        'N': [ '--new' ],
        'n': [ '--number' ],
        'o': [ '--open' ],
        'r': [ '--repo' ],
        't': [ '--title' ],
        'u': [ '--user' ]
    },
    description: 'Provides a set of util commands to work with Issues.'
};

Issue.STATE_CLOSED = 'closed';
Issue.STATE_OPEN = 'open';

// -- Commands -----------------------------------------------------------------
Issue.prototype.run = function() {
    var instance = this,
        options = instance.options,
        config = base.getGlobalConfig(),
        success = false;

    if (options.close) {
        options.state = Issue.STATE_CLOSED;

        logger.logTemplate('{{prefix}} [info] Closing issue {{greenBright "#" options.number}} on {{greenBright options.user "/" options.repo}}', {
            options: options
        });

        instance.updateState(function(err) {
            success = logger.compileTemplate('{{issueLink}}', { options: options });
            logger.defaultCallback(err, null, success);
        });
    }

    if (options.comment) {
        logger.logTemplate('{{prefix}} [info] Adding comment on issue {{greenBright "#" options.number}}', {
            options: options
        });

        instance.comment(function(err) {
            success = logger.compileTemplate('{{issueLink}}', { options: options });
            logger.defaultCallback(err, null, success);
        });
    }

    if (options.list) {
        if (options.all) {
            logger.logTemplate('{{prefix}} [info] Listing issues for {{greenBright options.user}}', {
                options: options
            });

            instance.listFromAllRepositories(function(err) {
                logger.defaultCallback(err, null, success);
            });
        }
        else {
            logger.logTemplate('{{prefix}} [info] Listing issues on {{greenBright options.user "/" options.repo}}', {
                options: options
            });

            instance.list(options.repo, function(err) {
                logger.defaultCallback(err, null, success);
            });
        }
    }

    if (options.new) {
        logger.logTemplate('{{prefix}} [info] Creating a new issue on {{greenBright options.user "/" options.repo}}', {
            options: options
        });

        instance.new(function(err, issue) {
            if (issue) {
                options.number = issue.number;

                if (config.open_issue_in_browser) {
                    open(issue.html_url);
                }
            }

            success = logger.compileTemplate('{{issueLink}}', { options: options });
            logger.defaultCallback(err, null, success);
        });
    }

    if (options.open) {
        options.state = Issue.STATE_OPEN;

        logger.logTemplate('{{prefix}} [info] Opening issue {{greenBright "#" options.number}} on {{greenBright options.user "/" options.repo}}', {
            options: options
        });

        instance.updateState(function(err) {
            success = logger.compileTemplate('{{issueLink}}', { options: options });
            logger.defaultCallback(err, null, success);
        });
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

Issue.prototype.editIssue_ = function(opt_callback) {
    var instance = this,
        options = instance.options,
        payload;

    payload = {
        labels: options.label = options.label || [],
        number: options.number,
        repo: options.repo,
        state: options.state,
        title: options.title,
        user: options.user
    };

    base.github.issues.edit(payload, opt_callback);
};

Issue.prototype.getIssue_ = function(opt_callback) {
    var instance = this,
        options = instance.options,
        payload;

    payload = {
        number: options.number,
        repo: options.repo,
        user: options.user
    };

    base.github.issues.getRepoIssue(payload, opt_callback);
};

Issue.prototype.list = function(repo, opt_callback) {
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

            opt_callback && opt_callback(err);
        }
    });
};

Issue.prototype.listFromAllRepositories = function(opt_callback) {
    var instance = this,
        payload;

    payload = {
        type: 'all'
    };

    base.github.repos.getAll(payload, function(err, repositories) {
        repositories.forEach(function(repository) {
            instance.list(repository.name, opt_callback);
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

Issue.prototype.updateState = function(opt_callback) {
    var instance = this,
        options = instance.options,
        operations,
        pull;

    operations = [
        function(callback) {
            instance.getIssue_(function(err, issue) {
                options.title = options.title || issue.title;
                callback(err);
            });
        },
        function(callback) {
            instance.editIssue_(function(err, data) {
                callback(err);
            });
        }
    ];

    async.series(operations, function(err) {
        opt_callback && opt_callback(err);
    });
};

exports.Impl = Issue;