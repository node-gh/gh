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
    clc = require('cli-color');

function Notifications(options, currentRepository, listEvents) {
    this.options = options;
    this.currentRepository = currentRepository;
    this.listEvents = listEvents;
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
        options = instance.options,
        config = base.getGlobalConfig();

    options.user = options.user || config.github.user;
    options.repo = options.repo || instance.currentRepository;

    if (options.latest) {
        instance.latest();
    } else if (options.watch) {
        instance.watch();
    }
};

Notifications.prototype.latest = function() {
    var instance = this,
        txt = '';

    async.series([
        function(mainCallback) {
            instance.loadNotifications_(mainCallback);
        }],
        function() {
            for (var i = 0; i < instance.listEvents.length; i++) {
                txt = instance.getMessage_(i);
                instance.displayMessage_(txt, instance.listEvents[i]);
            }
            process.exit(0);
        }
    );
};

Notifications.prototype.watch = function() {
    var instance = this,
        txt = '',
        lastEventDate = '',
        intervalTime = 10000;

    setInterval(function() {
        async.series([
            function(mainCallback) {
                instance.loadNotifications_(mainCallback);
            }],
            function() {
                if (lastEventDate != instance.listEvents[0].created_at) {
                    lastEventDate = instance.listEvents[0].created_at;
                    txt = instance.getMessage_(0);
                    instance.displayMessage_(txt, instance.listEvents[0]);
                }
            }
        );
    }, intervalTime);
};

Notifications.prototype.loadNotifications_ = function(mainCallback) {
    var instance = this;

    base.github.events.getFromRepo({
        user: instance.options.user,
        repo: instance.options.repo
    },
    function(error, result) {
        if (error) {
            base.logger.error(error);
            process.exit(0);
        }

        instance.listEvents = result;
        mainCallback();
    });
};

Notifications.prototype.getMessage_ = function(i) {
    var instance = this,
        txt = '',
        type = instance.listEvents[i].type,
        payload = instance.listEvents[i].payload;

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
            base.logger.error('event type not found: ' + clc.red(type));
            break;
    }

    return txt;
};

Notifications.prototype.displayMessage_ = function(txt, event) {
    var instance = this,
        time = clc.magenta(instance.getFormatTime_(event.created_at)),
        actor = clc.yellow(event.actor.login),
        repo = clc.cyanBright(instance.options.repo);

    base.logger.info(time + ' - ' + actor + ' ' + txt + ' ' + repo);
};

Notifications.prototype.getFormatTime_ = function(timestamp) {
    var time = '',
        findTime = timestamp.indexOf("T");

    if (findTime !== -1) {
        time = timestamp.substring(11, 19);
    } else {
        base.logger.error('unable to parse date: ' + clc.red(timestamp));
    }

    return time;
};

exports.Impl = Notifications;