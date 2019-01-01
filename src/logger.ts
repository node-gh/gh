/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: CONTRIBUTORS)
 * SPDX-License-Identifier: BSD-3-Clause
 */

let logger: any = {}

import * as fs from 'fs'
import * as handlebars from 'handlebars'
import * as moment from 'moment'
import * as path from 'path'
import * as wordwrap from 'wordwrap'
import * as colors from 'colors/safe'
import * as _ from 'lodash'

const wrap = wordwrap.hard(0, 80)

function stripHandlebarsNewLine(str) {
    return str.replace(/[\s\t\r\n](\{\{[#\/])/g, '$1')
}

logger.debug = function() {
    if (!process.env.GH_VERBOSE) {
        return
    }

    if (typeof arguments[0] === 'string') {
        arguments[0] = `DEBUG: ${arguments[0]}`
        console.log.apply(this, arguments)
        return
    }

    console.log('DEBUG:')
    console.log.apply(this, arguments)
}

logger.insane = function() {
    if (!process.env.GH_VERBOSE_INSANE) {
        return
    }

    console.log.apply(this, arguments)
}

logger.error = function() {
    if (typeof arguments[0] === 'string') {
        arguments[0] = `fatal: ${arguments[0]}`
    }

    console.error.apply(this, arguments)
    process.exit(1)
}

logger.warn = function() {
    arguments[0] = `warning: ${arguments[0]}`
    console.error.apply(this, arguments)
}

logger.log = function() {
    console.log.apply(this, arguments)
}

logger.getDuration = function(start, opt_end) {
    if (opt_end === undefined) {
        opt_end = Date.now()
    }

    return moment.duration(moment(start).diff(opt_end)).humanize(true)
}

logger.applyReplacements = function(output, replaceMap) {
    var regexPattern

    for (regexPattern in replaceMap) {
        if (replaceMap.hasOwnProperty(regexPattern)) {
            output = output.replace(new RegExp(regexPattern, 'g'), replaceMap[regexPattern])
        }
    }

    return output
}

logger.getErrorMessage = function(err) {
    var msg

    // General normalizer
    if (!err) {
        return 'No error message.'
    }

    if (err.errors) {
        return err.errors
    }

    // Normalize github api error
    if (!err.message) {
        return err
    }

    try {
        msg = JSON.parse(err.message)
    } catch (e) {
        return err.message
    }

    if (typeof msg === 'string') {
        return msg
    }

    if (msg.errors && msg.errors[0] && msg.errors[0].message) {
        return msg.errors[0].message
    }

    if (msg.message) {
        return msg.message
    }

    // Normalize git error
    return err.message.replace('Command failed: fatal: ', '').trim()
}

logger.compileTemplate = function(source, map) {
    var template = handlebars.compile(source)

    return logger.applyReplacements(template(map))
}

logger.logTemplate = function(source, map) {
    console.log(logger.compileTemplate(source, map || {}))
}

logger.logTemplateFile = function(file, map) {
    let templatePath
    let source

    templatePath = path.join(file)

    if (!fs.existsSync(templatePath)) {
        templatePath = path.join(__dirname, 'cmds/templates', file)
    }

    source = fs.readFileSync(templatePath).toString()

    logger.logTemplate(stripHandlebarsNewLine(source), map)
}

logger.registerHelper = function(name, callback) {
    handlebars.registerHelper(name, callback)
}

logger.registerHelpers_ = function() {
    handlebars.registerHelper('date', date => {
        return logger.getDuration(date)
    })

    handlebars.registerHelper('compareLink', function() {
        const { github_host, user, repo, pullHeadSHA, currentSHA } = this.options

        return `${github_host}${user}/${repo}/compare/${pullHeadSHA}...${currentSHA}`
    })

    handlebars.registerHelper('forwardedLink', function() {
        const { github_host, fwd, repo, forwardedPull } = this.options

        return `${github_host}${fwd}/${repo}/pull/${forwardedPull}`
    })

    handlebars.registerHelper('link', function() {
        const { github_host, user, repo, number } = this.options

        return `${github_host}${user}/${repo}/pull/${number}`
    })

    handlebars.registerHelper('submittedLink', function() {
        const { github_host, submit, repo, submittedPull } = this.options

        return `${github_host}${submit}/${repo}/pull/${submittedPull}`
    })

    handlebars.registerHelper('issueLink', function() {
        const { github_host, user, repo, number } = this.options

        return `${github_host}${user}/${repo}/issues/${number}`
    })

    handlebars.registerHelper('gistLink', function() {
        const { github_gist_host, loggedUser, id } = this.options

        return `${github_gist_host}${loggedUser}/${id}`
    })

    handlebars.registerHelper('repoLink', function() {
        const { github_gist_host, user, repo } = this.options

        return `${github_gist_host}${user}/${repo}`
    })

    handlebars.registerHelper('wordwrap', (text, padding, stripNewLines) => {
        let gutter = ''

        if (stripNewLines !== false) {
            text = text.replace(/[\r\n\s\t]+/g, ' ')
        }

        text = wrap(text).split('\n')

        if (padding > 0) {
            gutter = ' '.repeat(padding)
        }

        return text.join(`\n${gutter}`)
    })
}

logger.registerHelpers_()

logger.colors = colors

if (process.argv.indexOf('--no-color') !== -1 || process.env.NODE_ENV === 'testing') {
    logger.colors = _.reduce(
        _.keys(logger.colors.styles),
        (memo, color) => {
            memo[color] = function returnValue(value) {
                return value
            }

            return memo
        },
        {}
    )
}

export default logger
