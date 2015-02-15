/*
 * Copyright 2013-2015, All Rights Reserved.
 *
 * Code licensed under the BSD License:
 * https://github.com/node-gh/gh/blob/master/LICENSE.md
 *
 * @author Author <email@email.com>
 */

'use strict';

// -- Requires -------------------------------------------------------------------------------------

var base = require('../base'),
    logger = require('../logger');

// -- Constructor ----------------------------------------------------------------------------------

function Version(options) {
    this.options = options;
}

// -- Constants ------------------------------------------------------------------------------------

Version.DETAILS = {
    alias: '',
    description: 'Print gh version.',
};

// -- Commands -------------------------------------------------------------------------------------

Version.prototype.run = function() {
    base.asyncReadPackages(this.printVersion);
};

Version.prototype.printVersion = function(pkg) {
    logger.log(pkg.name + ' ' + pkg.version);
};

exports.Impl = Version;
