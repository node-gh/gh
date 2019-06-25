/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: CONTRIBUTORS)
 * SPDX-License-Identifier: BSD-3-Clause
 */

import Command, { flags } from '@oclif/command'

const testing = process.env.NODE_ENV === 'testing'

export default abstract class extends Command {
    public static flags: any = {
        help: flags.help({ char: 'h' }),
        debug: flags.boolean({
            description:
                'A more complete info flag, which leaks more privacy sensitive data by default.',
        }),
        info: flags.boolean({
            description: 'The info flag is useful for basic debugging',
        }),
        remote: flags.string({
            description: 'Override the default_remote setting in ~/.default.gh.json',
        }),
        repo: flags.string({ char: 'r', description: 'The repo to fetch issues from' }),
        user: flags.string({ char: 'u', description: 'The owner of the repository' }),
    }

    public flags
    public remoteInfo

    public async init() {
        const { flags } = this.parse(this.constructor)

        expandAliases()
        this.normalizeOptions()
        this.registerLoggerHelpers()

        if (options.argv.remain.length === 1) {
            return
        }

        return this.configureUser()
            .then(() => {
                if (jiraConfig.base === undefined) {
                    jiraConfig.base = Jira.DEFAULT_JIRA_BASE
                }

                this.api = new RestApiClient(jiraConfig)

                // shortcut if only the browser command was invoked to avoid remote call
                if (
                    options.browser &&
                    lodash.intersection(Jira.DETAILS.commands, Object.keys(options)).length === 1
                ) {
                    return this.browserAction()
                }
                console.log('RIGHT BEFORE RUN')
                return this.runCommands()
            })
            .catch(this.fatalErrorHandler)
    }
}

function expandAliases() {
    var options = this.options

    if (config.alias) {
        options.assignee = config.alias[options.assignee] || options.assignee
    }

    if (options.new && config.alias) {
        options.reporter = config.alias[options.reporter] || options.reporter
    }
}
