/*
 * Copyright 2013, All Rights Reserved.
 *
 * Code licensed under the BSD License:
 * https://github.com/eduardolundgren/blob/master/LICENSE.md
 *
 * @author Eduardo Lundgren <eduardo.lundgren@gmail.com>
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
    description: 'Create alias for a username.',
    options: {
        'add'   : String,
        'list'  : Boolean,
        'remove': String,
        'user'  : String
    },
    shorthands: {
        'a': [ '--add' ],
        'l': [ '--list' ],
        'r': [ '--remove' ],
        'u': [ '--user' ]
    },
    payload: function(payload, options) {
        if (payload[0]) {
            options.add = payload[0];
            options.paramUser = options.user = payload[1];
        }
        else {
            options.list = true;
        }
    }
};

// -- Commands -----------------------------------------------------------------
Alias.prototype.run = function() {
    var instance = this,
        options = instance.options;

    if (options.add) {
        if (!options.paramUser) {
            logger.error('You must specify an user, try --user username.');
        }

        logger.logTemplate('{{prefix}} [info] Creating alias {{greenBright options.add}} for user {{greenBright options.user}}', {
            options: options
        });

        instance.add(logger.defaultCallback);
    }

    if (options.list) {
        instance.list(function(err, data) {
            logger.logTemplateFile('alias.handlebars', {
                alias: data
            });
        });
    }

    if (options.remove) {
        logger.logTemplate('{{prefix}} [info] Removing alias {{greenBright options.remove}}', {
            options: options
        });

        instance.remove(logger.defaultCallback);
    }
};

Alias.prototype.add = function(opt_callback) {
    var instance = this,
        options = instance.options;

    base.writeGlobalConfig('alias.' + options.add, options.user);

    opt_callback && opt_callback();
};

Alias.prototype.list = function(opt_callback) {
    var instance = this;

    opt_callback && opt_callback(null, base.getGlobalConfig().alias);
};

Alias.prototype.remove = function() {
    var instance = this,
        options = instance.options,
        config = base.getGlobalConfig();

    delete config.alias[options.remove];

    base.writeGlobalConfig('alias', config.alias);
};

exports.Impl = Alias;