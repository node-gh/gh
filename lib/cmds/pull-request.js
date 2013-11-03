/*
 * Copyright 2013, All Rights Reserved.
 *
 * Code licensed under the BSD License:
 * https://github.com/node-gh/gh/blob/master/LICENSE.md
 *
 * @author Eduardo Lundgren <eduardolundgren@gmail.com>
 * @author Zeno Rocha <zno.rocha@gmail.com>
 */

'use strict';

// -- Requires -------------------------------------------------------------------------------------

var async = require('async'),
    base = require('../base'),
    git = require('../git'),
    hooks = require('../hooks'),
    logger = require('../logger'),
    openUrl = require('open'),
    Issues = require('./issue').Impl,
    config = base.getConfig();

// -- Constructor ----------------------------------------------------------------------------------

function PullRequest(options) {
    this.options = options;

    if (!options.repo && !options.all) {
        logger.error('You must specify a Git repository to run this command');
    }

    this.issue = new Issues(options);
}

// -- Constants ------------------------------------------------------------------------------------

PullRequest.DETAILS = {
    alias: 'pr',
    description: 'Provides a set of util commands to work with Pull Requests.',
    iterative: 'number',
    commands: [
        'browser',
        'close',
        'comment',
        'fetch',
        'fwd',
        'list',
        'merge',
        'open',
        'rebase',
        'submit'
    ],
    options: {
        'all': Boolean,
        'branch': String,
        'browser': Boolean,
        'close': Boolean,
        'comment': String,
        'description': String,
        'detailed': Boolean,
        'fetch': Boolean,
        'fwd': String,
        'issue': Number,
        'list': Boolean,
        'merge': Boolean,
        'number': [String, Array],
        'open': Boolean,
        'rebase': Boolean,
        'remote': String,
        'repo': String,
        'state': ['open', 'closed'],
        'submit': String,
        'title': String,
        'user': String
    },
    shorthands: {
        'a': ['--all'],
        'b': ['--branch'],
        'B': ['--browser'],
        'C': ['--close'],
        'c': ['--comment'],
        'D': ['--description'],
        'd': ['--detailed'],
        'f': ['--fetch'],
        'i': ['--issue'],
        'l': ['--list'],
        'M': ['--merge'],
        'n': ['--number'],
        'o': ['--open'],
        'R': ['--rebase'],
        'r': ['--repo'],
        'S': ['--state'],
        's': ['--submit'],
        't': ['--title'],
        'u': ['--user']
    },
    payload: function(payload, options) {
        if (payload[0]) {
            options.fetch = true;
        }
        else {
            options.list = true;
        }
    }
};

PullRequest.FETCH_TYPE_CHECKOUT = 'checkout';

PullRequest.FETCH_TYPE_MERGE = 'merge';

PullRequest.FETCH_TYPE_REBASE = 'rebase';

PullRequest.FETCH_TYPE_SILENT = 'silent';

PullRequest.STATE_CLOSED = 'closed';

PullRequest.STATE_OPEN = 'open';

// -- Commands -------------------------------------------------------------------------------------

PullRequest.prototype.options = null;

PullRequest.prototype.issues = null;

