/*
 * Copyright 2015, All Rights Reserved.
 *
 * Code licensed under the BSD License:
 * https://github.com/node-gh/gh/blob/master/LICENSE.md
 *
 * @author Henrique Vicente <henriquevicente@gmail.com>
 */

'use strict';

function CmdAnonymizer(commandDetails, redaction) {
    this.last = null;
    this.invoked = [];
    this.redaction = redaction;
    this.options = commandDetails.options;
    this.shorthands = commandDetails.shorthands;
}

CmdAnonymizer.prototype.extractArgument = function(word) {
    return word.replace(/-{0,2}/, '');
};

CmdAnonymizer.prototype.isOptionValue = function(option, value) {
    var choice = this.options[option],
        booleans = ['true', 'false'];

    return ((choice instanceof Array && choice.indexOf(value) !== -1) ||
        (choice === Boolean && booleans.indexOf(value.toLowerCase()) !== -1) ||
        (typeof choice === 'string' && choice === value));
};

CmdAnonymizer.prototype.isValueInOptions = function(options, value) {
    if (!(options instanceof Array)) {
        return this.isOptionValue(options, value);
    }

    return options.some(function(each) {
        return this.isOptionValue(this.extractArgument(each), value);
    }, this);
};

CmdAnonymizer.prototype.classify = function(word) {
    var arg = this.extractArgument(word);

    if (arg === 'verbose') {
        this.invoked.push(word);
        this.last = 'verbose';
        return;
    }

    if (this.shorthands && this.shorthands[arg]) {
        this.invoked.push(word);
        this.last = this.shorthands[arg];
        return;
    }

    if (this.options && this.options[arg]) {
        this.invoked.push(word);
        this.last = arg;
        return;
    }

    if (this.options && this.isValueInOptions(this.last, word)) {
        this.invoked.push(word);
        this.last = undefined;
        return;
    }

    if (this.options && this.options[this.last] instanceof Array &&
        this.options[this.last].indexOf(word) !== -1) {
        this.invoked.push(word);
        this.last = undefined;
        return;
    }

    this.invoked.push(this.redaction);
    this.last = undefined;
};

CmdAnonymizer.prototype.resolve = function(cmd) {
    // quasi-strict white list approach (best-effort)

    this.invoked.push(cmd.shift());

    cmd.forEach(this.classify, this);

    return this.invoked;
};

CmdAnonymizer.prototype.resolveToString = function(cmd) {
    return this.resolve(cmd).join(' ');
};

module.exports = CmdAnonymizer;
