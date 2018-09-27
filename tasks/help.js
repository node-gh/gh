/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: CONTRIBUTORS)
 * SPDX-License-Identifier: BSD-3-Clause
 */

'use strict'

var colors = require('colors'),
    header,
    content

header = '\nusage: gulp <command>\n\n' + 'The most commonly used gh tasks are:'

content = {
    complexity: 'Show code complexity analysis summary',
    plato: 'Create advanced code complexity static analysis in HTML',
    unit: 'Run unit tests and create code coverage report in HTML',
    test: 'Run all code quality tools',
    'coverage-report': 'Open code coverage report',
    'plato-report': 'Open code complexity and static analysis report',
    'ci-reports': 'Open CI reports page',
}

function help(done) {
    var output = '',
        spacing = 0,
        methods

    methods = Object.keys(content)

    methods.forEach(function(item) {
        if (spacing < item.length) {
            spacing = item.length + 1
        }
    })

    methods.forEach(function(item) {
        output +=
            '  ' +
            colors.cyan(item) +
            new Array(spacing - item.length + 2).join(' ') +
            content[item] +
            '\n'
    })

    console.log([header, output].join('\n'))

    done()
}

module.exports = help