PullRequest.prototype.run = function() {
    var instance = this,
        options = instance.options,
        fetchType;

    options.state = options.state || PullRequest.STATE_OPEN;
    options.number = options.number || instance.getPullRequestNumberFromBranch_();
    options.pullBranch = instance.getBranchNameFromPullNumber_(options.number);

    if (options.browser) {
        instance.browser(options.user, options.repo, options.number);
    }

    if (!options.list) {
        options.branch = options.branch || config.default_branch;
    }

    if (options.close) {
        hooks.invoke('pull-request.close', instance, function(afterHooksCallback) {
            logger.logTemplate(
                '{{prefix}} [info] Closing pull request {{greenBright "#" options.number}}', {
                    options: options
                });

            instance.close(function(err) {
                logger.defaultCallback(
                    err, null, logger.compileTemplate('{{link}}', {
                        options: options
                    }));

                instance.setMergeCommentRequiredOptions_(afterHooksCallback);
            });
        });
    }

    if (options.comment) {
        logger.logTemplate(
            '{{prefix}} [info] Adding comment on pull request {{greenBright "#" options.number}}', {
                options: options
            });

        instance.issue.comment(function(err) {
            logger.defaultCallback(
                err, null, logger.compileTemplate('{{link}}', {
                    options: options
                }));
        });
    }

    if (options.fetch) {
        fetchType = PullRequest.FETCH_TYPE_CHECKOUT;

        if (options.merge) {
            fetchType = PullRequest.FETCH_TYPE_MERGE;
        }
        else if (options.rebase) {
            fetchType = PullRequest.FETCH_TYPE_REBASE;
        }

        hooks.invoke('pull-request.fetch', instance, function(afterHooksCallback) {
            logger.logTemplateFile('pr-fetch.handlebars', {
                currentBranch: options.currentBranch,
                options: options
            });

            instance.fetch(fetchType, function(err) {
                logger.defaultCallback(err);
                afterHooksCallback();
            });
        });
    }
    else if (options.merge || options.rebase) {
        hooks.invoke('pull-request.merge', instance, function(afterHooksCallback) {
            logger.logTemplateFile('pr-merge.handlebars', {
                options: options
            });

            instance.merge(function() {
                instance.setMergeCommentRequiredOptions_(afterHooksCallback);
            });
        });
    }

    if (options.fwd) {
        hooks.invoke('pull-request.fwd', instance, function(afterHooksCallback) {
            logger.logTemplate(
                '{{prefix}} [info] Forwarding pull request {{greenBright "#" options.number}} to {{{magentaBright "@" options.fwd}}}', {
                    options: options
                });

            instance.forward(function(err, pull) {
                if (pull) {
                    options.forwardedPull = pull.number;
                }
                logger.defaultCallback(
                    err, null, logger.compileTemplate('{{forwardedLink}}', {
                        options: options
                    }));

                instance.setMergeCommentRequiredOptions_(afterHooksCallback);
            });
        });
    }

    if (options.list) {
        if (options.all) {
            logger.logTemplate(
                '{{prefix}} [info] Listing {{options.state}} pull requests for {{greenBright options.user}}', {
                    options: options
                });

            instance.listFromAllRepositories(function(err) {
                logger.defaultCallback(err, null, false);
            });
        }
        else {
            logger.logTemplate(
                '{{prefix}} [info] Listing {{options.state}} pull requests on {{greenBright options.user "/" options.repo}}', {
                    options: options
                });

            instance.list(options.user, options.repo, function(err) {
                logger.defaultCallback(err, null, false);
            });
        }
    }

    if (options.open) {
        hooks.invoke('pull-request.open', instance, function(afterHooksCallback) {
            logger.logTemplate(
                '{{prefix}} [info] Opening pull request {{greenBright "#" options.number}}', {
                    options: options
                });

            instance.open(function(err) {
                logger.defaultCallback(
                    err, null, logger.compileTemplate('{{link}}', {
                        options: options
                    }));

                afterHooksCallback();
            });
        });
    }

    if (options.submit) {
        hooks.invoke('pull-request.submit', instance, function(afterHooksCallback) {
            logger.logTemplate(
                '{{prefix}} [info] Submitting pull request to {{{magentaBright "@" options.submit}}}', {
                    options: options
                });

            instance.submit(options.submit, function(err, pull) {
                if (pull) {
                    options.submittedPull = pull.number;
                }

                logger.defaultCallback(
                    err, null, logger.compileTemplate('{{submittedLink}}', {
                        options: options
                    }));

                instance.setMergeCommentRequiredOptions_(afterHooksCallback);
            });
        });
    }
};

PullRequest.prototype.browser = function(user, repo, number) {
    openUrl('https://github.com/' + user + '/' + repo + '/pull/' + number);
};

PullRequest.prototype.close = function(opt_callback) {
    var instance = this,
        options = instance.options,
        operations,
        pull;

    operations = [
        function(callback) {
            instance.getPullRequest_(function(err, data) {
                if (!err) {
                    pull = data;
                }
                callback(err);
            });
        },
        function(callback) {
            instance.updatePullRequest_(
                pull.title, pull.body, PullRequest.STATE_CLOSED, callback);
        },
        function(callback) {
            if (options.pullBranch === options.currentBranch) {
                git.checkout(options.branch, null, callback);
            }
            else {
                callback();
            }
        },
        function(callback) {
            if (options.pullBranch) {
                git.exec('branch', ['-D', options.pullBranch]);
            }

            callback();
        }
    ];

    async.series(operations, function(err) {
        opt_callback && opt_callback(err, pull);
    });
};

