import { forEach } from 'lodash'
import Command from '../../base'
import { github } from '../../github'
import { IFlags } from '../../interfaces'
// import { runCommentCmd } from './comment'
import { runBrowserCmd } from './browser'
// import { newCmdFlags, runNewCmd } from './new'
import { listCmdFlags, runListCmd } from './list'

export default class Issue extends Command {
    static aliases = ['i', 'issue']

    public static args = [
        {
            name: 'number_or_title',
            required: false,
            description:
                'Number of the issue you would like to target OR the text message of a new issue',
        },
        {
            name: 'comment_or_body',
            required: false,
            description:
                'Comment message you would like to add to the issue OR the body message of a new issue',
        },
    ]

    public static description = 'List, Create & Modify issues'

    public static flags = generateFlags()

    public async run() {
        const { args } = this.parse(Issue)
        const flags = this.flags

        const isShortcutForBrowser =
            args.number_or_title &&
            !isNaN(args.number_or_title.split(',')[0]) &&
            !args.comment_or_body
        // const isShortcutForComment = Number(args.number_or_title) && args.comment_or_body
        const isShorcutForListIssues = !args.number_or_title && !args.comment_or_body
        // const isShorcutForNewIssue = !Number(args.number_or_title) && args.comment_or_body

        if (isShortcutForBrowser) {
            await runBrowserCmd({ ...this.flags, number: args.number_or_title.split(',') })
        } else if (isShorcutForListIssues) {
            await runListCmd(flags)
        }
        // else if (isShorcutForNewIssue) {
        //   const adjustedFlags = {
        //     ...flags,
        //     title: args.number_or_title,
        //     message: args.comment_or_body,
        //   }

        //   runNewCmd(adjustedFlags, this.remoteInfo)
        // }
    }
}

function generateFlags() {
    const flagsArr = [
        { flags: { ...Command.flags }, namespace: 'global' },
        { flags: { ...listCmdFlags }, namespace: 'issue:list' },
        // { flags: { ...newCmdFlags }, namespace: 'issue:new' },
    ]

    return flagsArr.reduce((previousFlags, currentFlags) => {
        const { flags } = currentFlags

        let allFlags = { ...previousFlags }

        forEach(flags, (flag: IFlags, key) => {
            let description = `\`${currentFlags.namespace}\` --> ${flag.description}`

            if (previousFlags.hasOwnProperty(key)) {
                description = `${previousFlags[key].description}\n ${description}`
            }

            allFlags[key] = {
                ...flag,
                description,
            }
        })

        return allFlags
    }, {})
}

export function getIssue(number, flags) {
    const payload = {
        issue_number: number,
        repo: flags.repo,
        owner: flags.user,
    }

    return github('issues.get', payload)
}

export function editIssue(number, title, state, flags) {
    const payload = {
        state,
        title,
        assignee: flags.assignee,
        labels: flags.labels || [],
        milestone: flags.milestone,
        issue_number: number,
        owner: flags.user,
        repo: flags.repo,
    }

    return github('issues.update', payload)
}
