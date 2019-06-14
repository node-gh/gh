import Command from '../../base'
import { afterHooks, beforeHooks } from '../../hooks'
import * as logger from '../../logger'
import { getUserRepo } from '../../utils'
import { editIssue, getIssue } from './index'

export default class Close extends Command {
    static aliases = ['i:c', 'issue:c', 'issue:close']

    public static args = [
        {
            name: 'number',
            required: true,
            description: 'Number(s) of the issue.',
            parse: input => input.split(','),
        },
    ]

    public static description = 'Close Issue'

    public static flags = {
        ...Command.flags,
    }

    public async run() {
        const { args } = this.parse(Close)

        runCloseCmd({ ...this.flags, ...args }).catch(err => logger.error(`Can't close issue.`))
    }
}

export async function runCloseCmd(flags) {
    await beforeHooks('issue.close', flags)

    for (const number of flags.number) {
        logger.log(`Closing issue ${number} on ${getUserRepo(flags)}`)

        const issue = await getIssue(number, flags)
        const { data } = await editIssue(number, issue.title, 'closed', flags)

        logger.log(logger.colors.cyan(data.html_url))
    }

    await afterHooks('issue.close', flags)
}
