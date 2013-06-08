/*
 * Copyright 2013, All Rights Reserved.
 *
 * Code licensed under the BSD License:
 * https://github.com/eduardolundgren/blob/master/LICENSE.md
 *
 * @author Zeno Rocha <zno.rocha@gmail.com>
 * @author Eduardo Lundgren <eduardolundgren@gmail.com>
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

    if (!options.repo && !options.all) {
        logger.error('You must specify a Git repository to run this command');
    }
}

// -- Constants ----------------------------------------------------------------
Issue.DETAILS = {
    alias: 'is',
    description: 'Provides a set of util commands to work with Issues.',
    options: {
        'all'      : Boolean,
        'close'    : Boolean,
        'comment'  : String,
        'detailed' : Boolean,
        'label'    : String,
        'list'     : Boolean,
        'message'  : String,
        'milestone': Number,
        'new'      : Boolean,
        'number'   : Number,
        'open'     : Boolean,
        'remote'   : String,
        'repo'     : String,
        'state'    : [ 'open', 'closed' ],
        'title'    : String,
        'user'     : String
    },
    shorthands: {
        'a': [ '--all' ],
        'C': [ '--close' ],
        'c': [ '--comment' ],
        'd': [ '--detailed' ],
        'L': [ '--label' ],
        'l': [ '--list' ],
        'm': [ '--message' ],
        'M': [ '--milestone' ],
        'N': [ '--new' ],
        'n': [ '--number' ],
        'o': [ '--open' ],
        'r': [ '--repo' ],
        'S': [ '--state' ],
        't': [ '--title' ],
        'u': [ '--user' ]
    },
    payload: function(payload, options) {
        if (payload[0]) {
            options.new = true;
            options.title = options.title || payload[0];
            options.message = options.message || payload[1];
        }
        else {
            options.list = true;
        }
    }
};

Issue.STATE_CLOSED = 'closed';
Issue.STATE_OPEN = 'open';

// -- Commands -----------------------------------------------------------------
Issue.prototype.run = function() {
    var instance = this,
        options = instance.options,
        config = base.getGlobalConfig();

    options.state = options.state || Issue.STATE_OPEN;

    if (options.close) {
        options.state = Issue.STATE_CLOSED;

        logger.logTemplate('{{prefix}} [info] Closing issue {{greenBright "#" options.number}} on {{greenBright options.user "/" options.repo}}', {
            options: options
        });

        instance.close(function(err) {
            logger.defaultCallback(
                err, null, logger.compileTemplate('{{issueLink}}', { options: options }));
        });
    }

    if (options.comment) {
        logger.logTemplate('{{prefix}} [info] Adding comment on issue {{greenBright "#" options.number}}', {
            options: options
        });

        instance.comment(function(err) {
            logger.defaultCallback(
                err, null, logger.compileTemplate('{{issueLink}}', { options: options }));
        });
    }

    if (options.list) {
        if (options.all) {
            logger.logTemplate('{{prefix}} [info] Listing {{greenBright options.state}} issues for {{greenBright options.user}}', {
                options: options
            });

            instance.listFromAllRepositories(function(err) {
                logger.defaultCallback(err, null, false);
            });
        }
        else {
            logger.logTemplate('{{prefix}} [info] Listing {{greenBright options.state}} issues on {{greenBright options.user "/" options.repo}}', {
                options: options
            });

            instance.list(options.user, options.repo, function(err) {
                logger.defaultCallback(err, null, false);
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

            logger.defaultCallback(
                err, null, logger.compileTemplate('{{issueLink}}', { options: options }));
        });
    }

    if (options.open) {
        logger.logTemplate('{{prefix}} [info] Opening issue {{greenBright "#" options.number}} on {{greenBright options.user "/" options.repo}}', {
            options: options
        });

        instance.open(function(err) {
            logger.defaultCallback(
                err, null, logger.compileTemplate('{{issueLink}}', { options: options }));
        });
    }

};

Issue.prototype.close = function(opt_callback) {
    var instance = this;

    instance.getIssue_(function(err, issue) {
        if (err) {
            opt_callback && opt_callback(err);
        }
        else {
            instance.editIssue_(issue.title, Issue.STATE_CLOSED, opt_callback);
        }
    });
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

Issue.prototype.editIssue_ = function(title, state, opt_callback) {
    var instance = this,
        options = instance.options,
        payload;

    payload = {
        labels: options.label = options.label || [],
        number: options.number,
        repo: options.repo,
        state: state,
        title: title,
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

Issue.prototype.list = function(user, repo, opt_callback) {
    var instance = this,
        options = instance.options,
        payload;

    options.label = options.label || '';
    options.milestone = options.milestone || 'none';

    payload = {
        labels: options.label,
        milestone: options.milestone,
        repo: repo,
        state: options.state,
        user: user
    };

    base.github.issues.repoIssues(payload, function(err, issues) {
        if (err && !options.all) {
            logger.error(logger.getErrorMessage(err));
        }

        if (issues && issues.length > 0) {
            logger.logTemplateFile('issue.handlebars', {
                detailed: options.detailed,
                issues: issues,
                repo: repo,
                user: user
            });

            opt_callback && opt_callback(err);
        }
    });
};

Issue.prototype.listFromAllRepositories = function(opt_callback) {
    var instance = this,
        options = instance.options,
        payload;

    payload = {
        type: 'all',
        user: options.user
    };

    base.github.repos.getFromUser(payload, function(err, repositories) {
        if (err) {
            opt_callback && opt_callback(err);
        }
        else {
            repositories.forEach(function(repository) {
                instance.list(repository.owner.login, repository.name, opt_callback);
            });
        }
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

Issue.prototype.open = function(opt_callback) {
    var instance = this;

    instance.getIssue_(function(err, issue) {
        if (err) {
            opt_callback && opt_callback(err);
        }
        else {
            instance.editIssue_(issue.title, Issue.STATE_OPEN, opt_callback);
        }
    });
};

exports.Impl = Issue;