"use strict";
/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: CONTRIBUTORS)
 * SPDX-License-Identifier: BSD-3-Clause
 */
function CmdAnonymizer(commandDetails, redaction) {
    this.last = null;
    this.invoked = [];
    this.redaction = redaction;
    this.options = commandDetails.options;
    this.shorthands = commandDetails.shorthands;
}
CmdAnonymizer.prototype.extractArgument = function (word) {
    return word.replace(/-{0,2}/, '');
};
CmdAnonymizer.prototype.isOptionValue = function (option, value) {
    const choice = this.options[option];
    const booleans = ['true', 'false'];
    return ((choice instanceof Array && choice.indexOf(value) !== -1) ||
        (choice === Boolean && booleans.indexOf(value.toLowerCase()) !== -1) ||
        (typeof choice === 'string' && choice === value));
};
CmdAnonymizer.prototype.isValueInOptions = function (options, value) {
    if (!(options instanceof Array)) {
        return this.isOptionValue(options, value);
    }
    return options.some(function (each) {
        return this.isOptionValue(this.extractArgument(each), value);
    }, this);
};
CmdAnonymizer.prototype.classify = function (word) {
    const arg = this.extractArgument(word);
    const whitelist = ['verbose', 'no-hooks'];
    if (whitelist.indexOf(arg) === 0) {
        this.invoked.push(word);
        this.last = arg;
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
    if (this.options &&
        this.options[this.last] instanceof Array &&
        this.options[this.last].indexOf(word) !== -1) {
        this.invoked.push(word);
        this.last = undefined;
        return;
    }
    this.invoked.push(this.redaction);
    this.last = undefined;
};
CmdAnonymizer.prototype.resolve = function (cmd) {
    // quasi-strict white list approach (best-effort)
    this.invoked.push(cmd.shift());
    cmd.forEach(this.classify, this);
    return this.invoked;
};
CmdAnonymizer.prototype.resolveToString = function (cmd) {
    return this.resolve(cmd).join(' ');
};
module.exports = CmdAnonymizer;
