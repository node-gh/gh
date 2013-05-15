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

PullRequest.TEMPLATE_BRANCH_NAME = '\n  {branch} ({total}){content}';
PullRequest.TEMPLATE_PULL_REQUEST = '\n    [{number}] {title} {login} ({duration} ago)';
PullRequest.TEMPLATE_PULL_REQUEST_DETAILED = '\n    [{number}] {title} {login} ({duration} ago)\n    {html_url}\n    {body}';
PullRequest.TEMPLATE_REPOSITORY_NAME = '\n{repository}';
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
    // repository = options.repository || 'alloy-twitter-bootstrap';

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

PullRequest.prototype.list = function(repository, opt_branch, opt_detailed, opt_state) {
    var instance = this,
        config,
        msg;

    config = base.getGlobalConfig();

    msg = {
        user: config.github.user,
        repo: repository,
        state: opt_state
    };

    base.github.pullRequests.getAll(msg, function(err, pulls) {
        var i,
            baseBranch,
            branchName,
            branchContent,
            branchContentMap,
            pull,
            output;

        if (err || pulls.length === 0) {
            return;
        }

        branchContentMap = {};

        for (i = 0; i < pulls.length; i++) {
            pull = pulls[i];
            baseBranch = pull.base.ref;

            // filter by branch
            if (opt_branch && baseBranch !== opt_branch) {
                continue;
            }

            if (!branchContentMap[baseBranch]) {
                branchContentMap[baseBranch] = [];
            }

            branchContentMap[baseBranch].push(
                base.sub(
                    opt_detailed ?
                        PullRequest.TEMPLATE_PULL_REQUEST_DETAILED :
                        PullRequest.TEMPLATE_PULL_REQUEST,
                    {
                        body: instance.normalizePullRequestBody_(pull.body),
                        duration: base.getBestMatchDateDuration(pull.created_at),
                        html_url: pull.html_url,
                        login: clc.green(pull.user.login),
                        number: clc.magenta(pull.number),
                        title: clc.cyan(pull.title)
                    }
                )
            );
        }

        output = base.sub(PullRequest.TEMPLATE_REPOSITORY_NAME, {
            repository: clc.underline.blue(repository)
        });

        for (branchName in branchContentMap) {
            branchContent = branchContentMap[branchName];
            output += base.sub(PullRequest.TEMPLATE_BRANCH_NAME, {
                branch: branchName,
                content: branchContent.join(''),
                total: branchContent.length
            });
        }
        output = instance.applyReplacements_(output);

        console.log(output);
    });
};

PullRequest.prototype.listAll = function(opt_branch, opt_detailed, opt_state) {
    var instance = this,
        i,
        len,
        msg;

    msg = { type: 'all' };

    base.github.repos.getAll(msg, function(err, res) {
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

PullRequest.prototype.forward = function(pull, userName) {
    logger.info('forward.', pull, userName);
};

PullRequest.prototype.normalizePullRequestBody_ = function(body) {
    if (body) {
        body = '> ' + body.replace(/[\r\n]+/g, ' ') + '\n';
    }

    return body;
};

PullRequest.prototype.open = function(pull) {
    logger.info('open.', pull);
};

exports.Impl = PullRequest;