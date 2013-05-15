/*
* Copyright 2013 Eduardo Lundgren, All Rights Reserved.
*
* Code licensed under the BSD License:
* https://github.com/eduardolundgren/blob/master/LICENSE.md
*
* @author Eduardo Lundgren <eduardolundgren@gmail.com>
*/

var base = require('../base'),
    clc = require('cli-color'),
    fs = require('fs'),
    path = require('path'),
    mustache = require('mustache'),
    logger;

logger = base.logger;

function PullRequest() {
}

PullRequest.COMMAND_DETAILS = {
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

PullRequest.prototype.run = function(options) {
    var instance = this,
        branch,
        repository,
        fetchType;

    instance.login();

    branch = options.branch;
    repository = options.repository || 'liferay-portal';

    if (options.close) {
        instance.close(options.pull);
    }

    if (options.comment) {
        instance.comment(options.pull, options.comment);
    }

    if (options.fetch) {
        if (options.merge) {
            fetchType = PullRequest.FETCH_TYPE_MERGE_;
        }
        else if (options.rebase) {
            fetchType = PullRequest.FETCH_TYPE_REBASE_;
        }

        if (options.all) {
            instance.fetchAll(branch, fetchType);
        }
        else {
            instance.fetch(branch, fetchType);
        }
    }

    if (options.fwd) {
        instance.forward(options.pull, options.fwd);
    }

    if (options.list) {
        if (options.all) {
            instance.listAll(branch, options.detailed, options.state);
        }
        else {
            instance.list(repository, branch, options.detailed, options.state);
        }
    }

    if (options.open) {
        instance.open(options.pull);
    }
};

PullRequest.prototype.applyReplacements_ = function(output) {
    var config,
        regexPattern;

    config = base.getGlobalConfig();

    // apply replacement patterns from .gh.json
    for (regexPattern in config.replace) {
        output = output.replace(
            new RegExp(regexPattern, "g"),
            clc.underline(config.replace[regexPattern]));
    }

    return output;
};

PullRequest.prototype.close = function(pull) {
    logger.info('close.', pull);
};

PullRequest.prototype.comment = function(pull, comment) {
    logger.info('comment.', pull, comment);
};

PullRequest.prototype.fetch = function(branch, opt_type) {
    logger.info('fetch.', branch, opt_type);
};

PullRequest.prototype.fetchAll = function(branch, opt_type) {
    logger.info('fetch all branches.', branch, opt_type);
};

PullRequest.prototype.formatValues_ = function(pull) {
    var created_at;

    created_at = pull.created_at;

    pull.body = pull.body.replace(/[\r\n\s]+/g, ' ');
    pull.created_at = base.getBestMatchDateDuration(created_at);
    pull.login = clc.green(pull.user.login);
    pull.number = clc.magenta(pull.number);
    pull.title = clc.cyan(pull.title);
};

PullRequest.prototype.forward = function(pull, userName) {
    logger.info('forward.', pull, userName);
};

PullRequest.prototype.getTemplate = function() {
    return fs.readFileSync(path.join(__dirname, 'pr.mustache')).toString();
};

PullRequest.prototype.groupByBranch_ = function(pulls, repository, opt_branch, opt_detailed) {
    var instance = this,
        branches,
        branchName,
        i,
        pull,
        value;

    branches = {};
    value = {
        branches: [],
        detailed: opt_detailed,
        repository: repository
    };

    for (i = 0; i < pulls.length; i++) {
        pull = pulls[i];
        branchName = pull.base.ref;

        // filter by branch
        if (opt_branch && branchName !== opt_branch) {
            continue;
        }

        if (!branches[branchName]) {
            branches[branchName] = [];
        }
        instance.formatValues_(pull);
        branches[branchName].push(pull);
    }

    for (i in branches) {
        value.branches.push({
            name: i,
            pulls: branches[i],
            total: branches[i].length
        });
    }

    return value;
};

PullRequest.prototype.list = function(repository, opt_branch, opt_detailed, opt_state) {
    var instance = this,
        config,
        msg,
        output;

    config = base.getGlobalConfig();

    msg = {
        user: config.github.user,
        repo: repository,
        state: opt_state
    };

    base.github.pullRequests.getAll(msg, function(err, pulls) {
        if (err || pulls.length === 0) {
            return;
        }
        output = mustache.render(
            instance.getTemplate(),
            instance.groupByBranch_(
                pulls, repository, opt_branch, opt_detailed));
        output = instance.applyReplacements_(output);
        console.log(output);
    });
};

PullRequest.prototype.listAll = function(opt_branch, opt_detailed, opt_state) {
    var instance = this,
        i,
        len;

    base.github.repos.getAll({ type: 'all' }, function(err, res) {
        for (i = 0, len = res.length; i < len; i++) {
            instance.list(
                res[i].name, opt_branch, opt_detailed, opt_state);
        }
    });
};

PullRequest.prototype.login = function() {
    if (base.hasCredentials()) {
        base.authorize();
    }
    else {
        base.createAuthorization();
    }
};

PullRequest.prototype.open = function(pull) {
    logger.info('open.', pull);
};

exports.Impl = PullRequest;