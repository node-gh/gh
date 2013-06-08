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
    logger = require('./logger'),
    path = require('path'),
    updateNotifier = require('update-notifier'),
    userhome = require('userhome');

exports.github = new github({
    version: '3.0.0',
    debug: false
});

exports.checkVersion = function(opt_callback) {
    var notifier = updateNotifier({
        packagePath: '../package',
        updateCheckInterval: 1000 * 60 * 60 * 24 // 1 day
    });

    if (notifier.update) {
        notifier.notify();
    }

    opt_callback && opt_callback();
};

exports.find = function(filepath, opt_pattern) {
    return fs.readdirSync(filepath).filter(function(file) {
        return (opt_pattern || /.*/).test(file);
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
    return userhome('.gh.json');
};

exports.getUser = function() {
    var config = exports.getGlobalConfig();

    return config.github_user;
};

exports.writeGlobalConfig = function(jsonPath, value) {
    var config = exports.getGlobalConfig(),
        i,
        output,
        path,
        pathLen;

    path = jsonPath.split('.');
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


exports.writeGlobalConfig = function(jsonPath, value) {
    var config = exports.getGlobalConfig(),
        i,
        output,
        path,
        pathLen;

    path = jsonPath.split('.');
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
    var configPath = exports.getGlobalConfigPath();

    exports.writeGlobalConfig('github_user', user);
    exports.writeGlobalConfig('github_token', token);
    logger.success('Writing GH config data: ' + configPath);
};

exports.removeGlobalConfig = function(key) {
    var config = exports.getGlobalConfig();

    delete config[key];

    fs.writeFileSync(
        exports.getGlobalConfigPath(),
        JSON.stringify(config, null, 4)
    );
};

exports.writeLocalConfig = function(initValues) {
    var fileName = path.join(__dirname, '../', '.git') + '/config';
    fs.appendFile(fileName, initValues, function (err) {
        if (err) throw err

        logger.success('gh flow init successfully');
    });
}