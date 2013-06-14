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
    userhome = require('userhome'),
    updateNotifier = require('update-notifier');

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

exports.getDuration = function(start, opt_end) {
    if (opt_end === undefined) {
        opt_end = Date.now();
    }

    return moment.duration(moment(opt_end).diff(start)).humanize(true);
};

exports.getGlobalConfig = function() {
    var config,
        configPath;

    configPath = exports.getGlobalConfigPath();

    if (!fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, '');
    }

    try {
        var isGithubValues = false,
            isNodeGhValues = false;

        var userConfig = fs.readFileSync(configPath,'utf8').split('\n');

        for (var i=0; i<userConfig.length; i++) {
            if (userConfig[i] == '[github]') {
                isGithubValues = true;
            } else if ( userConfig[i] == '[nodegh]' ) {
                isNodeGhValues = true;
            }
        }

        if (!isGithubValues && !isNodeGhValues) {
            return {};
        } else {
            var config = {
               github_user : exports.findParam(userConfig,'user'),
               github_token : exports.findParam(userConfig,'token'),
               default_branch : exports.findParam(userConfig,'branch'),
               open_issue_in_browser : exports.findParam(userConfig,'issuebrowser'),
               open_pull_request_in_browser : exports.findParam(userConfig,'pullbrowser'),
               pull_branch_name_prefix : exports.findParam(userConfig,'pullprefix'),
               replace : exports.findParam(userConfig,'replace')
            };

            return config;
        }
    }
    catch(err) {
        return {};
    }
};

exports.findParam = function(userConfig,paramTofind) {
    for (var i=0; i<userConfig.length; i++) {
        var checkConfigValue = userConfig[i].toString();
        if (checkConfigValue.indexOf(paramTofind) !=-1) {
            var retVal = userConfig[i].replace(paramTofind,'').replace('[','').
                replace(']','').replace('\t','').replace(' = ','');
            if (retVal !== '')
                return retVal.trim();
        }
    }
}

exports.getUser = function() {
    var config = exports.getGlobalConfig();

    return config.github_user;
};

exports.writeGlobalConfigCredentials = function(user, token) {
    var initValues = exports.generateGlobalConfigInitValues(user,token);
    exports.writeGitConfig(initValues,exports.getGlobalConfigPath());
};

exports.getGlobalConfigPath = function() {
    return userhome('.gitconfig');
};

exports.removeGlobalConfig = function(key) {
    // todo: implement
};

exports.writeGitConfig = function(initValues,path) {
    logger.success('path: '+path);
    fs.appendFileSync(path, initValues);
    logger.success('gh init successfully');
};

exports.createProjectFolder = function(folderName,opt_callback) {
    fs.mkdir(process.cwd()+'/'+folderName,0777,function(error) {
        if (error) throw error;
        exports.resolveToProjectFolder(folderName);
        opt_callback(error,folderName);
    });
};

exports.resolveToProjectFolder = function(folderName) {
    process.chdir(process.cwd()+'/'+folderName);
};

exports.generateGlobalConfigInitValues = function (user,token) {
    return '[github]\n' +
        '	user = ' +user+'\n' +
        '	token = '+token+'\n' +
        '[nodegh]\n' +
        '	default = master\n' +
        '	issuebrowser = true\n' +
        '	pullbrowser = true\n' +
        '	pullprefix = pull-\n' +
        '	replace = {}\n';
};
