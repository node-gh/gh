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
const printed = {};
// -- Constructor ----------------------------------------------------------------------------------
function Notifications(options) {
    this.options = options;
    if (!options.repo) {
        logger.error('You must specify a Git repository with a GitHub remote to run this command');
    }
}
exports.default = Notifications;
// -- Constants ------------------------------------------------------------------------------------
Notifications.DETAILS = {
    alias: 'nt',
    description: 'Provides a set of util commands to work with Notifications.',
    commands: ['latest', 'watch'],
    options: {
        latest: Boolean,
        remote: String,
        repo: String,
        user: String,
        watch: Boolean,
    },
    shorthands: {
        l: ['--latest'],
        r: ['--repo'],
        u: ['--user'],
        w: ['--watch'],
    },
    payload(payload, options) {
        options.latest = true;
    },
};
// -- Commands -------------------------------------------------------------------------------------
Notifications.prototype.run = function (done) {
    const instance = this;
    const options = instance.options;
    if (options.latest) {
        logger.log(`Listing activities on ${logger.colors.green(`${options.user}/${options.repo}`)}`);
        instance.latest(false, done);
    }
    if (options.watch) {
        logger.log(`Watching any activity on ${logger.colors.green(`${options.user}/${options.repo}`)}`);
        instance.watch();
    }
};
Notifications.prototype.latest = function (opt_watch, done) {
    const instance = this;
    const options = instance.options;
    let operations;
    let payload;
    let listEvents;
    let filteredListEvents = [];
    operations = [
        function (callback) {
            payload = {
                user: options.user,
                repo: options.repo,
            };
            base.github.events.getFromRepo(payload, (err, data) => {
                if (!err) {
                    listEvents = data;
                }
                callback(err);
            });
        },
        function (callback) {
            listEvents.forEach(event => {
                event.txt = instance.getMessage_(event);
                if (opt_watch) {
                    if (!printed[event.created_at]) {
                        filteredListEvents.push(event);
                    }
                }
                else {
                    filteredListEvents.push(event);
                }
                printed[event.created_at] = true;
            });
            callback();
        },
    ];
    async.series(operations, err => {
        if (err) {
            throw new Error(`Can't get latest notifications.\n${err}`);
        }
        if (filteredListEvents.length) {
            if (!options.watch) {
                logger.log(logger.colors.yellow(`${options.user}/${options.repo}`));
            }
            filteredListEvents.forEach(event => {
                logger.log(`${logger.colors.magenta(`@${event.actor.login}`)} ${event.txt} ${logger.colors.cyan(options.repo)} ${logger.getDuration(event.created_at)}`);
            });
        }
        done && done();
    });
};
Notifications.prototype.watch = function () {
    const instance = this;
    const intervalTime = 3000;
    instance.latest();
    setInterval(() => {
        instance.latest(true);
    }, intervalTime);
};
Notifications.prototype.getMessage_ = function (event) {
    let txt = '';
    const type = event.type;
    const payload = event.payload;
    switch (type) {
        case 'CommitCommentEvent':
            txt = 'commented on a commit at';
            break;
        case 'CreateEvent':
            txt = `created ${payload.ref_type} ${logger.colors.green(payload.ref)} at`;
            break;
        case 'DeleteEvent':
            txt = `removed ${payload.ref_type} ${logger.colors.green(payload.ref)} at`;
            break;
        case 'ForkEvent':
            txt = 'forked';
            break;
        case 'GollumEvent':
            txt = `${payload.pages[0].action} the ${logger.colors.green(payload.pages[0].page_name)} wiki page at`;
            break;
        case 'IssueCommentEvent':
            txt = `commented on issue ${logger.colors.green(`#${payload.issue.number}`)} at`;
            break;
        case 'IssuesEvent':
            txt = `${payload.action} issue ${logger.colors.green(`#${payload.issue.number}`)} at`;
            break;
        case 'MemberEvent':
            txt = `added ${logger.colors.green(`@${payload.member.login}`)} as a collaborator to`;
            break;
        case 'PageBuildEvent':
            txt = 'builded a GitHub Page at';
            break;
        case 'PublicEvent':
            txt = 'open sourced';
            break;
        case 'PullRequestEvent':
            txt = `${payload.action} pull request ${logger.colors.green(`#${payload.number}`)} at`;
            break;
        case 'PullRequestReviewCommentEvent':
            txt = `commented on pull request ${logger.colors.green(`#${payload.pull_request.number}`)} at`;
            break;
        case 'PushEvent':
            txt = `pushed ${logger.colors.green(payload.size)} commit(s) to`;
            break;
        case 'ReleaseEvent':
            txt = `released ${logger.colors.green(payload.release.tag_name)} at`;
            break;
        case 'StatusEvent':
            txt = 'changed the status of a commit at';
            break;
        case 'WatchEvent':
            txt = 'starred';
            break;
        default:
            logger.error(`event type not found: ${logger.colors.red(type)}`);
            break;
    }
    return txt;
};
