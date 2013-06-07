/*
 * Copyright 2013 Zeno Rocha, All Rights Reserved.
 *
 * Code licensed under the BSD License:
 * https://github.com/eduardolundgren/blob/master/LICENSE.md
 *
 * @author Zeno Rocha <zno.rocha@gmail.com>
 */

// -- Requires -----------------------------------------------------------------
var base = require('../base'),
    logger = require('../logger');

// -- Constructor --------------------------------------------------------------
function Alias(options) {
    this.options = options;
}

// -- Constants ----------------------------------------------------------------
Alias.DETAILS = {
    alias: 'al',
    description: 'TODO.',
    options: {
        'add'   : String,
        'remove': String,
        'user'  : String
    },
    shorthands: {
        'a': [ '--add'    ],
        'r': [ '--remove' ],
        'u': [ '--user'    ]
    },
    payload: function(payload, options) {}
};

// -- Commands -----------------------------------------------------------------
Alias.prototype.run = function() {
    var instance = this,
        options = instance.options;

    options.alias = options.alias || options.user;

    if (options.add) {
        logger.logTemplate('{{prefix}} [info] Creating alias {{greenBright options.alias}} for user {{greenBright options.user}}', {
            options: options
        });

        instance.add(logger.defaultCallback);
    }

    if (options.remove) {
        logger.logTemplate('{{prefix}} [info] Removing alias {{greenBright options.alias}}', {
            options: options
        });

        instance.remove(logger.defaultCallback);
    }
};

Alias.prototype.add = function() {
    // code goes here
};

Alias.prototype.remove = function() {
    // code goes here
};

exports.Impl = Alias;