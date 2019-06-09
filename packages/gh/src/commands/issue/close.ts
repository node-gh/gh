import Command from '../../base'
import { getGitHubInstance } from '../../github'
import { afterHooks, beforeHooks } from '../../hooks'
import * as logger from '../../logger'
import { editIssue, getIssue, getUserRepo } from '../../utils'

export default class Close extends Command {
    public static args = [
        {
            name: 'number',
            required: true,
            description: 'Number of the issue.',
            parse: input => input.split(','),
        },
    ]

    public static description = 'Close Issue'

    public static flags = {
        ...Command.flags,
    }

    public async run() {
        const { args } = this.parse(Close)

        runCloseCmd({ ...this.flags, ...args })
    }
}

export async function runCloseCmd(flags) {
    const github = await getGitHubInstance()

    await beforeHooks('issue.close', flags)

    for (const number of flags.number) {
        logger.log(`Closing issue ${number} on ${getUserRepo(flags)}`)

        try {
            const issue = await getIssue(github, number, flags)

            var { data } = await editIssue(github, number, issue.title, 'closed', flags)
        } catch (err) {
            throw new Error(`Can't close issue.\n${err}`)
        }

        logger.log(logger.colors.cyan(data.html_url))
    }

    await afterHooks('issue.close', flags)
}
