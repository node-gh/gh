/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: README.md)
 * SPDX-License-Identifier: BSD-3-Clause
 */

import * as color from 'colors/safe'
import * as fs from 'fs'
import * as handlebars from 'handlebars'
import * as moment from 'moment'
import * as path from 'path'
import * as wordwrap from 'wordwrap'

const testing = process.env.NODE_ENV === 'testing'

if (testing || process.env.COLOR === 'false') {
    color.disable()
}

export const colors = color

const wrap = wordwrap.hard(0, 80)

function stripHandlebarsNewLine(str) {
    return str.replace(/[\s\t\r\n](\{\{[#\/])/g, '$1')
}

export function debug(...args) {
    if (!process.env.GH_VERBOSE) {
        return
    }

    if (typeof args[0] === 'string') {
        args[0] = `DEBUG: ${args[0]}`
        console.log(...args)
        return
    }

    console.log('DEBUG:', ...args)
}

export function insane(...args) {
    if (!process.env.GH_VERBOSE_INSANE) {
        return
    }

    console.log(...args)
}

export function error(...args) {
    if (typeof args[0] === 'string') {
        args[0] = `fatal: ${args[0]}`
    }

    console.error(...args)
    process.exit(1)
}

export function warn(...args) {
    args[0] = `warning: ${args[0]}`
    console.error(...args)
}

export function log(...args) {
    console.log(...args)
}

export function getDuration(start: Date, formatter?): string {
    if (testing) {
        return moment(start).from(new Date('December 17, 2013'))
    }

    if (formatter) {
        return moment(start).format(formatter)
    }

    return moment(start).fromNow()
}

export function applyReplacements(output, replaceMap?: object) {
    var regexPattern

    for (regexPattern in replaceMap) {
        if (replaceMap.hasOwnProperty(regexPattern)) {
            output = output.replace(new RegExp(regexPattern, 'g'), replaceMap[regexPattern])
        }
    }

    return output
}

export function getErrorMessage(err) {
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

export function compileTemplate(source, map) {
    const template = handlebars.compile(source)
    const replacements = applyReplacements(template(map))

    return replacements
}

export function logTemplate(source, map) {
    console.log(compileTemplate(source, map || {}))
}

export function logTemplateFile(file, map) {
    let templatePath
    let source

    templatePath = path.join(file)

    if (!fs.existsSync(templatePath)) {
        templatePath = path.join(__dirname, 'cmds/templates', file)
    }

    source = fs.readFileSync(templatePath).toString()

    logTemplate(stripHandlebarsNewLine(source), map)
}

export function registerHelper(name, callback) {
    handlebars.registerHelper(name, callback)
}

export function registerHelpers_() {
    handlebars.registerHelper('date', date => {
        return getDuration(date)
    })

    handlebars.registerHelper('compareLink', function() {
        const { github_host, user, repo, pullHeadSHA, currentSHA } = this.options

        return `${github_host}/${user}/${repo}/compare/${pullHeadSHA}...${currentSHA}`
    })

    handlebars.registerHelper('forwardedLink', function() {
        const { github_host, fwd, repo, forwardedPull } = this.options

        return `${github_host}/${fwd}/${repo}/pull/${forwardedPull}`
    })

    handlebars.registerHelper('link', function() {
        const { github_host, user, repo, number } = this.options

        return `${github_host}/${user}/${repo}/pull/${number}`
    })

    handlebars.registerHelper('submittedLink', function() {
        const { github_host, submit, repo, submittedPull } = this.options

        return `${github_host}/${submit}/${repo}/pull/${submittedPull}`
    })

    handlebars.registerHelper('issueLink', function() {
        const { github_host, user, repo, number } = this.options

        return `${github_host}/${user}/${repo}/issues/${number}`
    })

    handlebars.registerHelper('gistLink', function() {
        const { github_gist_host, loggedUser, id } = this.options

        return `${github_gist_host}/${loggedUser}/${id}`
    })

    handlebars.registerHelper('repoLink', function() {
        const { github_gist_host, user, repo } = this.options

        return `${github_gist_host}/${user}/${repo}`
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

registerHelpers_()
