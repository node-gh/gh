/*
 * Copyright 2015, All Rights Reserved.
 *
 * Code licensed under the BSD License:
 * https://github.com/node-gh/gh/blob/master/LICENSE.md
 *
 * @author Henrique Vicente <henriquevicente@gmail.com>
 */

'use strict';

var tracker,
    Insight = require('insight'),
    CmdAnonymizer = require('./cmd-anonymizer'),
    pkg = require('../package.json'),
    redaction = '********';

tracker = new Insight({
    trackingCode: pkg.trackingCode,
    pkg: pkg
});

tracker.resolveCommand = function (cmd, commandDetails) {
    var cmdAnonymizer;

    if (!commandDetails) {
        return cmd.join(' ').replace(/\w+/g, redaction);
    }

    cmdAnonymizer = new CmdAnonymizer(commandDetails, redaction);

    return cmdAnonymizer.resolveToString(cmd);
};

tracker.trackCommand = function (cmd, commandDetails) {
    var tracking = pkg.name + ' ' + this.resolveCommand(cmd, commandDetails);

    this.track(tracking.replace(/ /g, '%20'));
};

module.exports = tracker;
