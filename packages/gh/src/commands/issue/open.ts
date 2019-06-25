import Command from '../../base'
import { afterHooks, beforeHooks } from '../../hooks'
import * as logger from '../../logger'
import { getUserRepo } from '../../utils'
import { editIssue, getIssue } from './index'

export default class Open extends Command {
    static aliases = ['i:o', 'issue:o', 'issue:open']

    public static args = [
        {
            name: 'number',
            required: true,
            description: 'Number(s) of the issue.',
            parse: input => input.split(','),
        },
    ]

    public static description = 'Open Issue'

    public static flags = {
        ...Command.flags,
    }

    public async run() {
        const { args } = this.parse(Open)

        await runOpenCmd({ ...this.flags, ...args }).catch(err => logger.error("Can't open issue."))
    }
}

export async function runOpenCmd(flags) {
    await beforeHooks('issue.open', flags)

    for (const number of flags.number) {
        logger.log(`Opening issue ${number} on ${getUserRepo(flags)}`)

        const issue = await getIssue(number, flags)
        const { data } = await editIssue(number, issue.title, 'open', flags)

        logger.log(logger.colors.cyan(data.html_url))
    }

    await afterHooks('issue.open', flags)
}
