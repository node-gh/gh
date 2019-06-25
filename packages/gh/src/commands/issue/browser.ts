import * as openUrl from 'opn'
import Command from '../../base'
import { afterHooks, beforeHooks } from '../../hooks'
import * as logger from '../../logger'

export default class Browser extends Command {
    public static aliases = ['i:b', 'issue:b', 'issue:browser']

    public static args = [
        {
            name: 'number',
            required: true,
            description: 'Number(s) of the issue.',
            parse: input => input.split(','),
        },
    ]

    public static description = 'Browser & filter issues'

    public static flags = {
        ...Command.flags,
    }

    public async run() {
        const { args } = this.parse(Browser)

        await runBrowserCmd({ ...this.flags, ...args }).catch(err =>
            logger.error(err, 'Error running browser cmd.')
        )
    }
}

export async function runBrowserCmd(flags) {
    await beforeHooks('issue.browser', flags)

    for (const num of flags.number) {
        openUrl(`${flags.github_host}/${flags.user}/${flags.repo}/issues/${num}`, {
            wait: false,
        })
    }

    await afterHooks('issue.browser', flags)
}
