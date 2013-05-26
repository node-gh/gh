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

function Issues(options, currentRepository) {
    this.options = options;
    this.currentRepository = currentRepository;
}

Issues.DETAILS = {
    options: {
        'list': Boolean,
        'user': String,
        'repo': String
    },
    shorthands: {
        'l': [ '--list' ],
        'u': [ '--user' ],
        'r': [ '--repo' ]
    },
    description: 'Issues'
};

Issues.prototype.run = function() {
    var instance = this,
        options = instance.options;

    options.user = options.user || base.getUser();
    options.repo = options.repo || instance.currentRepository;

    if (options.list) {
        instance.list();
    }
};

Issues.prototype.list = function() {
    var instance = this;

    base.github.issues.repoIssues({
        user: instance.options.user,
        repo: instance.options.repo
    },
    function(error, result) {
        if (error) {
            process.exit(0);
        }

        for (var i = 0; i < result.length; i++) {
            instance.logList_(result[i]);
        }
    });
};

Issues.prototype.logList_ = function(issue) {
    var issueNumber = clc.magentaBright('#' + issue.number),
        issueTitle = issue.title,
        issueCreator = clc.greenBright('@' + issue.user.login),
        issueUrl = clc.blue(issue.html_url);

    base.logger.info(issueNumber + ' ' + issueTitle + ' - ' + issueCreator + ' - ' + issueUrl);
};

exports.Impl = Issues;