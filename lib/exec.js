/*
 * Copyright 2013-2015, All Rights Reserved.
 *
 * Code licensed under the BSD License:
 * https://github.com/node-gh/gh/blob/master/LICENSE.md
 *
 * @author Zeno Rocha <zno.rocha@gmail.com>
 * @author Henrique Vicente <henriquevicente@gmail.com>
 */

'use strict';

var child_process = require('child_process');

exports.spawnSync = function(cmd, args) {
    var exec = child_process.spawnSync(cmd, args);

    return {
        stdout: exec.stdout.toString().trim(),
        stderr: exec.stderr.toString().trim(),
        status: exec.status
    };
};

exports.spawnSyncStream = function(cmd, args) {
    return child_process.spawnSync(cmd, args, {
        stdio: ['pipe', process.stdout, process.stderr]
    });
};
