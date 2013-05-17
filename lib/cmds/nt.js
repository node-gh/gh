/*
* Copyright 2013 Zeno Rocha, All Rights Reserved.
*
* Code licensed under the BSD License:
* https://github.com/eduardolundgren/blob/master/LICENSE.md
*
* @author Zeno Rocha <zno.rocha@gmail.com>
*/

var base = require('../base'),
    clc = require('cli-color');

function Notifications(options, currentRepository) {
    this.options = options;
    this.currentRepository = currentRepository;
}

Notifications.DETAILS = {
    options: {
        'latest': Boolean
    },
    shorthands: {
        'l': [ '--latest' ]
    },
    description: 'Notifications'
};

Notifications.prototype.run = function() {
    var instance = this,
        options = instance.options;

    base.login();

    if (options.latest) {
        instance.latest(instance.currentRepository);
    }
};

Notifications.prototype.latest = function(repository) {
    var instance = this,
        txt = '';

    config = base.getGlobalConfig();

    base.github.events.getFromRepo({
        user: config.github.user,
        repo: repository
    },
    function(error, result) {
        for (var i = 0; i < result.length; i++) {
            if (result[i].type === 'CommitCommentEvent') {
                txt = instance.messageCommitCommentEvent_();
            } else if (result[i].type === 'ForkEvent') {
                txt = instance.messageForkEvent_();
            } else if (result[i].type === 'WatchEvent') {
                txt = instance.messageWatchEvent_();
            } else if (result[i].type === 'PushEvent') {
                txt = instance.messagePushEvent_(result[i].payload.commits.length);
            }
            instance.message_(txt, result[i], repository);
        }

    });
};

Notifications.prototype.messageCommitCommentEvent_ = function() {
    return ' commented on a commit at ';
};

Notifications.prototype.messageForkEvent_ = function() {
    return ' forked ';
};

Notifications.prototype.messageWatchEvent_ = function() {
    return ' is now watching ';
};

Notifications.prototype.messagePushEvent_ = function(numberCommits) {
    return ' pushed ' + numberCommits + ' commit(s) to ';
};

Notifications.prototype.message_ = function(txt, event, repository) {
    var instance = this,
        time = clc.magenta(instance.getFormatTime_(event.created_at)),
        actor = clc.yellow(event.actor.login),
        repo = clc.green(repository);

    base.logger['info'](time + ' - ' + actor + txt + repo);
};

Notifications.prototype.getFormatTime_ = function(timestamp) {
    var time = '',
        findTime = timestamp.indexOf("T");

    if (findTime !== -1) {
        time = timestamp.substring(11, 19);
    } else {
        time = 'Error at getFormatTime()';
    }

    return time;
}

exports.Impl = Notifications;