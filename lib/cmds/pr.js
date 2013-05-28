/*
* Copyright 2013 Eduardo Lundgren, All Rights Reserved.
*
* Code licensed under the BSD License:
* https://github.com/eduardolundgren/blob/master/LICENSE.md
*
* @author Eduardo Lundgren <eduardolundgren@gmail.com>
*/

var async = require('async'),
    base = require('../base'),
    clc = require('cli-color'),
    fs = require('fs'),
    git = require('../git'),
    path = require('path'),
    logger = require('../logger'),
    stripNewLines,
    issuesImpl = require('./is').Impl;

function PullRequest(options, currentRepository, currentBranch) {
    this.options = options;
    this.currentBranch = currentBranch;
    this.currentRepository = currentRepository;
    this.issues = new issuesImpl(options, currentRepository);
}

PullRequest.DETAILS = {
    options: {
        'all': Boolean,
        'branch': String,
        'close': Boolean,
        'detailed': Boolean,
        'fetch': Boolean,
        'fwd': String,
        'list': Boolean,
        'merge': Boolean,
        'message': String,
        'open': Boolean,
        'pull': Number,
        'rebase': Boolean,
        'repo': String,
        'state': [ 'open', 'closed' ],
        'submit': String,
        'user': String
    },
    shorthands: {
        'a': [ '--all' ],
        'b': [ '--branch' ],
        'c': [ '--close' ],
        'd': [ '--detailed' ],
        'f': [ '--fetch' ],
        'l': [ '--list' ],
        'M': [ '--merge' ],
        'm': [ '--message' ],
        'o': [ '--open' ],
        'p': [ '--pull' ],
        'R': [ '--rebase' ],
        'r': [ '--repo' ],
        'S': [ '--state' ],
        's': [ '--submit' ],
        'u': [ '--user' ]
    },
    description: 'Provides a set of util commands to work with Pull Requests.'
};

PullRequest.FETCH_TYPE_CHECKOUT = 'checkout';

PullRequest.FETCH_TYPE_MERGE = 'merge';

PullRequest.FETCH_TYPE_REBASE = 'rebase';

PullRequest.FETCH_TYPE_SILENT = 'silent';

PullRequest.STATE_CLOSED = 'closed';

PullRequest.STATE_OPEN = 'open';

PullRequest.prototype.currentBranch = null;

PullRequest.prototype.currentRepository = null;

PullRequest.prototype.options = null;

PullRequest.prototype.issues = null;

PullRequest.prototype.run = function() {
    var instance = this,
        options = instance.options,
        config = base.getGlobalConfig(),
        fetchType;

    options.repo = options.repo || instance.currentRepository;
    options.user = options.user || base.getUser();

    options.pull = options.pull || instance.getPullRequestNumberFromBranch_();
    options.pullBranch = instance.getBranchNameFromPullNumber_(options.pull);

    if (!options.list) {
        options.branch = options.branch || config.defaultbranch;
    }

    if (options.close) {
        logger.logTemplate('{{prefix}} [info] Closing pull request {{greenBright "#" options.pull}}', {
            options: options
        });

        instance.close(function(err) {
            logger.defaultCallback(
                err, null, logger.compileTemplate('{{link}}', { options: options }));
        });
    }

    if (options.message) {
        logger.logTemplate('{{prefix}} [info] Adding comment on pull request {{greenBright "#" options.pull}}', {
            options: options
        });

        instance.issues.comment(function(err) {
            logger.defaultCallback(
                err, null, logger.compileTemplate('{{link}}', { options: options }));
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

        logger.logTemplateFile('pr-fetch.handlebars', {
            currentBranch: instance.currentBranch,
            options: options
        });

        instance.fetch(fetchType, logger.defaultCallback);
    }
    else if (options.merge || options.rebase) {
        logger.logTemplateFile('pr-merge.handlebars', {
            options: options
        });

        instance.merge();
    }

    if (options.fwd) {
        logger.logTemplate('{{prefix}} [info] Forwarding pull request {{greenBright "#" options.pull}} to {{{magentaBright "@" options.fwd}}}', {
            options: options
        });

        instance.forward(function(err, pull) {
            if (pull) {
                options.forwardedPull = pull.number;
            }
            logger.defaultCallback(
                err, null, logger.compileTemplate('{{forwardedLink}}', { options: options }));
        });
    }

    if (options.list) {
        if (options.all) {
            instance.listFromAllRepositories();
        }
        else {
            instance.list(options.repo);
        }
    }

    if (options.open) {
        logger.logTemplate('{{prefix}} [info] Opening pull request {{greenBright "#" options.pull}}', {
            options: options
        });

        instance.open(function(err) {
            logger.defaultCallback(
                err, null, logger.compileTemplate('{{link}}', { options: options }));
        });
    }

    if (options.submit) {
        logger.logTemplate('{{prefix}} [info] Submitting pull request to {{{magentaBright "@" options.submit}}}', {
            options: options
        });

        instance.submit(options.submit, function(err, pull) {
            if (pull) {
                options.submittedPull = pull.number;
            }
            logger.defaultCallback(
                err, null, logger.compileTemplate('{{submittedLink}}', { options: options }));
        });
    }
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
            if (options.pullBranch === instance.currentBranch) {
                git.checkout(options.branch, null, callback);
            }
            else {
                callback();
            }
        },
        function(callback) {
            if (options.pullBranch) {
                git.exec('branch', [ '-D', options.pullBranch ]);
            }

            callback();
        }
    ];

    async.series(operations, function(err) {
        opt_callback && opt_callback(err);
    });
};

