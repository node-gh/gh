/*
* Copyright 2013 Zeno Rocha, All Rights Reserved.
*
* Code licensed under the BSD License:
* https://github.com/eduardolundgren/blob/master/LICENSE.md
*
* @author Zeno Rocha <zno.rocha@gmail.com>
*/

var base = require('../base'),
    logger = require('../logger');

function Hello(options) {
    this.options = options;
}

Hello.DETAILS = {
    options: {
        'world': Boolean
    },
    shorthands: {
        'w': [ '--world' ]
    },
    description: 'Hello World'
};

Hello.prototype.run = function() {
    var instance = this,
        options = instance.options;

    base.login();

    if (options.world) {
        instance.world();
    }
};

Hello.prototype.world = function() {
    logger.log('hello world :)');
};

exports.Impl = Hello;