/*
 * Copyright 2013 Elad Elrom, All Rights Reserved.
 *
 * @author @EladElrom
 */

var base = require('../base'),
    logger = require('../logger'),
    prompt = require('prompt'),
    async = require('async'),
    git = require('../git'),
    flowhelper = require('./utils/flowhelper.js');

function Flow(options) {
    this.options = options;
}

var states = {
    INIT    : 'init'    ,
    AUTO    : 'auto'    ,
    FEATURE : 'feature' ,
    RELEASE : 'release' ,
    SUPPORT : 'support' ,
    VERSION : 'version'
};

Flow.DETAILS = {
    description: 'usage: gh flow [sub-command] [flags]',
    options: {
        'init'    : Boolean,
        'auto'    : Boolean,
        'feature' : Boolean,
        'release' : Boolean,
        'support' : Boolean,
        'version' : Boolean
    },
    shorthands: {
        'i': [ '--' + states.INIT ],
        'a': [ '--' + states.AUTO ],
        'f': [ '--' + states.FEATURE ],
        'r': [ '--' + states.RELEASE ],
        's': [ '--' + states.SUPPORT ],
        'v': [ '--' + states.VERSION ]
    }
};

Flow.prototype.run = function () {
    var instance = this,
        options = instance.options;

    var operations = [];
    operations.push(git.getAllCheckoutedBranches);

    async.series(operations, function (err, results) {
        options.branches = results[0];

        var flag = Object.keys(states).some(function (key) {
            return callState(instance, states[key], options);
        });

        if (!flag)
            logger.logTemplateFile('flow.help.handlebars', {});
    });
};

function callState(instance, state, options) {

    if (!options.hasOwnProperty(state)) {
        return false;
    }

    try {
        instance[state](options);
    } catch (err) {
        return false;
    }

    return true;
}

Flow.prototype[states.INIT] = function(options) {
    var listBranches = flowhelper.listBranches(options);
    logger.logTemplateFile( 'flow.init.handlebars', { branches: listBranches });

    prompt.get(flowhelper.initPromptValues(options),
        function(err, result) {
            var initValues = flowhelper.generateConfigInitValues(result);
            base.writeGitConfig(initValues,process.cwd()+'/.git/config');
        }
    );
};

Flow.prototype[states.AUTO] = function(options) {

    var instance = this,
        forkedRepoURL,
        originRepoURL,
        folderName,
        operations;

    if ( (options.argv.remain.length < 7) ||
        (options.argv.remain[1] != 'remote' || options.argv.remain[3] != 'origin' || options.argv.remain[5] != 'folder') )
    {
        logger.log('Incorrect syntax: gh flow --auto remote [your-forked-repo-URL] origin [original-repo-URL] folder [folder-name]');
    }
    else {
        forkedRepoURL =  options.argv.remain[2];
        originRepoURL =  options.argv.remain[4];
        folderName =  options.argv.remain[6];

        operations = [
            function(callback){
                base.createProjectFolder(folderName,function(error) {
                    callback(error,folderName);
                });
            },
            function(callback){
                git.init(function(error,data) {
                    callback(error,data);
                });
            },
            function(callback){
                git.addRemote('origin',forkedRepoURL,function(error,data) {
                    callback(error,data);
                });
            },
            function(callback){
                git.addRemote('upstream',originRepoURL,function(error,data) {
                    callback(error,data);
                });
            },
            function(callback){
                git.fetch(function(error,data) {
                    callback(error,data);
                });
            },
            function(callback){
                git.checkoutBranch('master',function(error,data) {
                    if (error)
                        data = 'master branch doesn\'t exists on repo';

                    callback(null,data);
                });
            },
            function(callback){
                git.checkoutBranch('develop',function(error,data) {
                    if (error)
                        data = 'develop branch doesn\'t exists on repo';

                    callback(null,data);
                });
            },
            function(callback){
                git.getAllCheckoutedBranches(function(error,data) {
                    options.branches = data;
                    callback(error,data);
                });
            }
            ];

        async.series(operations, function(err, results) {
            if (err) throw err;

            logger.logTemplateFile('flow.auto.handlebars', {
                folderName: results[0],
                masterMsg: results[5],
                developMsg: results[6],
                forkedRepoURL : forkedRepoURL,
                originRepoURL : originRepoURL
            });

            instance[states.INIT](options);
        });
    }
};

