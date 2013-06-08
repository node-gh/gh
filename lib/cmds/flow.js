/*
 * Copyright 2013 Elad Elrom, All Rights Reserved.
 *
 * @author @EladElrom
 */

// -- Requires -----------------------------------------------------------------
var base = require('../base'),
    logger = require('../logger'),
    prompt = require('prompt'),
    async = require('async'),
    git = require('../git');
    flowhelper = require('./utils/flowhelper.js');

// -- Constructor --------------------------------------------------------------
function Flow(options) {
    this.options = options;
}

// -- States --------------------------------------------------------------

var states = {
    INIT    : 'init'    ,
    FEATURE : 'feature' ,
    RELEASE : 'release' ,
    SUPPORT : 'support' ,
    VERSION : 'version'
}

// -- Constants ----------------------------------------------------------------
Flow.DETAILS = {
    description: 'usage: gh flow [sub-command] [flags]',
    options: {
        'init'    : Boolean,
        'feature' : Boolean,
        'release' : Boolean,
        'support' : Boolean,
        'version' : Boolean
    },
    shorthands: {
        'i': [ '--' + states.INIT ],
        'f': [ '--' + states.FEATURE ],
        'r': [ '--' + states.RELEASE ],
        's': [ '--' + states.SUPPORT ],
        'v': [ '--' + states.VERSION ]
    }
};

// -- Commands -----------------------------------------------------------------
Flow.prototype.run = function() {
    var instance = this,
        options = instance.options;


    var operations = [];
    operations.push(git.getAllCheckoutedBranches);

    async.series(operations, function(err, results) {
        options.branches = results[0];
        if ( options.hasOwnProperty(states.INIT) && options[states.INIT] )
            instance[states.INIT](options);
        else if ( options.hasOwnProperty(states.FEATURE) && options[states.FEATURE] )
            instance[states.FEATURE](options);
        else if ( options.hasOwnProperty(states.RELEASE) && options[states.RELEASE] )
            instance[states.RELEASE](options);
        else if ( options.hasOwnProperty(states.SUPPORT) && options[states.SUPPORT] )
            instance[states.SUPPORT](options);
        else if ( options.hasOwnProperty(states.VERSION) && options[states.VERSION] )
            instance[states.VERSION](options);
        else
            logger.logTemplateFile('flow.help.handlebars', {});
    });
};

Flow.prototype[states.INIT] = function(options) {
    logger.log(states.INIT);

    var listBranches = flowhelper.listBranches(options);
    logger.logTemplateFile( 'flow.init.handlebars', { branches: listBranches });

    prompt.get(flowhelper.initPromptValues(options),
        function(err, result) {
            var initValues = flowhelper.generateConfigInitValues(result);
            base.writeLocalConfig(initValues);
        }
    );
};

Flow.prototype[states.FEATURE] = function(options) {

    var subcmd = options['argv'].remain[1];
    var instance = this;

    if (options['argv'].remain.length == 1) {
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

            var featureBranchName = options['argv'].remain[2];

            if (featureBranchName == undefined) {
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
                        logger.logTemplate('{{prefix}} [info] checkout branch: {{{magentaBright'+flowDevelopBranchName+'}}}');
                        git.merge(featurePrefixName+featureBranchName,'merge',null,function(err,data) {
                            logger.logTemplate('{{prefix}} [info] merged branch: {{{magentaBright'+featurePrefixName+featureBranchName+'}}} into {{{magentaBright'+ flowDevelopBranchName+'}}}');
                            git.removeBranch(featurePrefixName+featureBranchName, function(err,data) {
                                if (err) throw err;
                                logger.logTemplate('{{prefix}} [info] removing branch: {{{magentaBright'+featurePrefixName+featureBranchName+'}}}');

                                // flow re-visit!
                                instance.pullRequest();
                            });
                        });
                    });
                    break;
            }
        });

    } else {
        logger.logTemplate("{{prefix}} [info] Incorrect syntax, first flag should be 'start' or 'finish'");
    }
};

Flow.prototype.pullRequest = function(opt_callback) {
    var instance = this,
        options = instance.options,
        user = options.user,
        operations,

    pullBranch = options.currentBranch;

    operations = [
        function(callback) {
            git.exec('push', [ 'origin', pullBranch ], callback);
        },
        function(callback) {
            base.github.pullRequests.create({
                base: options.branch,
                body: '',
                head: options.user + ':' + pullBranch,
                repo: options.repo,
                title: options.title || pullBranch,
                user: user
            }, callback);
        }
    ];

    async.series(operations, function(err, results) {
        if (err) {
            // implement
        }
        else {
            opt_callback && opt_callback(err, results[1]);
        }
    });
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