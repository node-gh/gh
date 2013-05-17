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
    base.logger[opt_type || 'info'](clc.magenta(number) + ' ' + message);
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
    options.pull = options.pull || instance.getPullRequestNumberFromBranch_();

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
                instance.currentRepository, options.pull, options.branch,
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

    if (!options.fetch && options.merge) {
        instance.merge(options.pull, options.branch || config.defaultbranch, false);
    }

    if (options.open) {
        instance.open(instance.currentRepository, options.pull);
    }

    if (!options.fetch && options.rebase) {
        instance.merge(options.pull, options.branch || config.defaultbranch, true);
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

PullRequest.prototype.checkout_ = function(branch, opt_newBranch, opt_callback) {
    var args;

    args = [ branch ];

    if (opt_newBranch) {
        args.push('-B', opt_newBranch);
    }

    git.exec('checkout', args, function(err, data) {
        if (!err) {
            base.logger.info('checkout ' + (opt_newBranch || branch));
        }
        opt_callback && opt_callback(err, data);
    });
};

PullRequest.prototype.close = function(repository, number) {
    var instance = this;

    instance.getPullRequest_(repository, number, function(err, pull) {
        instance.updatePullRequest_(
            repository,
            number,
            pull.title,
            pull.body,
            'closed',
            function(err) {
                if (!err) {
                    logWithPullNumber(number, 'closed');
                }
            });
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
            base.logger.error('unable to comment');
        }
        logWithPullNumber(number, 'comment ' + clc.cyan(body));
    });
};

PullRequest.prototype.fetch = function(
    repository, number, opt_branch, fetchType) {

    var instance = this,
        repoUrl,
        headBranch;

    opt_branch = opt_branch || instance.getPullRequestBranchName_(number);

    instance.getPullRequest_(repository, number, function(err, pull) {
        if (err) {
            logWithPullNumber(number, 'invalid pull request', 'error');
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
                logWithPullNumber(number, 'fetch into branch ' + opt_branch);

                if (fetchType === PullRequest.FETCH_TYPE_REBASE_) {
                    git.merge(opt_branch, true, function(err, data) {
                        console.log(data);
                        logWithPullNumber(
                            number, 'fetch and rebased into ' + instance.currentBranch);
                    });
                }
                else if (fetchType === PullRequest.FETCH_TYPE_MERGE_) {
                    git.merge(opt_branch, false, function(err, data) {
                        console.log(data);
                        logWithPullNumber(
                            number, 'fetch and merged into ' + instance.currentBranch);
                    });
                }
                else {
                    instance.checkout_(headBranch, opt_branch);
                }
            }
        );
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

PullRequest.prototype.forward = function(number, userName) {
    logger.info('forward.', number, userName);
};

PullRequest.prototype.getPullRequest_ = function(
    repository, number, opt_callback) {

    var payload;

    payload = {
        user: base.getUser(),
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
    return fs.readFileSync(path.join(__dirname, 'pr.mustache')).toString();
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

PullRequest.prototype.merge = function(number, branch, opt_rebase) {
    var instance = this,
        operations;

    if (!number) {
        base.logger.error('unable to find the pull number, try --pull [number]');
    }

    operations = [
        function(callback) {
            instance.checkout_(branch, null, function(err) {
                if (err) {
                    base.logger.error('unable to checkout ' + branch);
                }
                callback(err);
            });
        },
        function(callback) {
            logWithPullNumber(
                number,
                (opt_rebase ? 'rebasing' : 'merging') + ' into ' + branch);

            git.merge(instance.currentBranch, opt_rebase, function(err, data) {
                console.log(data);
                callback(err);
            });
        }
    ];

    async.series(operations, function(err) {
        if (err) {
            logger.error('unable to merge pull request ' + number);
        }
        instance.close(instance.currentRepository, number);
    });
};

PullRequest.prototype.open = function(repository, number) {
    var instance = this;

    instance.getPullRequest_(repository, number, function(err, pull) {
        instance.updatePullRequest_(
            repository,
            number,
            pull.title,
            pull.body,
            'open',
            function(err) {
                if (!err) {
                    logWithPullNumber(number, 'open');
                }
            });
    });
};

PullRequest.prototype.submit = function(
    submitUser, repository, headBranch, toBranch, title) {

    var payload,
        operations,
        user;

    user = base.getUser();
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
                callback(err);
            });
        }
    ];

    async.series(operations);
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

        if (err) {
            base.logger.error('unable to update pull request');
        }
    });
};

exports.Impl = PullRequest;