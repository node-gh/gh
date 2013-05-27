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

logger.getTemplate = function(templateName) {
    var templatePath = path.join(__dirname, 'cmds/templates', templateName + '.mustache'),
        source = fs.readFileSync(templatePath).toString();

    return stripHandlebarsNewLine(source);
};

logger.logTemplate = function(templateName, map) {
    var template,
        source = logger.getTemplate(templateName);

    template = handlebars.compile(source);
    console.log(base.applyReplacements(template(map)));
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