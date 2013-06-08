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
    prompt = require('prompt'),
    updateNotifier = require('update-notifier'),
    userhome = require('userhome');

exports.github = new github({
    version: "3.0.0",
    debug: false
});

exports.authorize = function(opt_callback) {
    var config;

    config = exports.getGlobalConfig();

    exports.github.authenticate({
        type: "oauth",
        token: config.github_token
    });

    opt_callback && opt_callback();
};

exports.logout = function() {
    fs.unlink(exports.getGlobalConfigPath(), function (err) {
        if (err) throw err;
        logger.success('Successfully logout!');
    });
}

exports.createAuthorization = function(opt_callback) {
    logger.log('First we need authorization to use GitHub\'s API');

    prompt.get([{
        name: "username",
        message: "Username",
        empty: false
    },
    {
        name: "password",
        message: "Password",
        empty: false,
        hidden: true
    }],
    function(err, result) {
        exports.github.authenticate({
            type: "basic",
            username: result.username,
            password: result.password
        });

        exports.github.authorization.create({
                note: 'node-gh',
                note_url: 'https://github.com/eduardolundgren/node-gh',
                scopes: [ 'user', 'public_repo', 'repo', 'repo:status', 'gist' ]
            },
            function(err, res) {
                if (err) {
                    logger.error('Could not authenticate :(');
                }

                if (res.token) {
                    exports.writeGlobalConfigCredentials(result.username, res.token);
                    exports.authorize(opt_callback);
                    logger.success('Authentication completed :)');
                }
            }
        );
    });
};

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
    var config;

    config = exports.getGlobalConfig();

    return config.github_user;
};

exports.hasCredentials = function() {
    var config;

    config = exports.getGlobalConfig();

    if (config.github_token && config.github_user && config.github_token != '' && config.github_user != '') {
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
    logger.success('Writing config data to file: ' + exports.getGlobalConfigPath() );
    exports.writeGlobalConfig('github_user', user);
    exports.writeGlobalConfig('github_token', token);
};

exports.writeLocalConfig = function(initValues) {
    var fileName = path.join(__dirname, '../', '.git') + '/config';
    // console.log('\n\n writetofile: '+ fileName + '\n\n' + initValues);
    fs.appendFile(fileName, initValues, function (err) {
        if (err) throw err

        logger.success('gh flow init successfully');
    });
}