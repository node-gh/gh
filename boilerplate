import { flags } from '@oclif/command'
import Command from '../../base'
import { getGitHubInstance } from '../../github'
import * as logger from '../../logger'

export const listCmdFlags = {
    all: flags.boolean({ char: 'a', description: 'List all issues' }),
    assignee: flags.string({
        char: 'A',
        description: 'Filter issues by assignee(case sensitive) login id',
    }),
}

export default class List extends Command {
    public static description = 'List & filter issues'

    public static flags = {
        ...Command.flags,
        ...listCmdFlags,
    }

    public async run() {
        runListCmd(this.flags)
    }
}

export async function runListCmd(flags) {
    const github = await getGitHubInstance()

    //
}
