"use strict";
/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: CONTRIBUTORS)
 * SPDX-License-Identifier: BSD-3-Clause
 */
Object.defineProperty(exports, "__esModule", { value: true });
// -- Requires -------------------------------------------------------------------------------------
const async = require("async");
const base = require("../base");
const logger = require("../logger");
// -- Constructor ----------------------------------------------------------------------------------
function Milestone(options) {
    this.options = options;
    if (options.organization) {
        options.all = true;
    }
    if (!options.repo && !options.all) {
        logger.error('You must specify a Git repository with a GitHub remote to run this command');
    }
}
exports.default = Milestone;
// -- Constants ------------------------------------------------------------------------------------
Milestone.DETAILS = {
    alias: 'ms',
    description: 'Provides a set of util commands to work with Milestones.',
    iterative: 'number',
    commands: ['list'],
    options: {
        all: Boolean,
        organization: String,
        list: Boolean,
    },
    shorthands: {
        a: ['--all'],
        o: ['--organization'],
        l: ['--list'],
    },
    payload(payload, options) {
        options.list = true;
    },
};
// -- Commands -------------------------------------------------------------------------------------
Milestone.prototype.run = function (done) {
    const instance = this;
    const options = instance.options;
    if (options.list) {
        if (options.all) {
            logger.log(`Listing milestones for ${logger.colors.green(options.organization || options.user)}`);
            instance.listFromAllRepositories(err => {
                if (err) {
                    throw new Error(`Can't list milestones for ${options.user}.\n${err}`);
                }
            });
        }
        else {
            const userRepo = `${options.user}/${options.repo}`;
            logger.log(`Listing milestones on ${logger.colors.green(userRepo)}`);
            instance.list(options.user, options.repo, err => {
                if (err) {
                    throw new Error(`Can't list milestones on ${userRepo}\n${err}`);
                }
                done && done();
            });
        }
    }
};
Milestone.prototype.list = function (user, repo, opt_callback) {
    const instance = this;
    const options = instance.options;
    let payload;
    payload = {
        repo,
        user,
    };
    base.github.issues.getAllMilestones(payload, (err, milestones) => {
        if (err && !options.all) {
            throw new Error(logger.getErrorMessage(err));
        }
        milestones.sort((a, b) => {
            return a.due_on > b.due_on ? -1 : 1;
        });
        if (milestones && milestones.length > 0) {
            milestones.forEach(milestone => {
                const due = milestone.due_on ? logger.getDuration(milestone.due_on) : 'n/a';
                const description = milestone.description || '';
                const title = logger.colors.green(milestone.title);
                const state = logger.colors.magenta(`@${milestone.state} (due ${due})`);
                const prefix = options.all ? logger.colors.blue(`${user}/${repo} `) : '';
                logger.log(`${prefix} ${title} ${description} ${state}`);
            });
        }
        opt_callback && opt_callback(err);
    });
};
Milestone.prototype.listFromAllRepositories = function (opt_callback) {
    const instance = this;
    const options = instance.options;
    const operations = [];
    let op = 'getAll';
    let payload;
    payload = {
        type: 'all',
        user: options.user,
    };
    if (options.organization) {
        op = 'getFromOrg';
        payload.org = options.organization;
    }
    base.github.repos[op](payload, (err, repositories) => {
        if (err) {
            opt_callback && opt_callback(err);
        }
        else {
            repositories.forEach(repository => {
                operations.push(callback => {
                    instance.list(repository.owner.login, repository.name, callback);
                });
            });
        }
        async.series(operations, opt_callback);
    });
};
