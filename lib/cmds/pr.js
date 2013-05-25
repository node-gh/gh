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
    mustache = require('mustache'),
    logger,
    stripNewLines,
    logWithPullNumber;

logger = base.logger;

logWithPullNumber = function(number, message, opt_type) {
    logger[opt_type || 'info'](message + ' [' + clc.magenta(number) + ']');
};

stripNewLines = function(str) {
    return str.replace(/[\r\n\s]+/g, ' ');
};

function PullRequest(options, currentRepository, currentBranch) {
    this.options = options;
    this.currentBranch = currentBranch;
    this.currentRepository = currentRepository;
}

PullRequest.DETAILS = {
    options: {
        'all': Boolean,
        'branch': String,
        'close': Boolean,
        'comment': String,
        'detailed': Boolean,
        'fetch': Boolean,
        'fwd': String,
        'list': Boolean,
        'merge': Boolean,
        'open': Boolean,
        'pull': Number,
        'rebase': Boolean,
        'state': [ 'open', 'closed' ],
        'submit': String
    },
    shorthands: {
        'a': [ '--all' ],
        'b': [ '--branch' ],
        'c': [ '--close' ],
        'C': [ '--comment' ],
        'd': [ '--detailed' ],
        'f': [ '--fetch' ],
        'l': [ '--list' ],
        'm': [ '--merge' ],
        'o': [ '--open' ],
        'p': [ '--pull' ],
        'r': [ '--rebase' ],
        'S': [ '--state' ],
        's': [ '--submit' ]
    },
    description: 'Pull requests'
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

PullRequest.prototype.run = function() {
    var instance = this,
        config,
        fetchType,
        options;

    config = base.getGlobalConfig();
    options = instance.options;
    options.pull = options.pull || instance.getPullRequestNumberFromBranch_();

    if (options.close) {
        instance.close(
            options.pull, instance.currentBranch,
            options.branch || config.defaultbranch);
    }

    if (options.comment) {
        instance.comment(
            instance.currentRepository, options.pull, options.comment);
    }

    if (options.fetch) {
        if (options.merge) {
            fetchType = PullRequest.FETCH_TYPE_MERGE;
        }
        else if (options.rebase) {
            fetchType = PullRequest.FETCH_TYPE_REBASE;
        }
        else {
            fetchType = PullRequest.FETCH_TYPE_CHECKOUT;
        }

        instance.fetch(
            instance.currentRepository, options.pull, options.branch, fetchType);
    }

    if (options.fwd) {
        instance.forward(
            instance.currentRepository, options.pull, options.fwd,
            options.branch || config.defaultbranch);
    }

    if (options.list) {
        if (options.all) {
            instance.listFromAllRepositories(
                options.branch, options.detailed, options.state);
        }
        else {
            instance.list(
                instance.currentRepository, options.branch, options.detailed,
                options.state);
        }
    }

    if (!options.fetch && options.merge) {
        instance.merge(
            options.pull, instance.currentBranch,
            options.branch || config.defaultbranch, false);
    }

    if (options.open) {
        instance.open(instance.currentRepository, options.pull);
    }

    if (!options.fetch && options.rebase) {
        instance.merge(
            options.pull, instance.currentBranch,
            options.branch || config.defaultbranch, true);
    }

    if (options.submit) {
        instance.submit(
            options.submit, instance.currentRepository, instance.currentBranch,
            options.branch || config.defaultbranch, instance.currentBranch);
    }
};

PullRequest.prototype.addPullRequestExtras_ = function(number, opt_callback) {
    var instance = this,
        operations;

    operations = [
        function(callback) {
            instance.formatPullRequestJson_(number, callback);
        }
    ];

    async.series(operations, opt_callback);
};

PullRequest.prototype.applyReplacements_ = function(output) {
    var config,
        regexPattern;

    config = base.getGlobalConfig();

    for (regexPattern in config.replace) {
        output = output.replace(
            new RegExp(regexPattern, "g"), config.replace[regexPattern]);
    }

    return output;
};

PullRequest.prototype.close = function(number, pullBranch, branch) {
    var instance = this;

    if (!number) {
        logger.error('unable to find the pull number, try --pull [number]');
    }

    instance.getPullRequest_(
        base.getUser(),
        instance.currentRepository,
        number,
        function(err, pull) {
            instance.updatePullRequest_(
                instance.currentRepository,
                number,
                pull.title,
                pull.body,
                PullRequest.STATE_CLOSED,
                function(err) {
                    if (!err) {
                        logWithPullNumber(number, PullRequest.STATE_CLOSED);

                        git.checkout(branch, null, function(err) {
                            if (!err) {
                                git.exec('branch', [ '-D', pullBranch ], function(err) {
                                    if (!err) {
                                        logger.info('delete branch ' + pullBranch);
                                    }
                                });
                            }
                        });
                    }
                });
        });
};

PullRequest.prototype.checkPullRequestIntegrity_ = function(
    fromUser, toUser, repository, baseBranch, headBranch, opt_callback) {

    var args,
        payload;

    args = [ 1, null ];
    payload = {
        user: toUser,
        repo: repository,
        state: PullRequest.STATE_OPEN
    };

    base.github.pullRequests.getAll(payload, function(err, pulls) {
        pulls.forEach(function(pull) {
            if ((pull.base.ref === baseBranch) &&
                (pull.head.ref === headBranch) &&
                (pull.base.user.login === toUser) &&
                (pull.head.user.login === fromUser)) {

                args = [ 0, pull ]; return;
            }
        });
        opt_callback && opt_callback.apply(this, args);
    });
};

PullRequest.prototype.comment = function(repository, number, body) {
    var instance = this,
        payload;

    body = instance.applyReplacements_(body);
    payload = {
        user: base.getUser(),
        repo: repository,
        number: number,
        body: body
    };

    base.github.issues.createComment(payload, function(err) {
        if (err) {
            logger.error('unable to comment');
        }
        logWithPullNumber(number, 'comment ' + clc.cyan(body));
    });
};

PullRequest.prototype.fetch = function(
    repository, number, opt_branch, opt_fetchType, opt_callback) {

    var instance = this,
        headBranch,
        merge,
        operations1,
        operations2,
        pull,
        repoUrl;

    opt_branch = opt_branch || instance.getPullRequestBranchName_(number);

    merge = function(rebase, abort, opt_mergeCallback) {
        git.merge(opt_branch, rebase, abort, function(err, data) {
            console.log(data);
            logWithPullNumber(number, (rebase ? 'rebasing' : 'merging') + ' into ' + instance.currentBranch);
            opt_mergeCallback && opt_mergeCallback(err, data);
        });
    };

    operations1 = [
        function(callback) {
            instance.getPullRequest_(base.getUser(), repository, number, callback);
        }
    ];

    async.series(operations1, function(err, results1) {
        pull = results1[0];

        if (err) {
            logWithPullNumber(number, 'invalid pull request', 'error');
        }

        headBranch = pull.head.ref;
        repoUrl = pull.head.repo.git_url;

        git.exec('fetch', [ repoUrl, headBranch + ':' + opt_branch ], function(err) {
            operations2 = [
                function(callback) {
                    callback(err);
                },
                function(callback) {
                    if (opt_fetchType === PullRequest.FETCH_TYPE_REBASE) {
                        merge(true, true, callback);
                    }
                    else if (opt_fetchType === PullRequest.FETCH_TYPE_MERGE) {
                        merge(false, true, callback);
                    }
                    else if (opt_fetchType === PullRequest.FETCH_TYPE_CHECKOUT) {
                        git.checkout(headBranch, opt_branch, function(err) {
                            logger.info('checkout ' + opt_branch);
                            callback(err);
                        });
                    }
                    else {
                        callback();
                    }
                }
            ];

            async.series(operations2, function(err) {
                if (err) {
                    logger.warn('unable to fetch');
                }
                logWithPullNumber(number, 'fetch into branch ' + opt_branch);
                opt_callback && opt_callback(err);
            });
        });
    });
};

PullRequest.prototype.formatPullRequestJson_ = function(pull, opt_callback) {
    var created_at;

    created_at = pull.created_at;

    pull.body = stripNewLines(pull.body);
    pull.created_at = base.getDuration(created_at);
    pull.login = clc.green(pull.user.login);
    pull.number = clc.magenta(pull.number);
    pull.title = clc.cyan(pull.title);

    opt_callback && opt_callback();
};

PullRequest.prototype.forward = function(repository, number, toUser, toBranch) {
    var instance = this,
        operations,
        headBranch;

    operations = [
        function(callback) {
            instance.fetch(
                repository, number, null, PullRequest.FETCH_TYPE_SILENT,
                callback);
        },
        function(callback) {
            headBranch = instance.getPullRequestBranchName_(number);
            instance.submit(
                toUser, instance.currentRepository, headBranch, toBranch,
                headBranch, callback);
        }
    ];

    async.series(operations, function(err) {
        if (err) {
            logger.error('unable to forward');
        }
    });
};

PullRequest.prototype.getPullRequest_ = function(
    user, repository, number, opt_callback) {

    var payload;

    payload = {
        user: user,
        repo: repository,
        number: number
    };

    base.github.pullRequests.get(payload, opt_callback);
};

PullRequest.prototype.getPullRequestBranchName_ = function(number) {
    return mustache.render(
        base.getGlobalConfig().branchname, { number: number });
};

PullRequest.prototype.getPullRequestNumberFromBranch_ = function() {
    var instance = this,
        match;

    match = instance.currentBranch.match(/\d+$/);

    return match && match[0];
};

PullRequest.prototype.getPullRequestsFormattedJson_ = function(
    pulls, opt_branch, opt_callback) {

    var instance = this,
        branch,
        branches,
        formattedJson,
        operations;

    branches = {};
    operations = [];
    formattedJson = {
        branches: []
    };

    pulls.forEach(function(pull) {
        branch = pull.base.ref;

        if (!opt_branch || opt_branch === branch) {
            // grouping pulls by branch
            branches[branch] = branches[branch] || [];
            branches[branch].push(pull);

            // add extra asynchronous data to the pull request
            operations.push(function(callback) {
                instance.addPullRequestExtras_(pull, callback);
            });
        }
    });

    Object.keys(branches).forEach(function(branch) {
        formattedJson.branches.push({
            name: branch,
            pulls: branches[branch],
            total: branches[branch].length
        });
    });

    async.parallel(operations, function() {
        opt_callback(formattedJson);
    });
};

PullRequest.prototype.getTemplate = function() {
    return fs.readFileSync(path.join(__dirname, 'templates', 'pr.mustache')).toString();
};

PullRequest.prototype.list = function(
    repository, opt_branch, opt_detailed, opt_state) {

    var instance = this,
        output,
        payload;

    payload = {
        user: base.getUser(),
        repo: repository,
        state: opt_state
    };

    base.github.pullRequests.getAll(payload, function(err, pulls) {
        if (err || pulls.length === 0) {
            return;
        }

        instance.getPullRequestsFormattedJson_(
            pulls,
            opt_branch,
            function(formattedJson) {
                formattedJson.detailed = opt_detailed;
                formattedJson.repository = repository;

                output = mustache.render(instance.getTemplate(), formattedJson);
                output = instance.applyReplacements_(output);
                console.log(output);
            });
    });
};

PullRequest.prototype.listFromAllRepositories = function(
    opt_branch, opt_detailed, opt_state) {

    var instance = this;

    base.github.repos.getAll({ type: 'all' }, function(err, repositories) {
        repositories.forEach(function(repository) {
            instance.list(repository.name, opt_branch, opt_detailed, opt_state);
        });
    });
};

PullRequest.prototype.merge = function(number, pullBranch, branch, opt_rebase) {
    var instance = this,
        operations;

    if (!number) {
        logger.error('unable to find the pull number, try --pull [number]');
    }

    operations = [
        function(callback) {
            git.checkout(branch, null, function(err, data) {
                console.log(data);
                callback(err);
            });
        },
        function(callback) {
            logWithPullNumber(
                number,
                (opt_rebase ? 'rebasing' : 'merging') + ' into ' + branch);

            git.merge(pullBranch, opt_rebase, false, function(err, data) {
                console.log(data);
                callback(err);
            });
        }
    ];

    async.series(operations, function(err) {
        if (err) {
            logger.error('unable to merge pull request ' + number);
        }
        instance.close(number, pullBranch, branch);
    });
};

PullRequest.prototype.open = function(repository, number) {
    var instance = this;

    instance.getPullRequest_(base.getUser(), repository, number, function(err, pull) {
        instance.updatePullRequest_(
            repository,
            number,
            pull.title,
            pull.body,
            PullRequest.STATE_OPEN,
            function(err) {
                if (!err) {
                    logWithPullNumber(number, PullRequest.STATE_OPEN);
                }
            });
    });
};

PullRequest.prototype.submit = function(
    toUser, repository, headBranch, toBranch, title, opt_callback) {

    var instance = this,
        done,
        operations,
        pull,
        user;

    done = function(pull) {
        pull && logWithPullNumber(pull.number, 'sent ' + pull.html_url);

        if (opt_callback) {
            opt_callback(null, pull);
        }
    };

    user = base.getUser();

    operations = [
        function(callback) {
            logger.info('pushing branch');
            git.exec('push', [ 'origin', headBranch ], function() {
                callback();
            });
        },
        function(callback) {
            logger.info('sending ' + user + ':' + headBranch + ' to ' + toUser + ':' + toBranch);

            base.github.pullRequests.create({
                user: toUser,
                repo: repository,
                title: title,
                body: '',
                base: toBranch,
                head: user + ':' + headBranch
            }, function(err, pull) {
                callback(err, pull);
            });
        }
    ];

    async.series(operations, function(err, results) {
        pull = results[1];

        if (err) {
            logger.warn('some error may happend, checking integrity...');

            instance.checkPullRequestIntegrity_(base.getUser(), toUser, repository, toBranch, headBranch, function(err, pull) {
                if (err) {
                    logger.error('unable to submit');
                }
                done(pull);
                logger.success('don\'t worry, the pull was sent :)');
            });
        }
        else if (pull) {
            done(pull);
        }
    });
};

PullRequest.prototype.updatePullRequest_ = function(
    repository, number, title, opt_body, state, opt_callback) {

    var instance = this,
        payload;

    if (opt_body) {
        opt_body = instance.applyReplacements_(opt_body);
    }

    payload = {
        user: base.getUser(),
        repo: repository,
        number: number,
        state: state,
        title: title,
        body: opt_body
    };

    base.github.pullRequests.update(payload, function(err, pull) {
        opt_callback && opt_callback(err, pull);
    });
};

exports.Impl = PullRequest;