/*
 * Copyright 2013, All Rights Reserved.
 *
 * Code licensed under the BSD License:
 * https://github.com/node-gh/gh/blob/master/LICENSE.md
 *
 * @author Zeno Rocha <zno.rocha@gmail.com>
 * @author Eduardo Lundgren <edu@rdo.io>
 */

'use strict';

// -- Requires -------------------------------------------------------------------------------------

var async = require('async'),
    base = require('../base'),
    clc = require('cli-color'),
    logger = require('../logger'),
    printed = {};

// -- Constructor ----------------------------------------------------------------------------------

function Notifications(options) {
    this.options = options;

    if (!options.repo) {
        logger.error('You must specify a Git repository to run this command');
    }
}

// -- Constants ------------------------------------------------------------------------------------

Notifications.DETAILS = {
    alias: 'nt',
    description: 'Provides a set of util commands to work with Notifications.',
    commands: [
        'latest',
        'watch'
    ],
    options: {
        'latest': Boolean,
        'remote': String,
        'repo': String,
        'user': String,
        'watch': Boolean
    },
    shorthands: {
        'l': ['--latest'],
        'r': ['--repo'],
        'u': ['--user'],
        'w': ['--watch']
    },
    payload: function(payload, options) {
        options.latest = true;
    }
};

// -- Commands -------------------------------------------------------------------------------------

Notifications.prototype.run = function() {
    var instance = this,
        options = instance.options;

    if (options.latest) {
        logger.logTemplate(
            '{{prefix}} [info] Listing activities on {{greenBright options.user "/" options.repo}}', {
                options: options
            });

        instance.latest();
    }

    if (options.watch) {
        logger.logTemplate(
            '{{prefix}} [info] Watching any activity on {{greenBright options.user "/" options.repo}}', {
                options: options
            });

        instance.watch();
    }
};

Notifications.prototype.latest = function(opt_watch) {
    var instance = this,
        options = instance.options,
        operations,
        payload,
        listEvents,
        filteredListEvents = [];

    operations = [

        function(callback) {
            payload = {
                user: options.user,
                repo: options.repo
            };

            base.github.events.getFromRepo(payload, function(err, data) {
                if (!err) {
                    listEvents = data;
                }
                callback(err);
            });
        },
        function(callback) {
            listEvents.forEach(function(event) {
                event.txt = instance.getMessage_(event);

                if (options.watch) {
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
        }
    ];

    async.series(operations, function(err) {
        if (filteredListEvents.length) {
            logger.logTemplateFile('notification.handlebars', {
                events: filteredListEvents,
                latest: options.latest,
                repo: options.repo,
                user: options.user,
                watch: opt_watch
            });
        }

        logger.defaultCallback(err, null, false);
    });
};

Notifications.prototype.watch = function() {
    var instance = this,
        intervalTime = 3000;

    instance.latest();

    setInterval(function() {
        instance.latest(true);
    }, intervalTime);
};

Notifications.prototype.getMessage_ = function(event) {
    var txt = '',
        type = event.type,
        payload = event.payload;

    switch (type) {
        case 'CommitCommentEvent':
            txt = 'commented on a commit at';
            break;
        case 'CreateEvent':
            txt = 'created ' + payload.ref_type + ' ' + clc.greenBright(payload.ref) + ' at';
            break;
        case 'DeleteEvent':
            txt = 'removed ' + payload.ref_type + ' ' + clc.greenBright(payload.ref) + ' at';
            break;
        case 'ForkEvent':
            txt = 'forked';
            break;
        case 'GollumEvent':
            txt = payload.pages[0].action + ' the ' + clc.greenBright(payload.pages[0].page_name) + ' wiki page at';
            break;
        case 'IssueCommentEvent':
            txt = 'commented on issue ' + clc.greenBright('#' + payload.issue.number) + ' at';
            break;
        case 'IssuesEvent':
            txt = payload.action + ' issue ' + clc.greenBright('#' + payload.issue.number) + ' at';
            break;
        case 'MemberEvent':
            txt = 'added ' + clc.greenBright('@' + payload.member.login) + ' as a collaborator to';
            break;
        case 'PageBuildEvent':
            txt = 'builded a GitHub Page at';
            break;
        case 'PublicEvent':
            txt = 'open sourced';
            break;
        case 'PullRequestEvent':
            txt = payload.action + ' pull request ' + clc.greenBright('#' + payload.number) + ' at';
            break;
        case 'PullRequestReviewCommentEvent':
            txt = 'commented on pull request ' + clc.greenBright('#' + payload.pull_request.number) + ' at';
            break;
        case 'PushEvent':
            txt = 'pushed ' + clc.greenBright(payload.size) + ' commit(s) to';
            break;
        case 'ReleaseEvent':
            txt = 'released ' + clc.greenBright(payload.release.tag_name) + ' at';
            break;
        case 'StatusEvent':
            txt = 'changed the status of a commit at';
            break;
        case 'WatchEvent':
            txt = 'starred';
            break;
        default:
            logger.error('event type not found: ' + clc.red(type));
            break;
    }

    return txt;
};

exports.Impl = Notifications;
