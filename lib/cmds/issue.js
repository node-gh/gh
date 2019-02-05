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
const hooks = require("../hooks");
const logger = require("../logger");
const config = base.getConfig();
// -- Constructor ----------------------------------------------------------------------------------
function Issue(options) {
    this.options = options;
    if (!options.repo && !options.all) {
        logger.error('You must specify a Git repository with a GitHub remote to run this command');
    }
}
exports.default = Issue;
// -- Constants ------------------------------------------------------------------------------------
Issue.DETAILS = {
    alias: 'is',
    description: 'Provides a set of util commands to work with Issues.',
    iterative: 'number',
    commands: ['assign', 'browser', 'close', 'comment', 'list', 'new', 'open', 'search'],
    options: {
        all: Boolean,
        assign: Boolean,
        assignee: String,
        browser: Boolean,
        close: Boolean,
        comment: String,
        detailed: Boolean,
        label: String,
        list: Boolean,
        link: Boolean,
        message: String,
        milestone: [Number, String],
        'no-milestone': Boolean,
        new: Boolean,
        number: [String, Array],
        open: Boolean,
        remote: String,
        repo: String,
        search: String,
        state: ['open', 'closed'],
        title: String,
        user: String,
    },
    shorthands: {
        a: ['--all'],
        A: ['--assignee'],
        B: ['--browser'],
        C: ['--close'],
        c: ['--comment'],
        d: ['--detailed'],
        L: ['--label'],
        k: ['--link'],
        l: ['--list'],
        m: ['--message'],
        M: ['--milestone'],
        N: ['--new'],
        n: ['--number'],
        o: ['--open'],
        r: ['--repo'],
        s: ['--search'],
        S: ['--state'],
        t: ['--title'],
        u: ['--user'],
    },
    payload(payload, options) {
        if (payload[0]) {
            if (/^\d+$/.test(payload[0])) {
                options.browser = true;
                options.number = payload[0];
                return;
            }
            options.new = true;
            options.title = options.title || payload[0];
            options.message = options.message || payload[1];
        }
        else {
            options.list = true;
        }
    },
};
Issue.STATE_CLOSED = 'closed';
Issue.STATE_OPEN = 'open';
// -- Commands -------------------------------------------------------------------------------------
Issue.prototype.run = function (done) {
    const instance = this;
    const options = instance.options;
    instance.config = config;
    options.state = options.state || Issue.STATE_OPEN;
    if (options.assign) {
        hooks.invoke('issue.assign', instance, afterHooksCallback => {
            const user = options.user || options.loggedUser;
            logger.log(`Assigning issue ${logger.colors.green(`#${options.number}`)} on ${logger.colors.green(`${user}/${options.repo}`)} to ${logger.colors.green(options.assignee)}`);
            instance.assign((err, issue) => {
                if (err) {
                    logger.error("Can't assign issue.");
                    return;
                }
                logger.log(issue.html_url);
                afterHooksCallback();
                done && done();
            });
        });
    }
    if (options.browser) {
        process.env.NODE_ENV !== 'testing' &&
            instance.browser(options.user, options.repo, options.number);
    }
    if (options.close) {
        hooks.invoke('issue.close', instance, afterHooksCallback => {
            options.state = Issue.STATE_CLOSED;
            logger.log(`Closing issue ${logger.colors.green(`#${options.number}`)} on ${logger.colors.green(`${options.user}/${options.repo}`)}`);
            instance.close((err, issue) => {
                if (err) {
                    logger.error("Can't close issue.");
                    return;
                }
                logger.log(issue.html_url);
                afterHooksCallback();
                done && done();
            });
        });
    }
    if (options.comment) {
        logger.log(`Adding comment on issue ${logger.colors.green(`#${options.number}`)}`);
        instance.comment((err, issue) => {
            if (err) {
                throw new Error(`Can't add comment.\n${err}`);
            }
            logger.log(issue.html_url);
            done && done();
        });
    }
    if (options.list) {
        if (options.all) {
            logger.log(`Listing ${logger.colors.green(options.state)} issues for ${logger.colors.green(options.user)}`);
            instance.listFromAllRepositories(err => {
                if (err) {
                    logger.error(`Can't list issues for ${options.user}.`);
                    return;
                }
            });
        }
        else {
            logger.log(`Listing ${logger.colors.green(options.state)} issues on ${logger.colors.green(`${options.user}/${options.repo}`)}`);
            instance.list(options.user, options.repo, err => {
                if (err) {
                    logger.error(`Can't list issues on ${options.user}/${options.repo}`);
                    return;
                }
                done && done();
            });
        }
    }
    if (options.new) {
        hooks.invoke('issue.new', instance, afterHooksCallback => {
            logger.log(`Creating a new issue on ${logger.colors.green(`${options.user}/${options.repo}`)}`);
            instance.new((err, issue) => {
                if (err) {
                    throw new Error(`Can't create new issue.\n${err}`);
                }
                if (issue) {
                    options.number = issue.number;
                }
                logger.log(issue.html_url);
                afterHooksCallback();
                done && done();
            });
        });
    }
    if (options.open) {
        hooks.invoke('issue.open', instance, afterHooksCallback => {
            logger.log(`Opening issue ${logger.colors.green(`#${options.number}`)} on ${logger.colors.green(`${options.user}/${options.repo}`)}`);
            instance.open((err, issue) => {
                if (err) {
                    logger.error("Can't open issue.");
                    return;
                }
                logger.log(issue.html_url);
                afterHooksCallback();
                done && done();
            });
        });
    }
    if (options.search) {
        let { repo, user } = options;
        const query = logger.colors.green(options.search);
        if (options.all) {
            repo = undefined;
            logger.log(`Searching for ${query} in issues for ${logger.colors.green(user)}\n`);
        }
        else {
            logger.log(`Searching for ${query} in issues for ${logger.colors.green(`${user}/${repo}`)}\n`);
        }
        instance.search(user, repo, err => {
            if (err) {
                if (options.all) {
                    logger.error(`Can't search issues for ${user}`);
                }
                else {
                    logger.error(`Can't search issues on ${user}/${repo}`);
                }
                return;
            }
            done && done();
        });
    }
};
Issue.prototype.assign = function (opt_callback) {
    var instance = this;
    instance.getIssue_((err, issue) => {
        if (err) {
            opt_callback && opt_callback(err);
        }
        else {
            instance.editIssue_(issue.title, Issue.STATE_OPEN, opt_callback);
        }
    });
};
Issue.prototype.browser = function (user, repo, number) {
    if (!number) {
        number = '';
    }
    openUrl(`${config.github_host}${user}/${repo}/issues/${number}`, { wait: false });
};
Issue.prototype.close = function (opt_callback) {
    var instance = this;
    instance.getIssue_((err, issue) => {
        if (err) {
            opt_callback && opt_callback(err);
        }
        else {
            instance.editIssue_(issue.title, Issue.STATE_CLOSED, opt_callback);
        }
    });
};
Issue.prototype.comment = function (opt_callback) {
    const instance = this;
    let options = instance.options;
    let body;
    let payload;
    body = logger.applyReplacements(options.comment, config.replace) + config.signature;
    payload = {
        body,
        number: options.number,
        repo: options.repo,
        user: options.user,
    };
    base.github.issues.createComment(payload, opt_callback);
};
Issue.prototype.editIssue_ = function (title, state, opt_callback) {
    const instance = this;
    const options = instance.options;
    let payload;
    options.label = options.label || [];
    payload = {
        state,
        title,
        labels: options.label,
        number: options.number,
        assignee: options.assignee,
        milestone: options.milestone,
        repo: options.repo,
        user: options.user,
    };
    base.github.issues.edit(payload, opt_callback);
};
Issue.prototype.getIssue_ = function (opt_callback) {
    const instance = this;
    const options = instance.options;
    let payload;
    payload = {
        number: options.number,
        repo: options.repo,
        user: options.user,
    };
    base.github.issues.getRepoIssue(payload, opt_callback);
};
Issue.prototype.list = function (user, repo, opt_callback) {
    const instance = this;
    const options = instance.options;
    const operations = [];
    let payload;
    options.label = options.label || '';
    payload = {
        repo,
        user,
        labels: options.label,
        state: options.state,
    };
    if (options['no-milestone']) {
        payload.milestone = 'none';
    }
    else if (options.milestone) {
        payload.milestone = options.milestone;
    }
    if (options.milestone) {
        operations.push(callback => {
            base.github.issues.getAllMilestones({
                repo,
                user,
            }, (err, results) => {
                if (err) {
                    logger.warn(err.message);
                }
                results.some(milestone => {
                    if (options.milestone === milestone.title) {
                        logger.debug(`Milestone ${milestone.title} number: ${milestone.number}`);
                        payload.milestone = milestone.number;
                        return true;
                    }
                });
                callback();
            });
        });
    }
    if (options.assignee) {
        payload.assignee = options.assignee;
    }
    operations.push(callback => {
        base.github.issues.repoIssues(payload, callback);
    });
    async.series(operations, (err, results) => {
        if (err && !options.all) {
            logger.error(logger.getErrorMessage(err));
        }
        const issues = results[0].map(result => {
            if (result) {
                return result;
            }
        });
        if (issues && issues.length > 0) {
            const formattedIssues = formatIssues(issues, options.detailed);
            logger.log(formattedIssues);
        }
        else {
            logger.log('No issues.');
        }
        opt_callback && opt_callback(err);
    });
};
Issue.prototype.listFromAllRepositories = function (opt_callback) {
    const instance = this;
    const options = instance.options;
    let payload;
    payload = {
        type: 'all',
        user: options.user,
    };
    base.github.repos.getAll(payload, (err, repositories) => {
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
Issue.prototype.new = function (opt_callback) {
    const instance = this;
    const options = instance.options;
    let body;
    let payload;
    if (options.message) {
        body = logger.applyReplacements(options.message, config.replace);
    }
    if (options.label) {
        options.label = options.label.split(',');
    }
    else {
        options.label = [];
    }
    payload = {
        body,
        assignee: options.assignee,
        repo: options.repo,
        title: options.title,
        user: options.user,
        labels: options.label,
    };
    base.github.issues.create(payload, opt_callback);
};
Issue.prototype.open = function (opt_callback) {
    var instance = this;
    instance.getIssue_((err, issue) => {
        if (err) {
            opt_callback && opt_callback(err);
        }
        else {
            instance.editIssue_(issue.title, Issue.STATE_OPEN, opt_callback);
        }
    });
};
Issue.prototype.search = function (user, repo, opt_callback, options) {
    const instance = this;
    const operations = [];
    let query = ['type:issue'];
    let payload;
    options = instance.options || options;
    options.label = options.label || '';
    if (!options.all && repo) {
        query.push(`repo:${repo}`);
    }
    if (user) {
        query.push(`user:${user}`);
    }
    query.push(options.search);
    payload = {
        q: query.join(' '),
        type: 'Issues',
    };
    operations.push(callback => {
        base.github.search.issues(payload, callback);
    });
    async.series(operations, (err, results) => {
        if (err && !options.all) {
            logger.error(logger.getErrorMessage(err));
        }
        const issues = results[0].items.map(result => {
            if (result) {
                return result;
            }
        });
        if (issues && issues.length > 0) {
            var formattedIssues = formatIssues(issues, options.detailed);
            logger.log(formattedIssues);
        }
        else {
            logger.log('Could not find any issues matching your query.');
        }
        opt_callback && opt_callback(err, formattedIssues);
    });
};
function formatIssues(issues, showDetailed) {
    issues.sort((a, b) => {
        return a.number > b.number ? -1 : 1;
    });
    if (issues && issues.length > 0) {
        const formattedIssuesArr = issues.map(issue => {
            const issueNumber = logger.colors.green(`#${issue.number}`);
            const issueUser = logger.colors.magenta(`@${issue.user.login}`);
            const issueDate = `(${logger.getDuration(issue.created_at)})`;
            let formattedIssue = `${issueNumber} ${issue.title} ${issueUser} ${issueDate}`;
            if (showDetailed) {
                if (issue.body) {
                    formattedIssue = `
                        ${formattedIssue}
                        ${issue.body}
                    `;
                }
                if (lodash_1.isArray(issue.labels) && issue.labels.length > 0) {
                    const labels = issue.labels.map(label => label.name);
                    const labelHeading = labels.length > 1 ? 'labels: ' : 'label: ';
                    formattedIssue = `
                        ${formattedIssue}
                        ${logger.colors.yellow(labelHeading) + labels.join(', ')}
                    `;
                }
                if (issue.milestone) {
                    const { number, title } = issue.milestone;
                    formattedIssue = `
                        ${formattedIssue}
                        ${`${logger.colors.green('milestone: ')} ${title} - ${number}`}
                    `;
                }
                formattedIssue = `
                    ${formattedIssue}
                    ${logger.colors.blue(issue.html_url)}
                `;
            }
            return trim(formattedIssue);
        });
        return formattedIssuesArr.join('\n\n');
    }
    return null;
}
function trim(str) {
    return str
        .replace(/^[ ]+/gm, '')
        .replace(/[\r\n]+/g, '\n')
        .trim();
}