PullRequest.prototype.checkPullRequestIntegrity_ = function(originalError, user, opt_callback) {
    var instance = this,
        options = instance.options,
        payload,
        pull;

    payload = {
        user: user,
        repo: options.repo,
        state: PullRequest.STATE_OPEN
    };

    base.github.pullRequests.getAll(payload, function(err, pulls) {
        if (!err) {
            pulls.forEach(function(data) {
                if ((data.base.ref === options.branch) &&
                    (data.head.ref === options.currentBranch) &&
                    (data.base.sha === data.head.sha) &&
                    (data.base.user.login === user) &&
                    (data.head.user.login === options.user)) {

                    pull = data;
                    originalError = null;
                    return;
                }
            });
        }

        opt_callback && opt_callback(originalError, pull);
    });
};

PullRequest.prototype.fetch = function(opt_type, opt_callback) {
    var instance = this,
        options = instance.options,
        headBranch,
        operations,
        pull,
        repoUrl;

    operations = [
        function(callback) {
            instance.getPullRequest_(function(err, data) {
                if (!err) {
                    pull = data;
                    headBranch = pull.head.ref;
                    repoUrl = pull.head.repo.ssh_url;
                }
                callback(err);
            });
        },
        function(callback) {
            git.exec('fetch', [repoUrl, headBranch + ':' + options.pullBranch], callback);
        },
        function(callback) {
            if (opt_type === PullRequest.FETCH_TYPE_REBASE) {
                git.merge(options.pullBranch, true, true, callback);
            }
            else if (opt_type === PullRequest.FETCH_TYPE_MERGE) {
                git.merge(options.pullBranch, false, true, callback);
            }
            else if (opt_type === PullRequest.FETCH_TYPE_CHECKOUT) {
                git.checkout(options.pullBranch, null, callback);
            }
            else {
                callback();
            }
        }
    ];

    async.series(operations, function(err) {
        opt_callback && opt_callback(err, pull);
    });
};

PullRequest.prototype.forward = function(opt_callback) {
    var instance = this,
        options = instance.options,
        operations,
        submittedPull,
        pull;

    operations = [
        function(callback) {
            instance.fetch(PullRequest.FETCH_TYPE_SILENT, function(err, data) {
                pull = data;
                callback(err);
            });
        },
        function(callback) {
            options.title = pull.title;
            instance.submit(options.fwd, function(err, data) {
                submittedPull = data;
                callback(err);
            });
        }
    ];

    async.series(operations, function(err) {
        opt_callback && opt_callback(err, submittedPull);
    });
};

PullRequest.prototype.getPullRequest_ = function(opt_callback) {
    var instance = this,
        options = instance.options,
        payload;

    payload = {
        number: options.number,
        repo: options.repo,
        user: options.user
    };

    base.github.pullRequests.get(payload, opt_callback);
};

PullRequest.prototype.getBranchNameFromPullNumber_ = function(number) {
    if (number) {
        return config.pull_branch_name_prefix + number;
    }
};

PullRequest.prototype.getPullRequestNumberFromBranch_ = function() {
    var instance = this,
        options = instance.options,
        prefix;

    prefix = config.pull_branch_name_prefix;

    if (options.currentBranch && options.currentBranch.indexOf(prefix) > -1) {
        return options.currentBranch.replace(prefix, '');
    }
};

PullRequest.prototype.getPullsTemplateJson_ = function(pulls, opt_callback) {
    var instance = this,
        options = instance.options,
        branch,
        branches,
        json;

    branches = {};
    json = {
        branches: []
    };

    pulls.forEach(function(pull) {
        branch = pull.base.ref;

        if (!options.branch || options.branch === branch) {
            branches[branch] = branches[branch] || [];
            branches[branch].push(pull);
        }
    });

    Object.keys(branches).forEach(function(branch) {
        json.branches.push({
            name: branch,
            pulls: branches[branch],
            total: branches[branch].length
        });
    });

    opt_callback && opt_callback(null, json);
};

