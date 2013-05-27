/*
* Copyright 2013 Zeno Rocha, All Rights Reserved.
*
* Code licensed under the BSD License:
* https://github.com/eduardolundgren/blob/master/LICENSE.md
*
* @author Zeno Rocha <zno.rocha@gmail.com>
*/

var base = require('../base'),
    logger = require('../logger'),
    path = require('path');

function Help(options) {
    this.options = options;
}

Help.DETAILS = {
    description: 'Help'
};

Help.prototype.run = function() {
    var instance = this;

    var cmdDir = instance.getCmdDir(),
        cmdList = base.find(cmdDir, /\.js$/),
        cmdOutput = [];

    // Remove help from command list
    cmdList.splice(cmdList.indexOf('help.js'), 1);

    for (var i = 0; i < cmdList.length; i++) {
        var cmd = require(path.join(cmdDir, cmdList[i])),
            flagOutput = [];

        for (var flag in cmd.Impl.DETAILS.options) {
            flagOutput.push(flag);
        }

        cmdOutput[i] = {
            name: path.basename(cmdList[i], '.js'),
            description: cmd.Impl.DETAILS.description,
            flags: flagOutput
        };
    }

    logger.logTemplateFile('help.handlebars', {
        commands: cmdOutput
    });
};

Help.prototype.getCmdDir = function() {
    return path.join(__dirname, '../cmds/');
};

exports.Impl = Help;