/*
* Copyright 2013 Zeno Rocha, All Rights Reserved.
*
* Code licensed under the BSD License:
* https://github.com/eduardolundgren/blob/master/LICENSE.md
*
* @author Zeno Rocha <zno.rocha@gmail.com>
*/

var async = require('async'),
    base = require('../base'),
    clc = require('cli-color'),
    logger = require('../logger'),
    printed = {};

function Notifications(options, currentRepository) {
    this.options = options;
    this.currentRepository = currentRepository;
}

Notifications.DETAILS = {
    options: {
        'latest': Boolean,
        'watch': Boolean,
        'user': String,
        'repo': String
    },
    shorthands: {
        'l': [ '--latest' ],
        'w': [ '--watch' ],
        'u': [ '--user' ],
        'r': [ '--repo' ]
    },
    description: 'Notifications'
};

Notifications.prototype.run = function() {
    var instance = this,
        options = instance.options;

    options.user = options.user || base.getUser();
    options.repo = options.repo || instance.currentRepository;

    if (options.latest) {
        instance.latest();
    }

    if (options.watch) {
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
            logger.logTemplate('nt', {
                user: options.user,
                repo: options.repo,
                latest: options.latest,
                watch: opt_watch,
                events: filteredListEvents
            });
        }
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
    var instance = this,
        txt = '',
        type = event.type,
        payload = event.payload;

    switch (type) {
        case 'CommitCommentEvent':
            txt = 'commented on a commit at';
            break;
        case 'CreateEvent':
            txt = 'created a ' + payload.ref_type + ' at';
            break;
        case 'DeleteEvent':
            txt = 'removed ' + payload.ref_type + ' at';
            break;
        case 'DownloadEvent':
            txt = 'downloaded';
            break;
        case 'ForkEvent':
            txt = 'forked';
            break;
        case 'ForkApplyEvent':
            txt = 'applied patch ' + payload.head + ' at';
            break;
        case 'IssueCommentEvent':
            txt = 'commented on an issue at';
            break;
        case 'IssuesEvent':
            txt = payload.action + ' an issue at';
            break;
        case 'MemberEvent':
            txt = 'added ' + payload.member + ' as a collaborator to';
            break;
        case 'PublicEvent':
            txt = 'open sourced';
            break;
        case 'PullRequestEvent':
            txt = payload.action + ' pull request #' + payload.number + ' at';
            break;
        case 'PullRequestReviewCommentEvent':
            txt = 'commented on a pull request at';
            break;
        case 'PushEvent':
            txt = 'pushed ' + payload.commits.length + ' commit(s) to';
            break;
        case 'WatchEvent':
            txt = 'is now watching';
            break;
        default:
            logger.error('event type not found: ' + clc.red(type));
            break;
    }

    return txt;
};

exports.Impl = Notifications;