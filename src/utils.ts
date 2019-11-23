/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: README.md)
 * SPDX-License-Identifier: BSD-3-Clause
 */

import * as tmp from 'tmp'
import * as open from 'opn'
import { spawnSync, execSyncInteractiveStream } from './exec'
import { readFileSync, writeFileSync } from 'fs'
import * as logger from './logger'
import * as inquirer from 'inquirer'

const testing = process.env.NODE_ENV === 'testing'

export async function handlePagination({ options, listEndpoint, payload }) {
    let hasNextPage = false

    try {
        // If no pageSize, assume user removed limit and fetch all prs
        var data = await (options.allPages
            ? options.GitHub.paginate(listEndpoint.endpoint.merge(payload))
            : listEndpoint(payload))

        hasNextPage = data.headers && data.headers.link && data.headers.link.includes('rel="next"')

        data = data.data || data
    } catch (err) {
        if (err && err.status === '404') {
            // Some times a repo is found, but you can't list its prs
            // Due to the repo being disabled (e.g., private repo with debt)
            logger.warn(`Can't list pull requests for ${options.user}/${options.repo}`)
        } else {
            throw new Error(`Error listing data\n${err}`)
        }
    }

    return {
        data,
        hasNextPage,
    }
}

/**
 * Opens url in browser
 */
export function openUrl(url) {
    testing ? console.log(url) : open(url, { wait: false })
}

/**
 * Checks if string has been merged with a common flag or is empty
 */
export function userLeftMsgEmpty(string: string): boolean {
    return (
        !string ||
        string === '--title' ||
        string === '-t' ||
        string === '--message' ||
        string === '-m' ||
        string === '--comment' ||
        string === '-c' ||
        string === '--description' ||
        string === '-D'
    )
}

/**
 * Allows users to add text from their editor of choice rather than the terminal
 *
 * @example
 *   openFileInEditor('temp-gh-issue-title.txt', '# Add a pr title msg on the next line')
 */
export function openFileInEditor(fileName: string, msg: string): string {
    try {
        var { name: filePath, removeCallback } = tmp.fileSync({ postfix: `-${fileName}` })

        writeFileSync(filePath, msg)

        const editor = process.env.EDITOR
            ? process.env.EDITOR
            : process.env.VISUAL
            ? process.env.VISUAL
            : spawnSync('git', ['config', '--global', 'core.editor']).stdout

        if (!editor) {
            throw new Error('Could not determine which editor to use')
        }

        execSyncInteractiveStream(`${editor} "${filePath}"`)

        const newFileContents = readFileSync(filePath).toString()

        const commentMark = fileName.endsWith('.md') ? '<!--' : '#'

        removeCallback()

        return cleanFileContents(newFileContents, commentMark)
    } catch (err) {
        logger.error('Could not use your editor to store a custom message\n', err)
    }
}

/**
 * Removes # comments and trims new lines
 * @param {string} commentMark - refers to the comment mark which is different for each file
 */
export function cleanFileContents(fileContents: string, commentMark = '#'): string {
    return fileContents
        .split('\n')
        .filter(line => !line.startsWith(commentMark))
        .join('\n')
        .trim()
}

export function getCurrentFolderName(): string {
    const cwdArr = process
        .cwd()
        .toString()
        .split('/')

    return cwdArr[cwdArr.length - 1]
}

/**
 * Checks to see if the cli arguments are one of the accepted flags
 */
export function userRanValidFlags(commands, options) {
    if (commands) {
        return commands.some(c => {
            return options[c] !== undefined
        })
    }

    return false
}

export async function askUserToPaginate(type: string): Promise<boolean> {
    logger.log('\n')

    const answers = await inquirer.prompt([
        {
            type: 'confirm',
            message: `Would you like to see the next batch of ${type}`,
            name: 'paginate',
        },
    ])

    logger.log('\n')

    return answers.paginate
}
