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
    logger[opt_type || 'info'](clc.magenta('#' + number) + ' ' + message);
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
        options = instance.options,
        config = base.getGlobalConfig(),
        fetchType;

    options.user = options.user || base.getUser();
    options.repo = options.repo || instance.currentRepository;
    options.pull = options.pull || instance.getPullRequestNumberFromBranch_();

    if (options.close) {
        instance.close(
            options.pull, instance.currentBranch,
            options.branch || config.defaultbranch);
    }

    if (options.message) {
        instance.message();
    }

    if (options.fetch) {
        fetchType = PullRequest.FETCH_TYPE_CHECKOUT;

        if (options.merge) {
            fetchType = PullRequest.FETCH_TYPE_MERGE;
        }
        else if (options.rebase) {
            fetchType = PullRequest.FETCH_TYPE_REBASE;
        }

        instance.fetch(fetchType);
    }

    if (options.fwd) {
        instance.forward();
    }

    if (options.list) {
        if (options.all) {
            instance.listFromAllRepositories();
        }
        else {
            instance.list(options.repo);
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

PullRequest.prototype.close = function(number, pullBranch, branch, opt_callback) {
    var instance = this,
        operations,
        pull;

    if (!number) {
        logger.error('unable to find the pull number, try --pull [number]');
    }

    operations = [
        function(callback) {
            instance.getPullRequest(
                base.getUser(), instance.currentRepository, number, callback);
        }
    ];

    async.series(operations, function(err, results) {
        pull = results[0];

        instance.updatePullRequest(
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
                                opt_callback && opt_callback(err);
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

PullRequest.prototype.fetch = function(opt_type, opt_callback) {
    var instance = this,
        options = instance.options,
        branch,
        headBranch,
        operations,
        pull,
        repoUrl;

    branch = options.branch || instance.getPullRequestBranchName_(options.pull);

    operations = [
        function(callback) {
            instance.getPullRequest(options.user, options.repo, options.pull, function(err, data) {
                if (!err) {
                    pull = data;
                    headBranch = pull.head.ref;
                    repoUrl = pull.head.repo.git_url;
                }
                callback(err);
            });
        },
        function(callback) {
            git.exec('fetch', [ repoUrl, headBranch + ':' + branch ], callback);
        },
        function(callback) {
            if (opt_type === PullRequest.FETCH_TYPE_REBASE) {
                git.merge(branch, true, true, callback);
            }
            else if (opt_type === PullRequest.FETCH_TYPE_MERGE) {
                git.merge(branch, false, true, callback);
            }
            else if (opt_type === PullRequest.FETCH_TYPE_CHECKOUT) {
                git.checkout(branch, null, callback);
            }
            else {
                callback();
            }
        }
    ];

    async.series(operations, function(err) {
        opt_callback && opt_callback(err);

        if (err) {
            logger.error('unable to fetch');
        }

        logWithPullNumber(options.pull, 'fetch into branch ' + branch);
    });
};

PullRequest.prototype.formatPullRequestJson_ = function(pull, opt_callback) {
    var created_at;

    created_at = pull.created_at;

    pull.body = stripNewLines(pull.body);
    pull.created_at = base.getDuration(created_at);
    pull.login = clc.green(pull.user.login);
    pull.number = clc.magenta('#' + pull.number);
    pull.title = clc.cyan(pull.title);

    opt_callback && opt_callback();
};

PullRequest.prototype.forward = function() {
    var instance = this,
        options = instance.options,
        config = base.getGlobalConfig(),
        headBranch,
        operations;

    operations = [
        function(callback) {
            instance.fetch(PullRequest.FETCH_TYPE_SILENT, callback);
        },
        function(callback) {
            headBranch = instance.getPullRequestBranchName_(options.pull);
            instance.submit(
                options.fwd, instance.currentRepository, headBranch,
                options.branch || config.defaultbranch, headBranch, callback);
        },
        function(callback) {
            instance.close(
                options.pull, headBranch, instance.currentBranch, callback);
        }
    ];

    async.series(operations, function(err) {
        if (err) {
            logger.error('unable to forward');
        }
    });
};

PullRequest.prototype.getPullRequest = function(
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

PullRequest.prototype.getPullsTemplateJson_ = function(pulls, opt_callback) {
    var instance = this,
        options = instance.options,
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

        if (!options.branch || options.branch === branch) {
            branches[branch] = branches[branch] || [];
            branches[branch].push(pull);
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

    async.parallel(operations, function(err) {
        opt_callback(err, formattedJson);
    });
};

PullRequest.prototype.getTemplate = function() {
    return fs.readFileSync(path.join(__dirname, 'templates', 'pr.mustache')).toString();
};

PullRequest.prototype.list = function(repo) {
    var instance = this,
        options = instance.options,
        json,
        operations,
        output,
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
        json.repo = repo;
        json.detailed = options.detailed;
        output = mustache.render(instance.getTemplate(), json);
        output = instance.applyReplacements_(output);
        console.log(output);
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

PullRequest.prototype.message = function() {
    var instance = this,
        options = instance.options,
        payload;

    message = instance.applyReplacements_(options.message);

    payload = {
        user: base.getUser(),
        repo: options.repo,
        number: options.pull,
        body: message
    };

    base.github.issues.createComment(payload, function(err) {
        if (err) {
            logger.error('unable to message', err);
        }

        logWithPullNumber(options.pull, clc.cyan(message));
    });
};

PullRequest.prototype.open = function(repository, number) {
    var instance = this;

    instance.getPullRequest(base.getUser(), repository, number, function(err, pull) {
        instance.updatePullRequest(
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
            git.exec('push', [ 'origin', headBranch ], callback);
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
            }, callback);
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

PullRequest.prototype.updatePullRequest = function(
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