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
    prompt = require('cli-prompt'),
    logger = require('./logger');

exports.github = new github({
    version: "3.0.0",
    debug: false
});

exports.authorize = function(opt_callback) {
    var config;

    config = exports.getGlobalConfig();

    exports.github.authenticate({
        type: "oauth",
        token: config.github.token
    });

    opt_callback && opt_callback();
};

exports.createAuthorization = function(opt_callback) {
    logger.log('node-gh needs authorization to use github api');

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
                        logger.error('node-gh could not authenticate');
                    }

                    if (res.token) {
                        exports.writeGlobalConfigCredentials(user, res.token);
                        logger.success('token saved');
                        opt_callback = opt_callback && opt_callback();
                        process.exit(0);
                    }
                }
            );
        });
    });
};

exports.getConfigPath = function() {
    return path.join(__dirname, '../', '.gh.json');
};

exports.getDuration = function(start, opt_end) {
    if (opt_end === undefined) {
        opt_end = Date.now();
    }

    return moment.duration(moment(opt_end).diff(start)).humanize(true);
};

exports.getGlobalConfig = function() {
    var configPath,
        config,
        userConfig;

    configPath = exports.getGlobalConfigPath();

    if (!fs.existsSync(configPath)) {
        logger.warn('config file ' + configPath + ' not found');
        logger.info('creating ' + configPath);
        fs.writeFileSync(configPath, '{}');
    }

    try {
        config = require(exports.getConfigPath());
        userConfig = require(configPath);

        Object.keys(userConfig).forEach(function(value) {
            config[value] = userConfig[value];
        });

        return config;
    }
    catch(err) {
        return {};
    }
};

exports.getGlobalConfigPath = function() {
    return path.join(process.env.HOME, '.gh.json');
};

exports.getUser = function() {
    var config;

    config = exports.getGlobalConfig();

    return config.github.user;
};

exports.hasCredentials = function() {
    var config;

    config = exports.getGlobalConfig();

    if (config.github && config.github.token && config.github.user) {
        return true;
    }
    return false;
};

exports.login = function(opt_callback) {
    if (exports.hasCredentials()) {
        exports.authorize(opt_callback);
    }
    else {
        exports.createAuthorization(opt_callback);
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