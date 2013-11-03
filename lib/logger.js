/*
 * Copyright 2013, All Rights Reserved.
 *
 * Code licensed under the BSD License:
 * https://github.com/node-gh/gh/blob/master/LICENSE.md
 *
 * @author Eduardo Lundgren <eduardolundgren@gmail.com>
 * @author Zeno Rocha <zno.rocha@gmail.com>
 */

'use strict';

var base = require('./base'),
    clc = require('cli-color'),
    cll = require('cli-log'),
    fs = require('fs'),
    handlebars = require('handlebars'),
    path = require('path'),
    wrap = require('wordwrap').hard(0, 80);

var logger = cll.init({
    prefix: 'gh',
    prefixColor: 'cyan'
});

var slice = Array.prototype.slice,
    stripHandlebarsNewLine = function(str) {
        return str.replace(/[\s\t\r\n](\{\{[#\/])/g, '$1');
    };

logger.applyReplacements = function(output) {
    var config = base.getConfig(),
        configReplace,
        regexPattern;

    configReplace = config.replace;

    for (regexPattern in configReplace) {
        if (configReplace.hasOwnProperty(regexPattern)) {
            output = output.replace(
                new RegExp(regexPattern, 'g'), configReplace[regexPattern]);
        }
    }

    return output;
};

logger.defaultCallback = function(err, data, success) {
    if (err) {
        logger.error(logger.getErrorMessage(err));
    }

    if (success !== false) {
        logger.success(success || '✔');
    }
};

logger.getErrorMessage = function(err) {
    // General normalizer
    if (err.errors) {
        return err.errors;
    }

    // Normalize github api error
    if (err.message) {
        try {
            return JSON.parse(err.message).errors[0].message;
        }
        catch (e) {}

        try {
            return JSON.parse(err.message).message;
        }
        catch (e) {}

        // Normalize git error
        try {
            return err.message.replace('Command failed: fatal: ', '').trim();
        }
        catch (e) {}
    }

    return err;
};

logger.compileTemplate = function(source, map) {
    var template;

    map.prefix = clc.cyan('gh');

    template = handlebars.compile(source);

    return logger.applyReplacements(template(map));
};

logger.logTemplate = function(source, map) {
    console.log(logger.compileTemplate(source, map || {}));
};

logger.logTemplateFile = function(file, map) {
    var templatePath,
        source;

    templatePath = path.join(file);

    if (!fs.existsSync(templatePath)) {
        templatePath = path.join(__dirname, 'cmds/templates', file);
    }

    source = fs.readFileSync(templatePath).toString();

    logger.logTemplate(stripHandlebarsNewLine(source), map);
};

logger.registerHelper = function(name, callback) {
    handlebars.registerHelper(name, callback);
};

logger.registerHelpers_ = function() {
    handlebars.registerHelper('date', function(date) {
        return base.getDuration(date);
    });

    handlebars.registerHelper('compareLink', function() {
        return 'https://github.com/' + this.options.user + '/' + this.options.repo +
            '/compare/' + this.options.pullHeadSHA + '...' + this.options.currentSHA;
    });

    handlebars.registerHelper('forwardedLink', function() {
        return 'https://github.com/' + this.options.fwd + '/' + this.options.repo + '/pull/' +
            this.options.forwardedPull;
    });

    handlebars.registerHelper('link', function() {
        return 'https://github.com/' + this.options.user + '/' + this.options.repo + '/pull/' +
            this.options.number;
    });

    handlebars.registerHelper('submittedLink', function() {
        return 'https://github.com/' + this.options.submit + '/' + this.options.repo + '/pull/' +
            this.options.submittedPull;
    });

    handlebars.registerHelper('issueLink', function() {
        return 'https://github.com/' + this.options.user + '/' + this.options.repo + '/issues/' +
            this.options.number;
    });

    handlebars.registerHelper('gistLink', function() {
        return 'https://gist.github.com/' + this.options.loggedUser + '/' + this.options.id;
    });

    handlebars.registerHelper('repoLink', function() {
        return 'https://github.com/' + this.options.user + '/' + this.options.repo;
    });

    handlebars.registerHelper('wordwrap', function(text, padding, stripNewLines) {
        var gutter = '';

        if (stripNewLines !== false) {
            text = text.replace(/[\r\n\s\t]+/g, ' ');
        }

        text = wrap(text).split('\n');

        if (padding > 0) {
            gutter = (new Array(padding)).join(' ');
        }

        return text.join('\n' + clc.cyan('gh') + gutter);
    });

    logger.registerStyles_();
};

logger.registerStyles_ = function() {
    var styleList = [
        'black', 'blackBright',
        'red', 'redBright',
        'green', 'greenBright',
        'yellow', 'yellowBright',
        'blue', 'blueBright',
        'magenta', 'magentaBright',
        'cyan', 'cyanBright',
        'white', 'whiteBright',
        'italic', 'bold', 'underline', 'inverse', 'strike'
    ];

    styleList.forEach(function(style) {
        handlebars.registerHelper(style, function() {
            var args = slice.call(arguments);
            args.pop();

            return clc[style](args.join(''));
        });
    });
};

logger.registerHelpers_();

logger.clc = clc;
module.exports = logger;
