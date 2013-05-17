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
    base.logger[opt_type || 'success'](clc.magenta(number) + ' ' + message);
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

PullRequest.FETCH_TYPE_MERGE_ = 'merge';
PullRequest.FETCH_TYPE_REBASE_ = 'rebase';

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

    if (options.close) {
        instance.close(instance.currentRepository, options.pull);
    }

    if (options.comment) {
        instance.comment(
            instance.currentRepository, options.pull, options.comment);
    }

    if (options.fetch) {
        if (options.merge) {
            fetchType = PullRequest.FETCH_TYPE_MERGE_;
        }
        else if (options.rebase) {
            fetchType = PullRequest.FETCH_TYPE_REBASE_;
        }

        if (options.all) {
            instance.fetchAll(options.branch, fetchType);
        }
        else {
            instance.fetch(
                instance.currentRepository, options.branch, options.pull,
                fetchType);
        }
    }

    if (options.fwd) {
        instance.forward(options.pull, options.fwd);
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

    if (options.open) {
        instance.open(instance.currentRepository, options.pull);
    }

    if (options.submit) {
        instance.submit(
            options.submit, instance.currentRepository, instance.currentBranch,
            options.branch || config.defaultbranch, instance.currentBranch);
    }
};

PullRequest.prototype.addPullRequestExtras_ = function(
    pullNumber, opt_callback) {

    var instance = this,
        operations;

    operations = [
        function(callback) {
            instance.formatPullRequestJson_(pullNumber, callback);
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

PullRequest.prototype.checkoutPullRequestBranch_ = function(
    headBranch, branch, pullNumber) {

    git.exec('checkout', [ headBranch, '-b', branch ], function(err) {
        if (!err) {
            logWithPullNumber(pullNumber, 'checkout branch ' + branch);
        }
    });
};

PullRequest.prototype.close = function(repository, pullNumber) {
    var instance = this;

    instance.getPullRequest_(repository, pullNumber, function(err, pull) {
        instance.updatePullRequest_(
            repository, pullNumber, pull.title, pull.body, 'closed',
            function(err) {
                if (!err) {
                    logWithPullNumber(pullNumber, 'closed');
                }
            });
    });
};

PullRequest.prototype.comment = function(repository, pullNumber, body) {
    var instance = this,
        config,
        payload;

    config = base.getGlobalConfig();
    body = instance.applyReplacements_(body);
    payload = {
        user: config.github.user,
        repo: repository,
        number: pullNumber,
        body: body
    };

    base.github.issues.createComment(payload, function(err) {
        if (err) {
            base.logger.error('unable to comment');
        }
        logWithPullNumber(pullNumber, 'comment ' + clc.cyan(body));
    });
};

PullRequest.prototype.fetch = function(
    repository, opt_branch, pullNumber, fetchType) {

    var instance = this,
        repoUrl,
        headBranch;

    opt_branch = opt_branch || instance.getPullRequestBranchName_(pullNumber);

    instance.getPullRequest_(repository, pullNumber, function(err, pull) {
        if (err) {
            logWithPullNumber(pullNumber, 'invalid pull request', 'error');
        }
        headBranch = pull.head.ref;
        repoUrl = pull.head.repo.git_url;

        git.exec(
            'fetch',
            [ repoUrl, headBranch + ':' + headBranch ],
            function(err) {
                if (err) {
                    base.logger.error('unable to fetch');
                }
                logWithPullNumber(
                    pullNumber, 'fetch into branch ' + opt_branch);

                if (fetchType === PullRequest.FETCH_TYPE_REBASE_) {
                    instance.fetchWithRebase_(opt_branch, pullNumber);
                }
                else if (fetchType === PullRequest.FETCH_TYPE_MERGE_) {
                    instance.fetchWithMerge_(opt_branch, pullNumber);
                }
                else {
                    instance.checkoutPullRequestBranch_(
                        headBranch, opt_branch, pullNumber);
                }
            }
        );
    });
};

PullRequest.prototype.fetchAll = function(branch, opt_type) {
    logger.info('fetch all branches.', branch, opt_type);
};

PullRequest.prototype.fetchWithMerge_ = function(opt_branch, pullNumber) {
    var instance = this;

    git.exec('merge', [ opt_branch ], function(err) {
        if (err) {
            git.exec('merge', [ '--abort' ], function(err) {
                if (err) {
                    base.logger.error('unable to merge');
                }
            });
            return;
        }

        logWithPullNumber(
            pullNumber,
            'fetch and merged into ' + instance.currentBranch);
    });
};

PullRequest.prototype.fetchWithRebase_ = function(opt_branch, pullNumber) {
    var instance = this;

    git.exec('rebase', [ opt_branch ], function(err) {
        if (err) {
            git.exec('rebase', [ '--abort' ], function(err) {
                if (err) {
                    base.logger.error('unable to rebase');
                }
            });
            return;
        }

        logWithPullNumber(
            pullNumber, 'fetch and rebased into ' + instance.currentBranch);
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

PullRequest.prototype.forward = function(pullNumber, userName) {
    logger.info('forward.', pullNumber, userName);
};


PullRequest.prototype.getPullRequest_ = function(
    repository, pullNumber, opt_callback) {

    var config,
        payload;

    config = base.getGlobalConfig();

    payload = {
        user: config.github.user,
        repo: repository,
        number: pullNumber
    };

    base.github.pullRequests.get(payload, opt_callback);
};

PullRequest.prototype.getPullRequestBranchName_ = function(pullNumber) {
    var config;

    config = base.getGlobalConfig();

    return mustache.render(config.branchname, {
        number: pullNumber
    });
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
    return fs.readFileSync(path.join(__dirname, 'pr.mustache')).toString();
};

PullRequest.prototype.list = function(
    repository, opt_branch, opt_detailed, opt_state) {

    var instance = this,
        config,
        output,
        payload;

    config = base.getGlobalConfig();

    payload = {
        user: config.github.user,
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

                output = mustache.render(
                    instance.getTemplate(), formattedJson);

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
            instance.list(
                repository.name, opt_branch, opt_detailed, opt_state);
        });
    });
};

PullRequest.prototype.open = function(repository, pullNumber) {
    var instance = this;

    instance.getPullRequest_(repository, pullNumber, function(err, pull) {
        instance.updatePullRequest_(
            repository, pullNumber, pull.title, pull.body, 'open',
            function(err) {
                if (!err) {
                    logWithPullNumber(pullNumber, 'open');
                }
            });
    });
};

PullRequest.prototype.submit = function(
    submitUser, repository, headBranch, toBranch, title) {

    var config,
        payload,
        operations,
        user;

    config = base.getGlobalConfig();
    user = config.github.user;
    payload = {
        user: submitUser,
        repo: repository,
        title: title,
        body: '',
        base: toBranch,
        head: user + ':' + headBranch
    };

    operations = [
        function(callback) {
            base.logger.info('pushing branch');
            git.exec('push', [ 'origin', headBranch ], callback);
        },
        function(callback) {
            base.logger.info(
                'sending ' + user + ':' + headBranch + ' to ' + submitUser + ':' + toBranch);

            base.github.pullRequests.create(payload, function(err, pull) {
                if (err) {
                    base.logger.error('cannot send pull request');
                }
                logWithPullNumber(pull.number, 'sent ' + pull.html_url);
                callback();
            });
        }
    ];

    async.series(operations);
};

PullRequest.prototype.updatePullRequest_ = function(
    repository, pullNumber, title, opt_body, state, opt_callback) {

    var instance = this,
        config,
        payload;

    config = base.getGlobalConfig();

    if (opt_body) {
        opt_body = instance.applyReplacements_(opt_body);
    }

    payload = {
        user: config.github.user,
        repo: repository,
        number: pullNumber,
        state: state,
        title: title,
        body: opt_body
    };

    base.github.pullRequests.update(payload, function(err, pull) {
        opt_callback && opt_callback(err, pull);

        if (err) {
            base.logger.error('unable to update pull request');
        }
    });
};

exports.Impl = PullRequest;