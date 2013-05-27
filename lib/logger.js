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
    prefixColor: 'magenta'
});

// -- Helpers

var slice = Array.prototype.slice,
    stripHandlebarsNewLine = function(str) {
        return str.replace(/[\s\t\r\n](\{\{[#\/])/g, '$1');
    };

// -- Methods

logger.applyReplacements = function(output) {
    var config,
        regexPattern;

    config = base.getGlobalConfig();

    for (regexPattern in config.replace) {
        output = output.replace(
            new RegExp(regexPattern, "g"), config.replace[regexPattern]);
    }

    return output;
};

logger.getTemplate = function(file) {
    var templatePath = path.join(__dirname, 'cmds/templates', file),
        source = fs.readFileSync(templatePath).toString();

    return stripHandlebarsNewLine(source);
};

logger.logTemplate = function(source, map) {
    var template;

    template = handlebars.compile(source);
    console.log(logger.applyReplacements(template(map)));
};

logger.logTemplateFile = function(file, map) {
    logger.logTemplate(
        logger.getTemplate(file), map);
};

logger.registerHelpers_ = function() {
    handlebars.registerHelper('date', function(date) {
        return base.getDuration(date);
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