PullRequest.prototype.list = function(user, repo, opt_callback) {
    var instance = this,
        options = instance.options,
        json,
        operations,
        payload,
        pulls;

    payload = {
        repo: repo,
        state: options.state,
        user: user
    };

    operations = [
        function(callback) {
            base.github.pullRequests.getAll(payload, function(err, data) {
                if (!err) {
                    pulls = data;
                }
                callback(err);
            });
        },
        function(callback) {
            instance.getPullsTemplateJson_(pulls, function(err, data) {
                if (!err) {
                    json = data;
                }
                callback(err);
            });
        }
    ];

    async.series(operations, function(err) {
        if (!err && pulls.length) {
            json.repo = repo;
            json.user = user;
            json.detailed = options.detailed;
            logger.logTemplateFile('pr.handlebars', json);
        }

        opt_callback && opt_callback(err);
    });
};

PullRequest.prototype.listFromAllRepositories = function(opt_callback) {
    var instance = this,
        options = instance.options,
        payload;

    payload = {
        type: 'all',
        user: options.user
    };

    base.github.repos.getAll(payload, function(err, repositories) {
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

PullRequest.prototype.merge = function(opt_callback) {
    var instance = this,
        options = instance.options,
        operations,
        pull;

    operations = [
        function(callback) {
            git.checkout(options.branch, null, callback);
        },
        function(callback) {
            git.merge(options.pullBranch, options.rebase, false, callback, true);
        },
        function(callback) {
            git.exec('push', [config.default_remote, options.branch], function(err) {
                if (err) {
                    err = 'Unable to push local branch.';
                }
                callback(err);
            }, true);
        },
        function(callback) {
            git.exec('branch', ['-D', options.pullBranch], callback);
        }
    ];

    async.series(operations, function(err) {
        opt_callback && opt_callback(err, pull);
    });
};

PullRequest.prototype.open = function(opt_callback) {
    var instance = this;

    instance.getPullRequest_(function(err, pull) {
        if (err) {
            opt_callback && opt_callback(err);
        }
        else {
            instance.updatePullRequest_(
                pull.title, pull.body, PullRequest.STATE_OPEN, opt_callback);
        }
    });
};

PullRequest.prototype.setMergeCommentRequiredOptions_ = function(opt_callback) {
    var instance = this,
        options = instance.options;

    git.getLastCommitSHA(function(err, lastCommitSHA) {
        options.currentSHA = lastCommitSHA;

        git.countUserAdjacentCommits(function(err, counter) {
            if (counter > 0) {
                options.changes = counter;
            }
            options.pullHeadSHA = lastCommitSHA + '~' + counter;

            opt_callback && opt_callback();
        });
    });
};

PullRequest.prototype.submit = function(user, opt_callback) {
    var instance = this,
        options = instance.options,
        operations,
        pullBranch;

    pullBranch = options.pullBranch || options.currentBranch;

    operations = [
        function(callback) {
            git.exec('push', [config.default_remote, pullBranch], function(err) {
                if (err) {
                    err = 'Unable to push local branch.';
                }
                callback(err);
            }, true);
        },
        function(callback) {
            if (options.title) {
                callback();
            }
            else {
                git.getLastCommitMessage(pullBranch, function(err, data) {
                    options.title = data;
                    callback(err);
                });
            }
        },
        function(callback) {
            var payload = {
                base: options.branch,
                head: options.user + ':' + pullBranch,
                repo: options.repo,
                user: user
            };

            if (options.issue) {
                payload.issue = options.issue;
                base.github.pullRequests.createFromIssue(payload, callback);
            }
            else {
                payload.body = options.description;
                payload.title = options.title;
                base.github.pullRequests.create(payload, callback);
            }
        }
    ];

    async.series(operations, function(err, results) {
        if (err) {
            instance.checkPullRequestIntegrity_(err, user, opt_callback);
        }
        else {
            opt_callback && opt_callback(err, results[2]);
        }
    });
};

PullRequest.prototype.updatePullRequest_ = function(title, opt_body, state, opt_callback) {
    var instance = this,
        options = instance.options,
        payload;

    if (opt_body) {
        opt_body = logger.applyReplacements(opt_body);
    }

    payload = {
        body: opt_body,
        number: options.number,
        repo: options.repo,
        state: state,
        title: title,
        user: options.user
    };

    base.github.pullRequests.update(payload, opt_callback);
};

exports.Impl = PullRequest;
