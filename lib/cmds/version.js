'use strict'

var base = require('../base'),
    logger = require('../logger')

function Version() {}

Version.DETAILS = {
    alias: 'v',
    description: 'Print gh version.',
}

Version.prototype.run = function() {
    base.asyncReadPackages(this.printVersion)
}

Version.prototype.printVersion = function(pkg) {
    logger.log(pkg.name + ' ' + pkg.version)
}

exports.Impl = Version
