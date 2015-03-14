'use strict';

var clc = require('cli-color'),
    header,
    content;

header = '\nusage: gulp <command>\n\n' +
    'The most commonly used gh tasks are:';

content = {
    'help': 'Print this',
    'lint': 'Lint code',
    'complexity': 'Run code complexity analysis and create report',
    'unit': 'Run unit tests and create code coverage report',
    'test': 'Run all code quality tool tests and create ocde complexity analysis and coverage reports',
    'coverage-report': 'Show code coverage summary',
    'complexity-report': 'Show code complexity analysis report',
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
