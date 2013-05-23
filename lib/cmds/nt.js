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
    prompt = require('cli-prompt');

var user = '',
    repo = '',
    listEvents = [];

function Notifications(options, currentRepository) {
    this.options = options;
    this.currentRepository = currentRepository;
}

Notifications.DETAILS = {
    options: {
        'latest': Boolean,
        'watch': Boolean
    },
    shorthands: {
        'l': [ '--latest' ],
        'w': [ '--watch' ]
    },
    description: 'Notifications'
};

Notifications.prototype.run = function() {
    var instance = this,
        options = instance.options;

    base.login();

    async.series([
        function(mainCallback) {
            instance.checkRepository_(mainCallback);
        },
        function(mainCallback) {
            instance.checkUsername_(mainCallback);
        },
        function(mainCallback) {
            instance.loadNotifications_(mainCallback);
        }],
        function() {
            if (options.latest) {
                instance.latest();
            } else if (options.watch) {
                instance.watch();
            }
        }
    );
};

Notifications.prototype.checkRepository_ = function(mainCallback) {
    var instance = this;

    repo = instance.currentRepository;

    prompt('What\'s the repository ' + clc.greenBright('[' + repo + ']') + '? ', function(ans) {
        if (ans.trim() !== '') {
            repo = ans;
        }
        mainCallback();
    });
};

Notifications.prototype.checkUsername_ = function(mainCallback) {
    var config = base.getGlobalConfig();

    user = config.github.user;

    prompt('What\'s the username ' + clc.greenBright('[' + user + ']') + '? ', function(ans) {
        if (ans.trim() !== '') {
            user = ans;
        }
        mainCallback();
    });
};

Notifications.prototype.loadNotifications_ = function(mainCallback) {
    var instance = this;

    base.github.events.getFromRepo({
        user: user,
        repo: repo
    },
    function(error, result) {
        if (error) {
            base.logger.error(error);
            return;
        }
        listEvents = result;
        mainCallback();
    });
};

Notifications.prototype.latest = function() {
    var instance = this,
        txt = '';

    for (var i = 0; i < listEvents.length; i++) {
        txt = instance.getMessage_(i);
        instance.displayMessage_(txt, listEvents[i], instance.currentRepository);
    }

    process.exit(0);
};

Notifications.prototype.watch = function() {
    var instance = this,
        txt = '',
        intervalTime = 10000,
        lastEventDate = '';

    setInterval(function() {

        async.series([
            function(mainCallback) {
                instance.loadNotifications_(mainCallback);
            }],
            function() {
                if (lastEventDate != listEvents[0].created_at) {
                    lastEventDate = listEvents[0].created_at;
                    txt = instance.getMessage_(0);
                    instance.displayMessage_(txt, listEvents[0], instance.currentRepository);
                }
            }
        );

    }, intervalTime);
};

Notifications.prototype.getMessage_ = function(i) {
    var txt = '';

    switch (listEvents[i].type) {
        case 'CommitCommentEvent':
            txt = 'commented on a commit at';
            break;
        case 'CreateEvent':
            txt = 'created a ' + listEvents[i].payload.ref_type + ' at';
            break;
        case 'DeleteEvent':
            txt = 'removed ' + listEvents[i].payload.ref_type + ' at';
            break;
        case 'DownloadEvent':
            txt = 'downloaded';
            break;
        case 'ForkEvent':
            txt = 'forked';
            break;
        case 'ForkApplyEvent':
            txt = 'applied patch ' + listEvents[i].payload.head + ' at';
            break;
        case 'IssueCommentEvent':
            txt = 'commented on an issue at';
            break;
        case 'IssuesEvent':
            txt = listEvents[i].payload.action + ' an issue at';
            break;
        case 'MemberEvent':
            txt = 'added ' + listEvents[i].payload.member + ' as a collaborator to';
            break;
        case 'PublicEvent':
            txt = 'open sourced';
            break;
        case 'PullRequestEvent':
            txt = listEvents[i].payload.action + ' pull request #' + listEvents[i].payload.number + ' at';
            break;
        case 'PullRequestReviewCommentEvent':
            txt = 'commented on a pull request at';
            break;
        case 'PushEvent':
            txt = 'pushed ' + listEvents[i].payload.commits.length + ' commit(s) to';
            break;
        case 'WatchEvent':
            txt = 'is now watching';
            break;
        default:
            base.logger.error('event type not found');
            break;
    }

    return txt;
};

Notifications.prototype.displayMessage_ = function(txt, event, repository) {
    var instance = this,
        time = clc.magenta(instance.getFormatTime_(event.created_at)),
        actor = clc.yellow(event.actor.login),
        repo = clc.cyanBright(repository);

    base.logger.info(time + ' - ' + actor + ' ' + txt + ' ' + repo);
};

Notifications.prototype.getFormatTime_ = function(timestamp) {
    var time = '',
        findTime = timestamp.indexOf("T");

    if (findTime !== -1) {
        time = timestamp.substring(11, 19);
    } else {
        base.logger.error('unable to parse date');
    }

    return time;
}

exports.Impl = Notifications;