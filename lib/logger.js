/*
 * Copyright 2013 Eduardo Lundgren, All Rights Reserved.
 *
 * Code licensed under the BSD License:
 * https://github.com/eduardolundgren/blob/master/LICENSE.md
 *
 * @author Eduardo Lundgren <eduardolundgren@gmail.com>
 * @author Zeno Rocha <zno.rocha@gmail.com>
 */

var base = require('./base'),
    clc = require('cli-color'),
    cll = require('cli-log'),
    fs = require('fs'),
    handlebars = require('handlebars'),
    path = require('path');

var logger = cll.init({
    prefix: 'gh',
    prefixColor: 'cyan'
});

var slice = Array.prototype.slice,
    stripHandlebarsNewLine = function(str) {
        return str.replace(/[\s\t\r\n](\{\{[#\/])/g, '$1');
    };

logger.applyReplacements = function(output) {
    var config,
        regexPattern;

    config = base.getGlobalConfig();

    for (regexPattern in config.replace) {
        output = output.replace(
            new RegExp(regexPattern, 'g'), config.replace[regexPattern]);
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
    // Normalize github api error
    if (err.message) {
        try {
            return JSON.parse(err.message).message;
        }
        catch(e) {}

        // Normalize git error
        try {
            return err.message.replace('Command failed: fatal: ', '').trim();
        }
        catch(e) {}
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
    var templatePath = path.join(__dirname, 'cmds/templates', file),
        source = fs.readFileSync(templatePath).toString();

    logger.logTemplate(
        stripHandlebarsNewLine(source), map);
};

logger.registerHelpers_ = function() {
    handlebars.registerHelper('date', function(date) {
        return base.getDuration(date);
    });

    handlebars.registerHelper('link', function() {
        return 'http://github.com/' + this.options.user + '/' + this.options.repo + '/pull/' + this.options.number;
    });

    handlebars.registerHelper('forwardedLink', function() {
        return 'http://github.com/' + this.options.fwd + '/' + this.options.repo + '/pull/' + this.options.forwardedPull;
    });

    handlebars.registerHelper('submittedLink', function() {
        return 'http://github.com/' + this.options.submit + '/' + this.options.repo + '/pull/' + this.options.submittedPull;
    });

    handlebars.registerHelper('issueLink', function() {
        return 'http://github.com/' + this.options.user + '/' + this.options.repo + '/issues/' + this.options.number;
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

module.exports = logger;