"use strict";
/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: CONTRIBUTORS)
 * SPDX-License-Identifier: BSD-3-Clause
 */
Object.defineProperty(exports, "__esModule", { value: true });
// -- Requires -------------------------------------------------------------------------------------
const async = require("async");
const lodash_1 = require("lodash");
const openUrl = require("opn");
const base = require("../base");
const git = require("../git");
const hooks = require("../hooks");
const logger = require("../logger");
const issue_1 = require("./issue");
const config = base.getConfig();
// -- Constructor ----------------------------------------------------------------------------------
function PullRequest(options) {
    this.options = options;
    if (!options.repo && !options.all) {
        logger.error('You must specify a Git repository with a GitHub remote to run this command');
    }
    this.issue = new issue_1.default(options);
}
exports.default = PullRequest;
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
        'info',
        'list',
        'merge',
        'open',
        'rebase',
        'submit',
    ],
    options: {
        all: Boolean,
        branch: String,
        browser: Boolean,
        close: Boolean,
        comment: String,
        description: String,
        detailed: Boolean,
        direction: String,
        fetch: Boolean,
        fwd: String,
        issue: Number,
        info: Boolean,
        link: Boolean,
        list: Boolean,
        me: Boolean,
        merge: Boolean,
        number: [String, Array],
        open: Boolean,
        org: String,
        rebase: Boolean,
        remote: String,
        repo: String,
        sort: String,
        state: ['open', 'closed'],
        submit: String,
        title: String,
        user: String,
    },
    shorthands: {
        a: ['--all'],
        b: ['--branch'],
        B: ['--browser'],
        C: ['--close'],
        c: ['--comment'],
        D: ['--description'],
        d: ['--detailed'],
        f: ['--fetch'],
        i: ['--issue'],
        I: ['--info'],
        k: ['--link'],
        l: ['--list'],
        M: ['--merge'],
        m: ['--me'],
        n: ['--number'],
        o: ['--open'],
        O: ['--org'],
        R: ['--rebase'],
        r: ['--repo'],
        S: ['--state'],
        s: ['--submit'],
        t: ['--title'],
        u: ['--user'],
    },
    payload(payload, options) {
        if (payload[0]) {
            options.fetch = true;
        }
        else {
            options.list = true;
        }
    },
};
PullRequest.DIRECTION_DESC = 'desc';
PullRequest.DIRECTION_ASC = 'asc';
PullRequest.FETCH_TYPE_CHECKOUT = 'checkout';
PullRequest.FETCH_TYPE_MERGE = 'merge';
PullRequest.FETCH_TYPE_REBASE = 'rebase';
PullRequest.FETCH_TYPE_SILENT = 'silent';
PullRequest.SORT_CREATED = 'created';
PullRequest.SORT_COMPLEXITY = 'complexity';
PullRequest.STATE_CLOSED = 'closed';
PullRequest.STATE_OPEN = 'open';
// -- Commands -------------------------------------------------------------------------------------
PullRequest.prototype.options = null;
PullRequest.prototype.issues = null;
PullRequest.prototype.run = function (done) {
    const instance = this;
    const options = instance.options;
    instance.config = config;
    options.number =
        options.number ||
            instance.getPullRequestNumberFromBranch_(options.currentBranch, config.pull_branch_name_prefix);
    options.pullBranch = instance.getBranchNameFromPullNumber_(options.number);
    options.state = options.state || PullRequest.STATE_OPEN;
    if (!options.pullBranch && (options.close || options.fetch || options.merge)) {
        logger.error("You've invoked a method that requires an issue number.");
    }
    if (options.browser && process.env.NODE_ENV !== 'testing') {
        instance.browser(options.user, options.repo, options.number);
    }
    if (!options.list) {
        options.branch = options.branch || config.default_branch;
    }
    if (options.close) {
        instance._closeHandler(done);
    }
    if (options.comment) {
        instance._commentHandler(done);
    }
    if (options.fetch) {
        instance._fetchHandler();
    }
    else if (options.merge || options.rebase) {
        instance._mergeHandler();
    }
    if (options.fwd === '') {
        options.fwd = config.default_pr_forwarder;
    }
    if (options.fwd) {
        this._fwdHandler();
    }
    if (options.info) {
        this._infoHandler(done);
    }
    if (options.list) {
        this._listHandler(done);
    }
    if (options.open) {
        this._openHandler(done);
    }
    if (options.submit === '') {
        options.submit = config.default_pr_reviewer;
    }
    if (options.submit) {
        this._submitHandler(done);
    }
};
PullRequest.prototype.addComplexityParamToPulls_ = function (pulls, opt_callback) {
    const instance = this;
    let metrics;
    let operations;
    const options = instance.options;
    operations = pulls.map(pull => {
        return function (callback) {
            options.number = pull.number;
            instance.getPullRequest_((err, pull2) => {
                if (!err) {
                    metrics = {
                        additions: pull2.additions,
                        changedFiles: pull2.changed_files,
                        comments: pull2.comments,
                        deletions: pull2.deletions,
                        reviewComments: pull2.review_comments,
                    };
                    pull.complexity = instance.calculateComplexity_(metrics);
                }
                callback(err, pull);
            });
        };
    });
    async.series(operations, (err, results) => {
        opt_callback(err, results);
    });
};
PullRequest.prototype.browser = function (user, repo, number) {
    if (number) {
        openUrl(`${config.github_host}${user}/${repo}/pull/${number}`, { wait: false });
    }
    else {
        openUrl(`${config.github_host}${user}/${repo}/pulls`, { wait: false });
    }
};
PullRequest.prototype.calculateComplexity_ = function (metrics) {
    let complexity;
    const weightAddition = 2;
    const weightChangedFile = 2;
    const weightComment = 2;
    const weightDeletion = 2;
    const weightReviewComment = 1;
    complexity =
        metrics.additions * weightAddition +
            metrics.changedFiles * weightChangedFile +
            metrics.comments * weightComment +
            metrics.deletions * weightDeletion +
            metrics.reviewComments * weightReviewComment;
    return complexity;
};
PullRequest.prototype.close = function (opt_callback) {
    const instance = this;
    const options = instance.options;
    let operations;
    let pull;
    operations = [
        function (callback) {
            instance.getPullRequest_((err, data) => {
                if (!err) {
                    pull = data;
                }
                callback(err);
            });
        },
        function (callback) {
            instance.updatePullRequest_(pull.title, pull.body, PullRequest.STATE_CLOSED, callback);
        },
        function (callback) {
            if (options.pullBranch === options.currentBranch) {
                git.checkout(pull.base.ref);
            }
            if (options.pullBranch) {
                git.deleteBranch(options.pullBranch);
            }
            callback();
        },
    ];
    async.series(operations, err => {
        opt_callback && opt_callback(err, pull);
    });
};
PullRequest.prototype.checkPullRequestIntegrity_ = function (originalError, user, opt_callback) {
    const instance = this;
    const options = instance.options;
    let payload;
    let pull;
    payload = {
        user,
        repo: options.repo,
        state: PullRequest.STATE_OPEN,
    };
    base.github.pullRequests.getAll(payload, (err, pulls) => {
        if (!err) {
            pulls.forEach(data => {
                if (data.base.ref === options.branch &&
                    data.head.ref === options.currentBranch &&
                    data.base.sha === data.head.sha &&
                    data.base.user.login === user &&
                    data.head.user.login === options.user) {
                    pull = data;
                    originalError = null;
                    return;
                }
            });
        }
        opt_callback && opt_callback(originalError, pull);
    });
};
PullRequest.prototype.fetch = function (opt_type, opt_callback) {
    const instance = this;
    const options = instance.options;
    let headBranch;
    let repoUrl;
    instance.getPullRequest_((err, pull) => {
        if (err) {
            opt_callback && opt_callback(err);
            return;
        }
        headBranch = pull.head.ref;
        repoUrl = config.ssh === false ? pull.head.repo.clone_url : pull.head.repo.ssh_url;
        git.fetch(repoUrl, headBranch, options.pullBranch);
        if (opt_type !== PullRequest.FETCH_TYPE_SILENT) {
            git[opt_type](options.pullBranch);
        }
        opt_callback(err, pull);
    });
};
PullRequest.prototype.filterPullsSentByMe_ = function (pulls) {
    const instance = this;
    const options = instance.options;
    pulls = pulls.filter(pull => {
        if (options.loggedUser === pull.user.login) {
            return pull;
        }
    });
    return pulls;
};
PullRequest.prototype.forward = function (opt_callback) {
    const instance = this;
    const options = instance.options;
    let operations;
    let submittedPull;
    let pull;
    operations = [
        function (callback) {
            instance.fetch(PullRequest.FETCH_TYPE_SILENT, (err, data) => {
                pull = data;
                callback(err);
            });
        },
        function (callback) {
            options.title = pull.title;
            options.description = pull.body;
            options.submittedUser = pull.user.login;
            instance.submit(options.fwd, (err, data) => {
                if (err) {
                    callback(err);
                    return;
                }
                options.submittedPullNumber = data.number;
                submittedPull = data;
                callback();
            });
        },
    ];
    async.series(operations, err => {
        opt_callback && opt_callback(err, submittedPull);
    });
};
PullRequest.prototype.getPullRequest_ = function (opt_callback) {
    const instance = this;
    const options = instance.options;
    let payload;
    payload = {
        number: options.number,
        repo: options.repo,
        user: options.user,
    };
    base.github.pullRequests.get(payload, opt_callback);
};
PullRequest.prototype.getBranchNameFromPullNumber_ = function (number) {
    if (number) {
        return config.pull_branch_name_prefix + number;
    }
};
PullRequest.prototype.getPullRequestNumberFromBranch_ = function (currentBranch, prefix) {
    if (currentBranch && lodash_1.startsWith(currentBranch, prefix)) {
        return currentBranch.replace(prefix, '');
    }
};
PullRequest.prototype.getPullsTemplateJson_ = function (pulls, opt_callback) {
    const instance = this;
    const options = instance.options;
    let branch;
    let branches;
    let json;
    branches = {};
    json = {
        branches: [],
    };
    pulls.forEach(pull => {
        branch = pull.base.ref;
        if (!options.branch || options.branch === branch) {
            branches[branch] = branches[branch] || [];
            branches[branch].push(pull);
        }
    });
    Object.keys(branches).forEach(branch => {
        json.branches.push({
            name: branch,
            pulls: branches[branch],
            total: branches[branch].length,
        });
    });
    opt_callback && opt_callback(null, json);
};
PullRequest.prototype.printPullInfo_ = function (pull) {
    const options = this.options;
    let status = '';
    switch (pull.combinedStatus) {
        case 'success':
            status = logger.colors.green(' ✓');
            break;
        case 'failure':
            status = logger.colors.red(' ✗');
            break;
    }
    var headline = `${logger.colors.green(`#${pull.number}`)} ${pull.title} ${logger.colors.magenta(`@${pull.user.login}`)} (${logger.getDuration(pull.created_at)})${status}`;
    if (options.link) {
        headline += ` ${logger.colors.blue(pull.html_url)}`;
    }
    logger.log(headline);
    if (options.detailed && !options.link) {
        logger.log(logger.colors.blue(pull.html_url));
    }
    if (pull.mergeable_state === 'clean') {
        logger.log(`Mergeable (${pull.mergeable_state})`);
    }
    else if (pull.mergeable_state !== undefined) {
        logger.warn(`Not mergeable (${pull.mergeable_state})`);
    }
    if ((options.info || options.detailed) && pull.body) {
        logger.log(`${pull.body}\n`);
    }
};
PullRequest.prototype.get = function (user, repo, number, opt_callback) {
    const pr = this;
    let payload;
    payload = {
        repo,
        user,
        number,
    };
    base.github.pullRequests.get(payload, (err, pull) => {
        if (err) {
            logger.warn(`Can't get pull request ${user}/${repo}/${number}`);
            return;
        }
        pr.printPullInfo_(pull);
        opt_callback && opt_callback();
    });
};
PullRequest.prototype.list = function (user, repo, opt_callback) {
    const instance = this;
    let options = instance.options;
    let json;
    let operations;
    let payload;
    let pulls;
    let sort;
    sort = options.sort;
    if (options.sort === PullRequest.SORT_COMPLEXITY) {
        sort = PullRequest.SORT_CREATED;
    }
    payload = {
        repo,
        sort,
        user,
        direction: options.direction,
        state: options.state,
    };
    operations = [
        function (callback) {
            base.github.pullRequests.getAll(payload, (err, data) => {
                pulls = [];
                if (!err) {
                    if (options.me) {
                        pulls = instance.filterPullsSentByMe_(data);
                    }
                    else {
                        pulls = data;
                    }
                }
                if (err && err.code === 404) {
                    // some times a repo is found, but you can't listen its prs
                    // due to the repo being disabled (e.g., private repo with debt)
                    logger.warn(`Can't list pull requests for ${user}/${payload.repo}`);
                    callback();
                }
                else {
                    callback(err);
                }
            });
        },
        function (callback) {
            if (options.sort && options.sort === PullRequest.SORT_COMPLEXITY) {
                instance.addComplexityParamToPulls_(pulls, (err, data) => {
                    if (!err) {
                        pulls = instance.sortPullsByComplexity_(data);
                    }
                    callback(err);
                });
            }
            else {
                callback();
            }
        },
        function (callback) {
            var statusOperations = [];
            var statusPayload;
            pulls.forEach(pull => {
                statusOperations.push(callback => {
                    statusPayload = {
                        repo,
                        user,
                        sha: pull.head.sha,
                    };
                    base.github.statuses.getCombined(statusPayload, (err, data) => {
                        pull.combinedStatus = data.state;
                        callback(err);
                    });
                });
            });
            async.series(statusOperations, err => {
                callback(err);
            });
        },
        function (callback) {
            instance.getPullsTemplateJson_(pulls, (err, data) => {
                if (!err) {
                    json = data;
                }
                callback(err);
            });
        },
    ];
    async.series(operations, err => {
        if (!err && pulls.length) {
            logger.log(logger.colors.yellow(`${user}/${repo}`));
            json.branches.forEach(branch => {
                logger.log(`${branch.name} (${branch.total})`);
                branch.pulls.forEach(instance.printPullInfo_, instance);
            });
        }
        opt_callback && opt_callback(err);
    });
};
PullRequest.prototype.listFromAllRepositories = function (opt_callback) {
    const instance = this;
    const options = instance.options;
    let payload;
    let apiMethod;
    payload = {
        type: 'all',
        user: options.user,
        per_page: 100,
    };
    if (options.org) {
        apiMethod = 'getFromOrg';
        payload.org = options.org;
    }
    else {
        apiMethod = 'getAll';
    }
    base.github.repos[apiMethod](payload, (err, repositories) => {
        if (err) {
            opt_callback && opt_callback(err);
        }
        else {
            repositories.forEach(repository => {
                instance.list(repository.owner.login, repository.name, opt_callback);
            });
        }
    });
};
PullRequest.prototype.listFromAllOrgRepositories = function (opt_callback) {
    const instance = this;
    const options = instance.options;
    let payload;
    payload = {
        type: 'all',
        user: options.user,
        org: options.org,
        per_page: 100,
    };
    base.github.repos.getFromOrg(payload, (err, repositories) => {
        if (err) {
            opt_callback && opt_callback(err);
        }
        else {
            repositories.forEach(repository => {
                instance.list(repository.owner.login, repository.name, opt_callback);
            });
        }
    });
};
PullRequest.prototype.merge = function (opt_callback) {
    const instance = this;
    const options = instance.options;
    let method = 'merge';
    if (options.rebase) {
        method = 'rebase';
    }
    git.checkout(options.branch);
    git[method](options.pullBranch);
    git.push(config.default_remote, options.branch);
    git.deleteBranch(options.pullBranch);
    opt_callback && opt_callback();
};
PullRequest.prototype.open = function (opt_callback) {
    var instance = this;
    instance.getPullRequest_((err, pull) => {
        if (err) {
            opt_callback && opt_callback(err);
        }
        else {
            instance.updatePullRequest_(pull.title, pull.body, PullRequest.STATE_OPEN, opt_callback);
        }
    });
};
PullRequest.prototype.setMergeCommentRequiredOptions_ = function (opt_callback) {
    const options = this.options;
    const lastCommitSHA = git.getLastCommitSHA();
    const changes = git.countUserAdjacentCommits();
    options.currentSHA = lastCommitSHA;
    if (changes > 0) {
        options.changes = changes;
    }
    options.pullHeadSHA = `${lastCommitSHA}~${changes}`;
    opt_callback && opt_callback();
};
PullRequest.prototype.sortPullsByComplexity_ = data => {
    const instance = this;
    const options = instance.options;
    data.sort((a, b) => {
        if (a.complexity > b.complexity) {
            return -1;
        }
        if (a.complexity < b.complexity) {
            return +1;
        }
        return 0;
    });
    if (options.direction === PullRequest.DIRECTION_ASC) {
        data.reverse();
    }
    return data;
};
PullRequest.prototype.submit = function (user, opt_callback) {
    const instance = this;
    const options = instance.options;
    let operations;
    let pullBranch;
    pullBranch = options.pullBranch || options.currentBranch;
    if (process.env.NODE_ENV === 'testing') {
        pullBranch = 'test';
    }
    operations = [
        function (callback) {
            git.push(config.default_remote, pullBranch);
            callback();
        },
        function (callback) {
            if (!options.title) {
                options.title = git.getLastCommitMessage(pullBranch);
            }
            callback();
        },
        function (callback) {
            var payload = {
                user,
                base: options.branch,
                head: `${options.user}:${pullBranch}`,
                repo: options.repo,
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
        },
    ];
    async.series(operations, (err, results) => {
        if (err) {
            instance.checkPullRequestIntegrity_(err, user, opt_callback);
        }
        else {
            opt_callback && opt_callback(err, results[2]);
        }
    });
};
PullRequest.prototype.updatePullRequest_ = function (title, opt_body, state, opt_callback) {
    const instance = this;
    const options = instance.options;
    let payload;
    if (opt_body) {
        opt_body = logger.applyReplacements(opt_body, config.replace);
    }
    payload = {
        state,
        title,
        body: opt_body,
        number: options.number,
        repo: options.repo,
        user: options.user,
    };
    base.github.pullRequests.update(payload, opt_callback);
};
PullRequest.prototype._fetchHandler = function () {
    const instance = this;
    const options = this.options;
    let fetchType = PullRequest.FETCH_TYPE_CHECKOUT;
    if (options.merge) {
        fetchType = PullRequest.FETCH_TYPE_MERGE;
    }
    else if (options.rebase) {
        fetchType = PullRequest.FETCH_TYPE_REBASE;
    }
    hooks.invoke('pull-request.fetch', instance, afterHooksCallback => {
        let operation = '';
        let branch = options.pullBranch;
        if (options.merge) {
            operation = ' and merging';
            branch = options.currentBranch;
        }
        if (options.rebase) {
            operation = ' and rebasing';
            branch = options.currentBranch;
        }
        logger.log(`Fetching pull request ${logger.colors.green(`#${options.number}`)}${operation} into branch ${logger.colors.green(branch)}`);
        instance.fetch(fetchType, err => {
            if (err) {
                throw new Error(`Can't fetch pull request ${options.number}.`);
            }
            afterHooksCallback();
        });
    });
};
PullRequest.prototype._mergeHandler = function () {
    const instance = this;
    const options = this.options;
    let operation = 'Merging';
    hooks.invoke('pull-request.merge', instance, afterHooksCallback => {
        if (options.rebase) {
            operation = 'Rebasing';
        }
        logger.log(`${operation} pull request ${logger.colors.green(`#${options.number}`)} into branch ${logger.colors.green(options.branch)}`);
        instance.merge();
        instance.setMergeCommentRequiredOptions_(afterHooksCallback);
    });
};
PullRequest.prototype._fwdHandler = function () {
    const instance = this;
    const options = this.options;
    hooks.invoke('pull-request.fwd', instance, afterHooksCallback => {
        logger.log(`Forwarding pull request ${logger.colors.green(`#${options.number}`)} to ${logger.colors.magenta(`@${options.fwd}`)}`);
        instance.forward((err, pull) => {
            if (err) {
                logger.error(`Can't forward pull request ${options.number} to ${options.fwd}.`);
                return;
            }
            if (pull) {
                options.forwardedPull = pull.number;
            }
            logger.log(pull.html_url);
            instance.setMergeCommentRequiredOptions_(afterHooksCallback);
        });
    });
};
PullRequest.prototype._closeHandler = function (done) {
    const instance = this;
    const options = this.options;
    hooks.invoke('pull-request.close', instance, afterHooksCallback => {
        logger.log(`Closing pull request ${logger.colors.green(`#${options.number}`)}`);
        instance.close((err, pull) => {
            if (err) {
                logger.warn(`Can't close pull request ${options.number}.`);
                return;
            }
            logger.log(pull.html_url);
            instance.setMergeCommentRequiredOptions_(afterHooksCallback);
            done && done();
        });
    });
};
PullRequest.prototype._commentHandler = function (done) {
    var options = this.options;
    logger.log(`Adding comment on pull request ${logger.colors.green(`#${options.number}`)}`);
    this.issue.comment((err, pull) => {
        if (err) {
            logger.error(`Can't comment on pull request ${options.number}.`);
            return;
        }
        logger.log(pull.html_url);
        done && done();
    });
};
PullRequest.prototype._infoHandler = function (done) {
    const instance = this;
    const options = this.options;
    instance.get(options.user, options.repo, options.number, err => {
        if (err) {
            throw new Error(`Can't get pull requests.\n${err}`);
        }
        done && done();
    });
};
PullRequest.prototype._listHandler = function (done) {
    const instance = this;
    const options = this.options;
    let who;
    options.sort = options.sort || PullRequest.SORT_CREATED;
    options.direction = options.direction || PullRequest.DIRECTION_DESC;
    if (options.all) {
        who = options.user;
        if (options.org) {
            who = options.org;
        }
        logger.log(`Listing all ${options.state} pull requests for ${logger.colors.green(who)}`);
        instance.listFromAllRepositories(err => {
            if (err) {
                throw new Error(`Can't list all pull requests from repos.\n${err}`);
            }
            done && done();
        });
    }
    else {
        if (options.me) {
            logger.log(`Listing ${options.state} pull requests sent by ${logger.colors.green(options.loggedUser)} on ${logger.colors.green(`${options.user}/${options.repo}`)}`);
        }
        else {
            logger.log(`Listing ${options.state} pull requests on ${logger.colors.green(`${options.user}/${options.repo}`)}`);
        }
        instance.list(options.user, options.repo, err => {
            if (err) {
                throw new Error(`Can't list pull requests.\n${err}`);
            }
            done && done();
        });
    }
};
PullRequest.prototype._openHandler = function (done) {
    const instance = this;
    const options = this.options;
    hooks.invoke('pull-request.open', instance, afterHooksCallback => {
        logger.log(`Opening pull request ${logger.colors.green(`#${options.number}`)}`);
        instance.open((err, pull) => {
            if (err) {
                logger.error(`Can't open pull request ${options.number}.`);
                return;
            }
            logger.log(pull.html_url);
            afterHooksCallback();
            done && done();
        });
    });
};
PullRequest.prototype._submitHandler = function (done) {
    const instance = this;
    const options = this.options;
    hooks.invoke('pull-request.submit', instance, afterHooksCallback => {
        logger.log(`Submitting pull request to ${logger.colors.magenta(`@${options.submit}`)}`);
        instance.submit(options.submit, (err, pull) => {
            if (err) {
                var cause = 'User Not Found';
                if (err.code !== 404) {
                    err = JSON.parse(err.message).errors[0];
                    cause = err.message ? err.message : JSON.stringify(err);
                }
                logger.error(`Can't submit pull request. ${cause}`);
            }
            if (pull) {
                options.submittedPull = pull.number;
            }
            logger.log(pull.html_url);
            instance.setMergeCommentRequiredOptions_(afterHooksCallback);
            done && done();
        });
    });
};
