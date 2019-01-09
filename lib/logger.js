"use strict";
/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: CONTRIBUTORS)
 * SPDX-License-Identifier: BSD-3-Clause
 */
Object.defineProperty(exports, "__esModule", { value: true });
const color = require("colors/safe");
const fs = require("fs");
const handlebars = require("handlebars");
const moment = require("moment");
const path = require("path");
const wordwrap = require("wordwrap");
if (process.env.NODE_ENV === 'testing' || process.env.COLOR === 'false') {
    color.disable();
}
exports.colors = color;
const wrap = wordwrap.hard(0, 80);
function stripHandlebarsNewLine(str) {
    return str.replace(/[\s\t\r\n](\{\{[#\/])/g, '$1');
}
function debug(...args) {
    if (!process.env.GH_VERBOSE) {
        return;
    }
    if (typeof args[0] === 'string') {
        args[0] = `DEBUG: ${args[0]}`;
        console.log(...args);
        return;
    }
    console.log('DEBUG:', ...args);
}
exports.debug = debug;
function insane(...args) {
    if (!process.env.GH_VERBOSE_INSANE) {
        return;
    }
    console.log(...args);
}
exports.insane = insane;
function error(...args) {
    if (typeof args[0] === 'string') {
        args[0] = `fatal: ${args[0]}`;
    }
    console.error(...args);
    process.exit(1);
}
exports.error = error;
function warn(...args) {
    args[0] = `warning: ${args[0]}`;
    console.error(...args);
}
exports.warn = warn;
function log(...args) {
    console.log(...args);
}
exports.log = log;
function getDuration(start, opt_end = Date.now()) {
    return moment.duration(moment(start).diff(opt_end)).humanize(true);
}
exports.getDuration = getDuration;
function applyReplacements(output, replaceMap) {
    var regexPattern;
    for (regexPattern in replaceMap) {
        if (replaceMap.hasOwnProperty(regexPattern)) {
            output = output.replace(new RegExp(regexPattern, 'g'), replaceMap[regexPattern]);
        }
    }
    return output;
}
exports.applyReplacements = applyReplacements;
function getErrorMessage(err) {
    var msg;
    // General normalizer
    if (!err) {
        return 'No error message.';
    }
    if (err.errors) {
        return err.errors;
    }
    // Normalize github api error
    if (!err.message) {
        return err;
    }
    try {
        msg = JSON.parse(err.message);
    }
    catch (e) {
        return err.message;
    }
    if (typeof msg === 'string') {
        return msg;
    }
    if (msg.errors && msg.errors[0] && msg.errors[0].message) {
        return msg.errors[0].message;
    }
    if (msg.message) {
        return msg.message;
    }
    // Normalize git error
    return err.message.replace('Command failed: fatal: ', '').trim();
}
exports.getErrorMessage = getErrorMessage;
function compileTemplate(source, map) {
    var template = handlebars.compile(source);
    return applyReplacements(template(map));
}
exports.compileTemplate = compileTemplate;
function logTemplate(source, map) {
    console.log(compileTemplate(source, map || {}));
}
exports.logTemplate = logTemplate;
function logTemplateFile(file, map) {
    let templatePath;
    let source;
    templatePath = path.join(file);
    if (!fs.existsSync(templatePath)) {
        templatePath = path.join(__dirname, 'cmds/templates', file);
    }
    source = fs.readFileSync(templatePath).toString();
    logTemplate(stripHandlebarsNewLine(source), map);
}
exports.logTemplateFile = logTemplateFile;
function registerHelper(name, callback) {
    handlebars.registerHelper(name, callback);
}
exports.registerHelper = registerHelper;
function registerHelpers_() {
    handlebars.registerHelper('date', date => {
        return getDuration(date);
    });
    handlebars.registerHelper('compareLink', function () {
        const { github_host, user, repo, pullHeadSHA, currentSHA } = this.options;
        return `${github_host}${user}/${repo}/compare/${pullHeadSHA}...${currentSHA}`;
    });
    handlebars.registerHelper('forwardedLink', function () {
        const { github_host, fwd, repo, forwardedPull } = this.options;
        return `${github_host}${fwd}/${repo}/pull/${forwardedPull}`;
    });
    handlebars.registerHelper('link', function () {
        const { github_host, user, repo, number } = this.options;
        return `${github_host}${user}/${repo}/pull/${number}`;
    });
    handlebars.registerHelper('submittedLink', function () {
        const { github_host, submit, repo, submittedPull } = this.options;
        return `${github_host}${submit}/${repo}/pull/${submittedPull}`;
    });
    handlebars.registerHelper('issueLink', function () {
        const { github_host, user, repo, number } = this.options;
        return `${github_host}${user}/${repo}/issues/${number}`;
    });
    handlebars.registerHelper('gistLink', function () {
        const { github_gist_host, loggedUser, id } = this.options;
        return `${github_gist_host}${loggedUser}/${id}`;
    });
    handlebars.registerHelper('repoLink', function () {
        const { github_gist_host, user, repo } = this.options;
        return `${github_gist_host}${user}/${repo}`;
    });
    handlebars.registerHelper('wordwrap', (text, padding, stripNewLines) => {
        let gutter = '';
        if (stripNewLines !== false) {
            text = text.replace(/[\r\n\s\t]+/g, ' ');
        }
        text = wrap(text).split('\n');
        if (padding > 0) {
            gutter = ' '.repeat(padding);
        }
        return text.join(`\n${gutter}`);
    });
}
exports.registerHelpers_ = registerHelpers_;
registerHelpers_();
