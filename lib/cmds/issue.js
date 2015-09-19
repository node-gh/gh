/*
 * Copyright 2013-2015, All Rights Reserved.
 *
 * Code licensed under the BSD License:
 * https://github.com/node-gh/gh/blob/master/LICENSE.md
 *
 * @author Zeno Rocha <zno.rocha@gmail.com>
 * @author Eduardo Lundgren <edu@rdo.io>
 */

'use strict';

// -- Requires -------------------------------------------------------------------------------------

var async = require('async'),
    base = require('../base'),
    hooks = require('../hooks'),
    logger = require('../logger'),
    openUrl = require('open'),
    config = base.getConfig();

// -- Constructor ----------------------------------------------------------------------------------

function Issue(options) {
    this.options = options;

    if (!options.repo && !options.all) {
        logger.error('You must specify a Git repository with a GitHub remote to run this command');
    }
}

// -- Constants ------------------------------------------------------------------------------------

Issue.DETAILS = {
    alias: 'is',
    description: 'Provides a set of util commands to work with Issues.',
    iterative: 'number',
    commands: [
        'browser',
        'close',
        'comment',
        'list',
        'new',
        'open'
    ],
    options: {
        'all': Boolean,
        'assignee': String,
        'browser': Boolean,
        'close': Boolean,
        'comment': String,
        'detailed': Boolean,
        'label': String,
        'list': Boolean,
        'message': String,
        'milestone': [Number, String],
        'no-milestone': Boolean,
        'new': Boolean,
        'number': [String, Array],
        'open': Boolean,
        'remote': String,
        'repo': String,
        'state': ['open', 'closed'],
        'title': String,
        'user': String
    },
    shorthands: {
        'a': ['--all'],
        'A': ['--assignee'],
        'B': ['--browser'],
        'C': ['--close'],
        'c': ['--comment'],
        'd': ['--detailed'],
        'L': ['--label'],
        'l': ['--list'],
        'm': ['--message'],
        'M': ['--milestone'],
        'N': ['--new'],
        'n': ['--number'],
        'o': ['--open'],
        'r': ['--repo'],
        'S': ['--state'],
        't': ['--title'],
        'u': ['--user']
    },
    payload: function (payload, options) {
        if (payload[0]) {
            if (/^\d+$/.test(payload[0])) {
                options.browser = true;
                options.number = payload[0];
                return;
            }

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

// -- Commands -------------------------------------------------------------------------------------

Issue.prototype.run = function () {
    var instance = this,
        options = instance.options;

    options.state = options.state || Issue.STATE_OPEN;

    if (options.browser) {
        instance.browser(options.user, options.repo, options.number);
    }

    if (options.close) {
        hooks.invoke('issue.close', instance, function (afterHooksCallback) {
            options.state = Issue.STATE_CLOSED;

            logger.log('Closing issue ' + logger.colors.green('#' + options.number) +
                ' on ' + logger.colors.green(options.user + '/' + options.repo));

            instance.close(function (err, issue) {
                if (err) {
                    logger.error('Can\'t close issue.');
                    return;
                }

                logger.log(issue.html_url);
                afterHooksCallback();
            });
        });
    }

    if (options.comment) {
        logger.log('Adding comment on issue ' + logger.colors.green('#' + options.number));

        instance.comment(function (err, issue) {
            if (err) {
                logger.error('Can\'t add comment.');
                return;
            }

            logger.log(issue.html_url);
        });
    }

    if (options.list) {
        if (options.all) {
            logger.log('Listing ' + logger.colors.green(options.state) + ' issues for ' +
                logger.colors.green(options.user));

            instance.listFromAllRepositories(function (err) {
                if (err) {
                    logger.error('Can\'t list issues for ' + options.user + '.');
                    return;
                }
            });
        }
        else {
            logger.log('Listing ' + logger.colors.green(options.state) +
                ' issues on ' + logger.colors.green(options.user + '/' + options.repo));

            instance.list(options.user, options.repo, function (err) {
                if (err) {
                    logger.error('Can\'t list issues on ' + options.user + '/' + options.repo);
                    return;
                }
            });
        }
    }

    if (options.new) {
        hooks.invoke('issue.new', instance, function (afterHooksCallback) {
            logger.log('Creating a new issue on ' + logger.colors.green(options.user + '/' + options.repo));

            instance.new(function (err, issue) {
                if (err) {
                    logger.error('Can\'t create new issue.');
                    return;
                }

                if (issue) {
                    options.number = issue.number;
                }

                logger.log(issue.html_url);
                afterHooksCallback();
            });
        });
    }

    if (options.open) {
        hooks.invoke('issue.open', instance, function (afterHooksCallback) {
            logger.log('Opening issue ' + logger.colors.green('#' + options.number) +
                ' on ' + logger.colors.green(options.user + '/' + options.repo));

            instance.open(function (err, issue) {
                if (err) {
                    logger.error('Can\'t open issue.');
                    return;
                }

                logger.log(issue.html_url);
                afterHooksCallback();
            });
        });
    }

};

Issue.prototype.browser = function (user, repo, number) {
    if (!number) {
        number = '';
    }

    openUrl('https://github.com/' + user + '/' + repo + '/issues/' + number);
};

Issue.prototype.close = function (opt_callback) {
    var instance = this;

    instance.getIssue_(function (err, issue) {
        if (err) {
            opt_callback && opt_callback(err);
        }
        else {
            instance.editIssue_(issue.title, Issue.STATE_CLOSED, opt_callback);
        }
    });
};

Issue.prototype.comment = function (opt_callback) {
    var instance = this,
        options = instance.options,
        body,
        payload;

    body = logger.applyReplacements(options.comment, config.replace) + config.signature;

    payload = {
        body: body,
        number: options.number,
        repo: options.repo,
        user: options.user
    };

    base.github.issues.createComment(payload, opt_callback);
};

Issue.prototype.editIssue_ = function (title, state, opt_callback) {
    var instance = this,
        options = instance.options,
        payload;

    options.label = options.label || [];

    payload = {
        labels: options.label,
        number: options.number,
        assignee: options.assignee,
        milestone: options.milestone,
        repo: options.repo,
        state: state,
        title: title,
        user: options.user
    };

    base.github.issues.edit(payload, opt_callback);
};

Issue.prototype.getIssue_ = function (opt_callback) {
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

Issue.prototype.list = function (user, repo, opt_callback) {
    var instance = this,
        options = instance.options,
        operations = [],
        payload;

    options.label = options.label || '';

    payload = {
        labels: options.label,
        repo: repo,
        state: options.state,
        user: user
    };

    if (options['no-milestone']) {
        payload.milestone = 'none';
    } else if (options.milestone) {
        payload.milestone = options.milestone;
    }

    if (options.milestone) {
        operations.push(function (callback) {
            base.github.issues.getAllMilestones({
                repo: repo,
                user: user
            }, function (err, results) {
                if (err) {
                    logger.warn(err.message);
                }

                results.some(function (milestone) {
                    if (options.milestone === milestone.title) {
                        logger.debug('Milestone ' + milestone.title + ' number: ' + milestone.number);
                        payload.milestone = milestone.number;
                        return true;
                    }
                });

                callback();
            });
        });
    }

    if (options.assignee) {
        payload.assignee = options.assignee;
    }

    operations.push(function (callback) {
        base.github.issues.repoIssues(payload, callback);
    });

    async.series(operations, function (err, results) {
        var issues = [];

        if (err && !options.all) {
            logger.error(logger.getErrorMessage(err));
        }


        results.forEach(function (result) {
            if (result) {
                issues = issues.concat(result);
            }
        });

        issues.sort(function (a, b) {
            return a.number > b.number ? -1 : 1;
        });

        if (issues && issues.length > 0) {
            issues.forEach(function (issue) {
                var labels = issue.label || [];

                logger.log(logger.colors.green('#' + issue.number) + ' ' + issue.title + ' ' +
                    logger.colors.magenta('@' + issue.user.login + ' (' + logger.getDuration(issues.created_at) + ')'));

                if (options.detailed) {
                    if (issue.body) {
                        logger.log(issue.body);
                    }

                    labels.forEach(function (label) {
                        labels.push(label.name);
                    });

                    if (labels.length > 0) {
                        logger.log(logger.colors.green('label: ') + labels.join(', '));
                    }

                    if (issue.milestone) {
                        logger.log(logger.colors.green('milestone: ') +
                            issue.milestone.title + ' - ' + issue.milestone.number);
                    }

                    logger.log(logger.colors.blue(issue.html_url));
                }
            });

            opt_callback && opt_callback(err);
        }
    });
};

Issue.prototype.listFromAllRepositories = function (opt_callback) {
    var instance = this,
        options = instance.options,
        payload;

    payload = {
        type: 'all',
        user: options.user
    };

    base.github.repos.getAll(payload, function (err, repositories) {
        if (err) {
            opt_callback && opt_callback(err);
        }
        else {
            repositories.forEach(function (repository) {
                instance.list(repository.owner.login, repository.name, opt_callback);
            });
        }
    });
};

Issue.prototype.new = function (opt_callback) {
    var instance = this,
        options = instance.options,
        body,
        payload;

    if (options.message) {
        body = logger.applyReplacements(options.message, config.replace);
    }

    if (options.label) {
        options.label = options.label.split(',');
    }
    else {
        options.label = [];
    }

    payload = {
        assignee: options.assignee,
        body: body,
        repo: options.repo,
        title: options.title,
        user: options.user,
        labels: options.label
    };

    base.github.issues.create(payload, opt_callback);
};

Issue.prototype.open = function (opt_callback) {
    var instance = this;

    instance.getIssue_(function (err, issue) {
        if (err) {
            opt_callback && opt_callback(err);
        }
        else {
            instance.editIssue_(issue.title, Issue.STATE_OPEN, opt_callback);
        }
    });
};

exports.Impl = Issue;
