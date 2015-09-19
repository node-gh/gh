/*
 * Copyright 2013-2015, All Rights Reserved.
 *
 * Code licensed under the BSD License:
 * https://github.com/node-gh/gh/blob/master/LICENSE.md
 *
 */

'use strict';

// -- Requires -------------------------------------------------------------------------------------

var logger = require('../logger'),
    tracker = require('../tracker');

// -- Constructor ----------------------------------------------------------------------------------

function Track(options) {
    this.options = options;
}

// -- Constants ------------------------------------------------------------------------------------

Track.DETAILS = {
    alias: 'tk',
    description: 'Anonymous usage reporting control.',
    commands: [
        'opt-in',
        'opt-out'
    ],
    options: {
        'opt-in': Boolean,
        'opt-out': Boolean
    },
    shorthands: {
        'o': ['--opt-in'],
        'O': ['--opt-out']
    }
};

// -- Commands -------------------------------------------------------------------------------------

Track.prototype.run = function () {
    var options = this.options;

    if (options['opt-in']) {
        this.optIn();
    }

    if (options['opt-out']) {
        this.optOut();
    }

    this.isTracking();
};

Track.prototype.isTracking = function () {
    var status = 'enable',
        next = 'opt-out',
        current = tracker.optOut !== false;

    if (current) {
        status = 'disable';
        next = 'opt-in';
    }

    logger.log('Reporting anonymous usage statistics is ' + logger.bold.bold(status + 'd') + '.');
    logger.log('You can ' + next + ' it with: ' + logger.bold.cyan('gh track --' + next));
};

Track.prototype.optIn = function () {
    tracker.optOut = false;
};

Track.prototype.optOut = function () {
    tracker.optOut = true;
};

exports.Impl = Track;
