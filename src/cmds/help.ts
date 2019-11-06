/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: README.md)
 * SPDX-License-Identifier: BSD-3-Clause
 */

// -- Requires -------------------------------------------------------------------------------------

import * as path from 'path'
import * as stream from 'stream'
import * as url from 'url'
import * as base from '../base'
import * as configs from '../configs'
import * as logger from '../logger'

// -- Constants ------------------------------------------------------------------------------------

export const name = 'Help'
export const DETAILS = {
    description: 'List all commands and options available.',
    options: {
        all: Boolean,
        help: Boolean,
    },
    shorthands: {
        a: ['--all'],
        h: ['--help'],
    },
}

// -- Commands -------------------------------------------------------------------------------------

export async function run(options, done) {
    const cmdDir = path.join(__dirname, '../cmds/')
    const files = (await base.find(cmdDir).promise()).filter(
        name => !name.includes('help') && !name.includes('version') && !name.includes('.map')
    )

    // Get external plugins
    const plugins = configs.getPlugins()

    plugins.forEach(plugin => {
        try {
            files.push(configs.getPluginPath(plugin).value)
        } catch (e) {
            logger.warn(`Can't get ${plugin} plugin path.`)
        }
    })

    let filter = options.argv.remain[0]

    if (filter === 'help') {
        filter = options.argv.remain[1]
    }

    const commands = await Promise.all(
        files.map(async fileName => {
            let cmd = await import(path.resolve(cmdDir, fileName))

            let flags = []

            if (cmd.Impl) {
                cmd = cmd.Impl
            }

            const alias = cmd.DETAILS.alias || ''
            const name = path
                .basename(fileName)
                .replace(/^gh-/, '')
                .replace(/\..*/, '')

            let offset = 20 - alias.length - name.length

            if (offset < 1) {
                offset = 1
            }

            if (offset !== 1 && alias.length === 0) {
                offset += 2
            }

            if (filter && filter !== alias && filter !== name) {
                return
            }

            if (filter || options.all) {
                flags = groupOptions_(cmd.DETAILS)
                offset = 1
            }

            return {
                alias,
                flags,
                name,
                description: cmd.DETAILS.description,
                offset: ' '.repeat(offset + 1),
            }
        })
    )

    if (filter && commands.length === 0) {
        throw new Error(`No manual entry for ${filter}`)
    }

    logger.log(listCommands_(commands))

    done && done()
}

function listFlags_(command) {
    const flags = command.flags
    let content = ''

    flags.forEach(flag => {
        content += '    '

        if (flag.shorthand) {
            content += `-${flag.shorthand}, `
        }

        content += `--${flag.option}`

        if (flag.cmd) {
            content += '*'
        }

        if (flag.type) {
            content += logger.colors.cyan(` (${flag.type})`)
        }

        content += '\n'
    })

    if (flags.length !== 0) {
        content += '\n'
    }

    return content
}

function listCommands_(commands) {
    let content = 'usage: gh <command> [--flags] [--verbose] [--no-color] [--no-hooks]\n\n'

    content += 'List of available commands:\n'

    commands.forEach(command => {
        if (command && command.hasOwnProperty('alias')) {
            content += '  '

            content += `${logger.colors.magenta(command.alias)}, `

            content += `${logger.colors.magenta(command.name)}${command.offset}${
                command.description
            }\n`

            content += listFlags_(command)
        }
    })

    content += `\n(*) Flags that can execute an action.\n'gh help' lists available commands.\n'gh help -a' lists all available subcommands.`

    return content
}

function groupOptions_(details) {
    let cmd
    let options
    let shorthands
    let grouped = []

    options = Object.keys(details.options)
    shorthands = Object.keys(details.shorthands)

    options.forEach(option => {
        let foundShorthand
        let type

        shorthands.forEach(shorthand => {
            var shorthandValue = details.shorthands[shorthand][0]

            if (shorthandValue === `--${option}`) {
                foundShorthand = shorthand
            }
        })

        cmd = isCommand_(details, option)
        type = getType_(details.options[option])

        grouped.push({
            cmd,
            option,
            type,
            shorthand: foundShorthand,
        })
    })

    return grouped
}

function getType_(type) {
    let types
    const separator = ', '

    if (Array.isArray(type)) {
        types = type

        // Iterative options have an Array reference as the last type
        // e.g. [String, Array], [Boolean, Number, Array], [.., Array]
        if (type[type.length - 1] === Array) {
            type.pop()
        }

        type = ''

        types.forEach(eachType => {
            type += getType_(eachType) + separator
        })

        type = type.substr(0, type.length - separator.length)

        return type
    }

    switch (type) {
        case String:
            type = 'String'
            break
        case url:
            type = 'Url'
            break
        case Number:
            type = 'Number'
            break
        case path:
            type = 'Path'
            break
        case stream.Stream:
            type = 'Stream'
            break
        case Date:
            type = 'Date'
            break
        case Boolean:
            type = 'Boolean'
            break
    }

    return type
}

function isCommand_(details, option) {
    if (details.commands && details.commands.indexOf(option) > -1) {
        return true
    }

    return false
}