PullRequest.prototype.checkPullRequestIntegrity_ = function(user, opt_callback) {
    var instance = this,
        options = instance.options,
        args,
        payload,
        pull;

    args = [ 1, null ];
    payload = {
        user: user,
        repo: options.repo,
        state: PullRequest.STATE_OPEN
    };

    base.github.pullRequests.getAll(payload, function(err, pulls) {
        if (!err) {
            pulls.forEach(function(data) {
                if ((data.base.ref === options.branch) &&
                    (data.head.ref === instance.currentBranch) &&
                    (data.base.user.login === user) &&
                    (data.head.user.login === options.user)) {

                    pull = data;
                    args = [ 0, data ];
                    return;
                }
            });
        }

        opt_callback && opt_callback(err, pull);
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
                    repoUrl = pull.head.repo.git_url;
                }
                callback(err);
            });
        },
        function(callback) {
            git.exec('fetch', [ repoUrl, headBranch + ':' + options.pullBranch ], callback);
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
        config = base.getGlobalConfig(),
        operations,
        pull;

    operations = [
        function(callback) {
            instance.fetch(PullRequest.FETCH_TYPE_SILENT, callback);
        },
        function(callback) {
            instance.submit(options.fwd, function(err, data) {
                pull = data;
                callback(err);
            });
        },
        function(callback) {
            instance.close(callback);
        }
    ];

    async.series(operations, function(err) {
        opt_callback && opt_callback(err, pull);
    });
};

PullRequest.prototype.getPullRequest_ = function(opt_callback) {
    var instance = this,
        options = instance.options,
        payload;

    payload = {
        number: options.pull,
        repo: options.repo,
        user: options.user
    };

    base.github.pullRequests.get(payload, opt_callback);
};

PullRequest.prototype.getBranchNameFromPullNumber_ = function(number) {
    if (number) {
        return logger.compileTemplate(
            base.getGlobalConfig().branchname, { number: number });
    }
};

PullRequest.prototype.getPullRequestNumberFromBranch_ = function() {
    var instance = this,
        match;

    match = instance.currentBranch.match(/\d+$/);

    return match && match[0];
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

PullRequest.prototype.list = function(repo, opt_callback) {
    var instance = this,
        options = instance.options,
        json,
        operations,
        payload,
        pulls;

    payload = {
        repo: repo,
        state: options.state,
        user: options.user
    };

    operations = [
        function(callback) {
            base.github.pullRequests.getAll(payload, function(err, data) {
                if (!err) {
                    pulls = data;

                    if (!pulls.length) {
                        err = 1;
                    }
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
        if (!err) {
            json.repo = repo;
            json.user = options.user;
            json.detailed = options.detailed;
            logger.logTemplateFile('pr.handlebars', json);
        }

        opt_callback && opt_callback(err);
    });
};

PullRequest.prototype.listFromAllRepositories = function() {
    var instance = this;

    base.github.repos.getAll({ type: 'all' }, function(err, repositories) {
        repositories.forEach(function(repository) {
            instance.list(repository.name);
        });
    });
};

PullRequest.prototype.merge = function(opt_callback) {
    var instance = this,
        options = instance.options,
        operations;

    operations = [
        function(callback) {
            git.checkout(options.branch, null, callback);
        },
        function(callback) {
            git.merge(options.pullBranch, options.rebase, false, function(err, data) {
                console.log(data);
                callback(err);
            });
        },
        function(callback) {
            instance.close(callback);
        }
    ];

    async.series(operations, opt_callback);
};

PullRequest.prototype.open = function(opt_callback) {
    var instance = this;

    instance.getPullRequest_(function(err, pull) {
        instance.updatePullRequest_(
            pull.title, pull.body, PullRequest.STATE_OPEN, opt_callback);
    });
};

PullRequest.prototype.submit = function(user, opt_callback) {
    var instance = this,
        options = instance.options,
        operations;

    operations = [
        function(callback) {
            git.exec('push', [ 'origin', instance.currentBranch ], callback);
        },
        function(callback) {
            base.github.pullRequests.create({
                base: options.branch,
                body: '',
                head: options.user + ':' + instance.currentBranch,
                repo: options.repo,
                title: instance.currentBranch,
                user: user
            }, callback);
        }
    ];

    async.series(operations, function(err, results) {
        if (err) {
            instance.checkPullRequestIntegrity_(user, opt_callback);
        }
        else {
            opt_callback && opt_callback(err, results[1]);
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
        number: options.pull,
        repo: options.repo,
        state: state,
        title: title,
        user: options.user
    };

    base.github.pullRequests.update(payload, function(err, pull) {
        opt_callback && opt_callback(err, pull);
    });
};

exports.Impl = PullRequest;