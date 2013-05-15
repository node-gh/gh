/*
* Copyright 2013 Eduardo Lundgren, All Rights Reserved.
*
* Code licensed under the BSD License:
* https://github.com/eduardolundgren/blob/master/LICENSE.md
*
* @author Eduardo Lundgren <eduardolundgren@gmail.com>
*/

var fs = require('fs'),
    moment = require('moment'),
    github = require('github'),
    path = require('path'),
    prompt = require('cli-prompt');

exports.github = new github({
    version: "3.0.0"
});

exports.logger = require('cli-log').init({
    prefix: 'gh',
    prefixColor: 'magenta'
});

exports.authorize = function() {
    var config;

    config = exports.getGlobalConfig();

    exports.github.authenticate({
        type: "oauth",
        token: config.github.token
    });
};

exports.createAuthorization = function() {
    exports.logger.log('node-gh needs authorization to use github api');

    prompt('type your user: ', function(user) {
        prompt('type your password: ', function(password) {
            exports.github.authenticate({
                type: "basic",
                username: user,
                password: password
            });

            exports.github.authorization.create({
                    note: 'node-gh',
                    note_url: 'https://github.com/eduardolundgren/node-gh',
                    scopes: [ 'user', 'public_repo', 'repo', 'repo:status', 'gist' ]
                },
                function(err, res) {
                    if (err) {
                        exports.logger.error('node-gh could not authenticate');
                    }

                    if (res.token) {
                        exports.writeGlobalConfigCredentials(user, res.token);
                        exports.logger.success('token saved');
                        process.exit(0);
                    }
                }
            );
        });
    });
};

exports.getDateDurationBestMatch = function(start, opt_end) {
    var duration,
        description,
        i,
        match,
        matches = [ 'years', 'months', 'days', 'hours', 'minutes', 'seconds' ];

    description = [];
    duration = exports.getDateDuration(start, opt_end);

    for (i = 0; i < matches.length; i++) {
        match = matches[i];

        if (duration[match] > 0) {
            description.push(
                duration[match],
                (duration[match] === 1) ?
                    // print singular, e.g. day
                    match.substring(0, match.length - 1) :
                    // print plural, e.g. days
                    match);
            break;
        }
    }

    return description.join(' ');
};

exports.getDateDuration = function(start, opt_end) {
    var end;

    end = moment(opt_end === undefined ? Date.now() : opt_end);

    return {
        days: end.diff(start, 'days'),
        hours: end.diff(start, 'hours'),
        minutes: end.diff(start, 'minutes'),
        months: end.diff(start, 'months'),
        seconds: end.diff(start, 'seconds'),
        weeks: end.diff(start, 'weeks')
    };
};

exports.getGlobalConfig = function() {
    var configPath;

    configPath = exports.getGlobalConfigPath();

    if (!fs.existsSync(configPath)) {
        exports.logger.warn('config file ' + configPath + ' not found');
        return {};
    }

    try {
        return require(configPath);
    }
    catch(err) {
        return {};
    }
};

exports.getGlobalConfigPath = function() {
    return path.join(process.env.HOME, '.gh.json');
};

exports.hasCredentials = function() {
    var config;

    config = exports.getGlobalConfig();

    if (config.github && config.github.token && config.github.user) {
        return true;
    }
    return false;
};

exports.login = function() {
    if (exports.hasCredentials()) {
        exports.authorize();
    }
    else {
        exports.createAuthorization();
    }
};

exports.writeGlobalConfig = function(jsonPath, value) {
    var config,
        i,
        output,
        path,
        pathLen;

    path = jsonPath.split('.');
    config = exports.getGlobalConfig();
    output = config;

    for (i = 0, pathLen = path.length; i < pathLen; i++) {
        output[path[i]] = config[path[i]] || (i + 1 === pathLen ? value : {});
        output = output[path[i]];
    }

    fs.writeFileSync(
        exports.getGlobalConfigPath(),
        JSON.stringify(config, null, 4)
    );
};

exports.writeGlobalConfigCredentials = function(user, token) {
    exports.writeGlobalConfig('github.user', user);
    exports.writeGlobalConfig('github.token', token);
};