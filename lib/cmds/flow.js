/*
 * Copyright 2013 Elad Elrom, All Rights Reserved.
 *
 * Code licensed under the BSD License:
 * https://github.com/eduardolundgren/blob/master/LICENSE.md
 *
 * @author Elad Elrom
 */

// -- Requires -----------------------------------------------------------------
var base = require('../base'),
    logger = require('../logger'),
    prompt = require('prompt'),
    git = require('git-wrapper'),
    git = require('../git');

// -- Constructor --------------------------------------------------------------
function Flow(options) {

    git.getOriginURL(function(err, data) {
        options.getOriginURL = data;
    });

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
    description: 'usage: gh git flow [subcommand] based on nvie/gitflow',
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

        // options.init = options.login || instance.logout();

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
};

Flow.prototype[states.INIT] = function(options) {
    logger.log(states.INIT);

    prompt.get([
        {
            name: "productionReleaseBranchName",
            message:
                'Which branch should be used for bringing forth production releases?' + '\n' +
                '\t' + '- develop' + '\n' +
                '\t' + '- master' + '\n' +
                'Branch name for production releases [master]',
            empty: true
        },
        {
            name: "nextReleaseBranchName",
            message:
                'Which branch should be used for integration of the "next release"?' + '\n' +
                    '\t' + '- develop' + '\n' +
                    'Branch name for "next release" development: [develop]',
            empty: true
        },
        {
            name: "branchPrefixes",
            message:
                'How to name your supporting branch prefixes?',
            empty: true
        },
        {
            name: "feature",
            message:
                'Feature branches? [feature/]',
            empty: true
        },
        {
            name: "release",
            message:
                'Release branches? [release/]',
            empty: true
        },
        {
            name: "hotfix",
            message:
                'Hotfix branches? [hotfix/]',
            empty: true
        },
        {
            name: "support",
            message:
                'Support branches? [support/]',
            empty: true
        },
        {
            name: "tags",
            message:
                'Version tag prefix? []',
            empty: true
        }
        ],
        function(err, result) {
            // implement
        });
};

Flow.prototype[states.FEATURE] = function(options) {
    logger.log(states.FEATURE);
};

Flow.prototype[states.RELEASE] = function(options) {
    logger.log(states.RELEASE);
};

Flow.prototype[states.SUPPORT] = function(options) {
    logger.log(states.SUPPORT);
};

Flow.prototype[states.VERSION] = function(options) {
    logger.log(states.VERSION);
};

exports.Impl = Flow;