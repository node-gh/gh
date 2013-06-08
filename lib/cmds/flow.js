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
    description: 'usage: gh git flow [subcommand]',
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

    if (options['argv'].remain.length == 1)
        logger.logTemplateFile( 'flow.feature.handlebars', {});

    logger.log(states.FEATURE);
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