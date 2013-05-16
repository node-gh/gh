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
    path = require('path'),
    mustache = require('mustache'),
    logger,
    stripNewLines;

logger = base.logger;

stripNewLines = function(str) {
    return str.replace(/[\r\n\s]+/g, ' ');
};

function PullRequest(options, defaultRepository, defaultBranch) {
    this.options = options;
    this.defaultBranch = defaultBranch;
    this.defaultRepository = defaultRepository;
}

PullRequest.DETAILS = {
    options: {
        'all': Boolean,
        'branch': String,
        'close': Boolean,
        'detailed': Boolean,
        'comment': String,
        'fetch': Boolean,
        'fwd': String,
        'list': Boolean,
        'merge': Boolean,
        'open': Boolean,
        'pull': Number,
        'rebase': Boolean,
        'state': [ 'open', 'closed' ]
    },
    shorthands: {
        'a': [ '--all' ],
        'b': [ '--branch' ],
        'c': [ '--close' ],
        'd': [ '--detailed' ],
        'C': [ '--comment' ],
        'f': [ '--fetch' ],
        'l': [ '--list' ],
        'm': [ '--merge' ],
        'o': [ '--open' ],
        'p': [ '--pull' ],
        'r': [ '--rebase' ],
        's': [ '--state' ]
    },
    description: 'Pull requests'
};

PullRequest.FETCH_TYPE_MERGE_ = 'merge';
PullRequest.FETCH_TYPE_REBASE_ = 'rebase';

PullRequest.prototype.defaultBranch = null;
PullRequest.prototype.defaultRepository = null;
PullRequest.prototype.options = null;

PullRequest.prototype.run = function() {
    var instance = this,
        fetchType,
        options;

    options = instance.options;

    base.login();

    if (options.close) {
        instance.close(options.pull);
    }

    if (options.comment) {
        instance.comment(
            instance.defaultRepository, options.pull, options.comment);
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
            instance.fetch(options.branch, fetchType);
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
                instance.defaultRepository, options.branch, options.detailed,
                options.state);
        }
    }

    if (options.open) {
        instance.open(options.pull);
    }
};

PullRequest.prototype.addPullRequestExtras_ = function(pullNumber, opt_callback) {
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

PullRequest.prototype.close = function(pullNumber) {
    logger.info('close.', pullNumber);
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
            base.logger.oops('unable to comment');
        }
        base.logger.success('comment added on issue [' + clc.magenta(pullNumber) + ']: ' + clc.cyan(body));
    });
};

PullRequest.prototype.fetch = function(branch, opt_type) {
    logger.info('fetch.', branch, opt_type);
};

PullRequest.prototype.fetchAll = function(branch, opt_type) {
    logger.info('fetch all branches.', branch, opt_type);
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

PullRequest.prototype.getPullRequestsFormattedJson_ = function(
    pulls, opt_branch, opt_callback) {

    var instance = this,
        branch,
        branches,
        operations,
        formattedJson;

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
        repositories.forEach(function(respository) {
            instance.list(
                respository.name, opt_branch, opt_detailed, opt_state);
        });
    });
};

PullRequest.prototype.open = function(pullNumber) {
    logger.info('open.', pullNumber);
};

exports.Impl = PullRequest;