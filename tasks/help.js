'use strict';

var clc = require('cli-color'),
    header,
    content;

header = '\nusage: gulp <command>\n\n' +
    'The most commonly used gh tasks are:';

content = {
    'lint': 'Lint code',
    'complexity': 'Show code complexity analysis summary',
    'plato': 'Create advanced code complexity static analysis in HTML',
    'unit': 'Run unit tests and create code coverage report in HTML',
    'test': 'Run all code quality tools',
    'coverage-report': 'Open code coverage report',
    'complexity-report': 'Open code complexity and static analysis report',
    'watch': 'Watch for any changes and run linting and tests'
};

function help() {
    var output = '',
        spacing = 0,
        methods;

    methods = Object.keys(content);

    methods.forEach(function(item) {
        if (spacing < item.length) {
            spacing = item.length + 1;
        }
    });

    methods.forEach(function(item) {
        output += '  ' + clc.cyan(item) +
            new Array(spacing - item.length + 2).join(' ') +
            content[item] + '\n';
    });

    console.log([header, output].join('\n'));
}

module.exports = help;