Flow.prototype[states.FEATURE] = function(options) {

    var subcmd = options.argv.remain[1];
    var instance = this;

    if (options.argv.remain.length == 1) {
        logger.logTemplateFile( 'flow.feature.handlebars', {});
        git.getFlowFindName('prefix',states.FEATURE, function(err, featurePrefixName) {
            if (err) throw err;
            var listBranchesWithFeaturePrefix = flowhelper.sortBranchesByPrefix(options,featurePrefixName);
            if (listBranchesWithFeaturePrefix.length >0)
                logger.logTemplateFile( 'flow.branches.handlebars', { branches: listBranchesWithFeaturePrefix, type: states.FEATURE });
        });
        return;
    } else if (subcmd == 'start' || subcmd == 'finish') {

        var operations = [
            function(callback) {
                git.getFlowFindName('prefix',states.FEATURE, function(err, data) {
                    if (err) throw err;

                    callback(err,data);
                });
            },
            function(callback) {
                git.getFlowFindName('branch','master', function(err, data) {
                    if (err) throw err;

                    callback(err,data);
                });
            },
            function(callback) {
                git.getFlowFindName('branch','develop', function(err, data) {
                    if (err) throw err;

                    callback(err,data);
                });
            }
        ];

        async.series(operations, function(err, results) {

            var featurePrefixName = results[0],
                flowMasterBranchName = results[1],
                flowDevelopBranchName = results[2];

            var featureBranchName = options.argv.remain[2];

            if (featureBranchName === undefined) {
                logger.log('Missing branch name: gh flow --feature '+subcmd+' [branch name]');
                return;
            }

            switch (subcmd) {
                case 'start':
                    git.checkout(flowDevelopBranchName,featurePrefixName+featureBranchName,function(err,data) {
                        if (err) throw err;
                        logger.logTemplateFile( 'flow.feature.start.handlebars', { branchName: featureBranchName });
                    });
                    break;
                case 'finish':
                    git.checkout(flowDevelopBranchName,null,function(err,data) {
                        if (err) throw err;

                        logger.logTemplate('{{prefix}} [info] checkout branch: {{{magentaBright flowDevelopBranchName}}}', {
                            flowDevelopBranchName: flowDevelopBranchName
                        });

                        var fbranch = featurePrefixName+featureBranchName;
                        git.mergeBranchWithCommitObject(fbranch,function(err,data) {
                            if (err) throw err;
                            logger.logTemplate('{{prefix}} [info] merged branch: {{{magentaBright fbranch}}} into {{{magentaBright flowDevelopBranchName}}}', {
                                fbranch: fbranch,
                                flowDevelopBranchName:flowDevelopBranchName
                            });
                            git.removeBranch(fbranch, function(err,data) {
                                if (err) throw err;
                                logger.logTemplate('{{prefix}} [info] removing branch: {{{magentaBright fbranch}}}', {
                                    fbranch:fbranch
                                });
                                git.exec('push', [ 'origin', flowDevelopBranchName ], function(err,data) {
                                    logger.logTemplate('{{prefix}} [info] push changes to origin {{{magentaBright flowDevelopBranchName}}}', {
                                        flowDevelopBranchName:flowDevelopBranchName
                                    });
                                    if (err) throw err;
                                    instance.pullRequest(flowDevelopBranchName,options);
                                });
                            });
                        });
                    });
                    break;
            }
        });

    } else {
        logger.logTemplate('{{prefix}} [info] Incorrect syntax, first flag should be \'start\' or \'finish\'');
    }
};

Flow.prototype.pullRequest = function(flowDevelopBranchName,options) {
    prompt.get(flowhelper.pullRequestPromptValues(),
        function(err, result) {
            if (result.submitPullRequest == 'Y') {
                    var user = options.user,
                    pullBranch = flowDevelopBranchName;

                base.github.pullRequests.create({
                    base: options.branch,
                    body: '',
                    head: options.user + ':' + pullBranch,
                    repo: options.repo,
                    title: pullBranch,
                    user: user
                }, function(err, results) {
                    if (err) {
                        logger.error('Couldn\'t make a pull request! branch: ' + options.branch + 'pullBranch: ' + pullBranch + ', user: ' + user + ' --> ' + err);
                    }
                    else {
                        logger.success('pull request call: '+results[1]);
                    }
                });
            }
        }
    );
};

Flow.prototype[states.RELEASE] = function(options) {
    logger.log(states.RELEASE);
};

Flow.prototype[states.SUPPORT] = function(options) {
    logger.log(states.SUPPORT);
};

Flow.prototype[states.VERSION] = function(options) {
    logger.log('0.0.1');
};

exports.Impl = Flow;