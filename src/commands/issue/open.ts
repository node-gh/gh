import { flags } from '@oclif/command'
import Command from '../../base'
import { getGitHubInstance } from '../../github'
import { afterHooks, beforeHooks } from '../../hooks'
import * as logger from '../../logger'
import { getIssue, editIssue, getUserRepo } from '../../utils'

export default class Open extends Command {
    public static args = [
        {
            name: 'number',
            required: true,
            description: 'Number of the issue.',
            parse: input => input.split(','),
        },
    ]

    public static description = 'Open Issue'

    public static flags = {
        ...Command.flags,
    }

    public async run() {
        const { args } = this.parse(Open)

        runOpenCmd({ ...this.flags, ...args })
    }
}

export async function runOpenCmd(flags) {
    const github = await getGitHubInstance()

    await beforeHooks('issue.open', flags)

    for (const number of flags.number) {
        logger.log(`Opening issue ${number} on ${getUserRepo(flags)}`)

        try {
            const issue = await getIssue(github, number, flags)

            var { data } = await editIssue(github, number, issue.title, 'open', flags)
        } catch (err) {
            throw new Error(`Can't open issue.\n${err}`)
        }

        logger.log(logger.colors.cyan(data.html_url))
    }

    await afterHooks('issue.open', flags)
}
