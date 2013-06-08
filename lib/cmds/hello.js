/*
 * Copyright 2013, All Rights Reserved.
 *
 * Code licensed under the BSD License:
 * https://github.com/eduardolundgren/blob/master/LICENSE.md
 *
 * @author Author <email@email.com>
 */

// -- Requires -----------------------------------------------------------------
var base = require('../base'),
    logger = require('../logger');

// -- Constructor --------------------------------------------------------------
function Hello(options) {
    this.options = options;
}

// -- Constants ----------------------------------------------------------------
Hello.DETAILS = {
    description: 'Hello world example. Copy to start a new command.',
    options: {
        'world': Boolean
    },
    shorthands: {
        'w': [ '--world' ]
    }
};

// -- Commands -----------------------------------------------------------------
Hello.prototype.run = function() {
    var instance = this,
        options = instance.options;

    instance.world();
};

Hello.prototype.world = function() {
    logger.log('hello world :)');
};

exports.Impl = Hello;