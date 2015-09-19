/*
 * Copyright 2013-2015, All Rights Reserved.
 *
 * Code licensed under the BSD License:
 * https://github.com/node-gh/gh/blob/master/LICENSE.md
 *
 * @author Eduardo Lundgren <edu@rdo.io>
 * @author Zeno Rocha <zno.rocha@gmail.com>
 */

'use strict';

var logger = {},
    fs = require('fs'),
    handlebars = require('handlebars'),
    moment = require('moment'),
    path = require('path'),
    wrap = require('wordwrap').hard(0, 80),
    colors = require('colors/safe');

function stripHandlebarsNewLine(str) {
    return str.replace(/[\s\t\r\n](\{\{[#\/])/g, '$1');
}

logger.debug = function () {
    if (process.env.GH_VERBOSE) {
        arguments[0] = 'DEBUG: ' + arguments[0];
        console.log.apply(this, arguments);
    }
};

logger.error = function () {
    arguments[0] = 'fatal: ' + arguments[0];
    console.error.apply(this, arguments);
    process.exit(1);
};

logger.warn = function () {
    arguments[0] = 'warning: ' + arguments[0];
    console.error.apply(this, arguments);
};

logger.log = function () {
    console.log.apply(this, arguments);
};

logger.getDuration = function (start, opt_end) {
    if (opt_end === undefined) {
        opt_end = Date.now();
    }

    return moment.duration(moment(start).diff(opt_end)).humanize(true);
};

logger.applyReplacements = function (output, replaceMap) {
    var regexPattern;

    for (regexPattern in replaceMap) {
        if (replaceMap.hasOwnProperty(regexPattern)) {
            output = output.replace(
                new RegExp(regexPattern, 'g'), replaceMap[regexPattern]);
        }
    }

    return output;
};

logger.getErrorMessage = function (err) {
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
    } catch(e) {
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
};

logger.compileTemplate = function (source, map) {
    var template = handlebars.compile(source);

    return logger.applyReplacements(template(map));
};

logger.logTemplate = function (source, map) {
    console.log(logger.compileTemplate(source, map || {}));
};

logger.logTemplateFile = function (file, map) {
    var templatePath,
        source;

    templatePath = path.join(file);

    if (!fs.existsSync(templatePath)) {
        templatePath = path.join(__dirname, 'cmds/templates', file);
    }

    source = fs.readFileSync(templatePath).toString();

    logger.logTemplate(stripHandlebarsNewLine(source), map);
};

logger.registerHelper = function (name, callback) {
    handlebars.registerHelper(name, callback);
};

logger.registerHelpers_ = function () {
    handlebars.registerHelper('date', function (date) {
        return logger.getDuration(date);
    });

    handlebars.registerHelper('compareLink', function () {
        return 'https://github.com/' + this.options.user + '/' + this.options.repo +
            '/compare/' + this.options.pullHeadSHA + '...' + this.options.currentSHA;
    });

    handlebars.registerHelper('forwardedLink', function () {
        return 'https://github.com/' + this.options.fwd + '/' + this.options.repo + '/pull/' +
            this.options.forwardedPull;
    });

    handlebars.registerHelper('link', function () {
        return 'https://github.com/' + this.options.user + '/' + this.options.repo + '/pull/' +
            this.options.number;
    });

    handlebars.registerHelper('submittedLink', function () {
        return 'https://github.com/' + this.options.submit + '/' + this.options.repo + '/pull/' +
            this.options.submittedPull;
    });

    handlebars.registerHelper('issueLink', function () {
        return 'https://github.com/' + this.options.user + '/' + this.options.repo + '/issues/' +
            this.options.number;
    });

    handlebars.registerHelper('gistLink', function () {
        return 'https://gist.github.com/' + this.options.loggedUser + '/' + this.options.id;
    });

    handlebars.registerHelper('repoLink', function () {
        return 'https://github.com/' + this.options.user + '/' + this.options.repo;
    });

    handlebars.registerHelper('wordwrap', function (text, padding, stripNewLines) {
        var gutter = '';

        if (stripNewLines !== false) {
            text = text.replace(/[\r\n\s\t]+/g, ' ');
        }

        text = wrap(text).split('\n');

        if (padding > 0) {
            gutter = (new Array(padding)).join(' ');
        }

        return text.join('\n' + gutter);
    });
};

logger.registerHelpers_();

logger.colors = colors;
module.exports = logger;
