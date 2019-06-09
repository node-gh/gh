#!/usr/bin/env node

'use strict'

/*
 * Copyright 2013, All Rights Reserved.
 *
 * Code licensed under the BSD License:
 * https://github.com/node-gh/gh/blob/master/LICENSE.md
 *
 * @author Eduardo Lundgren <edu@rdo.io>
 */

var GH_PATH = process.env.GH_PATH

var crypto = require('crypto')
var base = require(GH_PATH + 'lib/base')
var git = require(GH_PATH + 'lib/git')
var inquirer = require('inquirer')
var lodash = require('lodash')
var logger = require(GH_PATH + 'lib/logger')
var github = require(GH_PATH + 'lib/github')
var openUrl = require('opn')
var url = require('url')
var config = base.getConfig(true)
var RestApiClient = require(GH_PATH + 'lib/rest-api-client')
var jiraConfig = config.plugins.jira

class Jira {
    constructor(options) {
        this.options = options
    }

    run() {
        var options = this.options

        const payload = options.argv.remain && options.argv.remain.concat().slice(1)

        if (lodash.intersection(Jira.DETAILS.commands, Object.keys(options)).length === 0) {
            options.transition = payload[1] || true
        }

        this.expandAliases()
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

    setIssueNumber(branch, repo, options) {
        var issue

        if (!repo) {
            return
        }

        // First, try to extract the issue number from the optional branch name
        if (branch) {
            issue = this.getIssueNumberFromText(branch)
        }

        // If number was not found yet, try to extract from the current branch name
        if (!issue) {
            issue = this.getIssueNumberFromText(git.getCurrentBranch())
        }

        // If number was not found yet, use only the first commit message to
        // try to infer the issue number.
        if (!issue || config.plugins.jira.inferFromCommitTitle) {
            issue = this.getIssueNumberFromText(git.getCommitMessage(branch, 1))
        }

        // Try to extract the project name from the found number.
        if (issue) {
            options.project = this.getProjectName(options.jiraNumber)
            options.jiraNumber = issue
            console.log('issue', issue)
        }

        // If project was not found, use the last five commit messages to infer the project name.
        if (!options.project) {
            options.project = this.getProjectName(
                this.getIssueNumberFromText(git.getCommitMessage(branch, 5))
            )
        }
    }

    getIssueNumberFromText(text) {
        if (!text) {
            return
        }

        // Try uppercase sequence first, e.g. FOO-123.
        // If not found, try case-insensitive sequence, e.g. foo-123.
        let match = text.match(/[A-Z]{2,}-\d+/) || text.match(/[a-z]{2,}-\d+/i)

        if (match) {
            return match[0].toUpperCase()
        }
    }

    getProjectName(number) {
        if (number) {
            return number.substring(0, number.indexOf('-'))
        }
    }

    decryptText(text) {
        var decipher = crypto.createDecipher(Jira.CRYPTO_ALGORITHM, Jira.CRYPTO_PASSWORD)
        return decipher.update(text, 'hex', 'utf8') + decipher.final('utf8')
    }

    searchUsers(query) {
        console.log('THIS', this.api)

        return this.api
            .get('/user/search', {
                qs: {
                    username: query,
                },
            })
            .then(response => {
                let users = response.body

                if (!users || users.length === 0) {
                    throw Jira.USERS_NOT_FOUND_ERROR
                }

                return users
            })
            .catch(err => {
                throw new Error(`Error searching users on Jira\n${JSON.stringify(err)}`)
            })
    }

    searchGithubUser(query) {
        return new Promise((resolve, reject) => {
            github.getGitHubInstance().then(GitHub => {
                GitHub.search.users({ q: query }, (err, data) => {
                    if (err) {
                        reject(err)
                        return
                    }
                    resolve(data)
                })
            })
        })
    }

    searchUserByGitHubUsername(query) {
        return new Promise((resolve, reject) => {
            this.searchUsers(query)
                .then(users => {
                    resolve(users)
                })
                .catch(err => {
                    logger.debug(query + ' was not found on Jira. Trying GitHub.')

                    if (err !== Jira.USERS_NOT_FOUND_ERROR) {
                        reject(err)
                    }
                    return this.searchGithubUser(query)
                        .then(user => {
                            resolve(this.searchUsers(user.name))
                        })
                        .catch(error => {
                            reject(error)
                        })
                })
        })
    }

    configureUser() {
        if (!jiraConfig.host || !jiraConfig.user || !jiraConfig.password) {
            logger.warn('Jira plugin not configured yet.')
            return this.login()
        }

        jiraConfig.password = this.decryptText(jiraConfig.password)
        return Promise.resolve()
    }

    findAssigneeByGitHubUsername(user) {
        return this.searchUserByGitHubUsername(user)
            .then(users => {
                if (users.length === 1) {
                    return users[0].name
                }

                return this.selectUserWithQuestion(users)
            })
            .catch(error => {
                logger.warn('Not found any user when looking for ' + user)
                logger.error(error)
            })
    }

    fatalErrorHandler(error) {
        if (error instanceof Error) {
            throw new Error(`FATAL:\n${JSON.stringify(error, null, 4)}`)
        }

        if (!error || !error.response) {
            logger.error(error)
        }

        try {
            let body = error.response.body

            if (body.errorMessages.length) {
                console.error('JIRA API error messages:')
            }

            body.errorMessages.forEach(msg => {
                console.error(msg)
            })

            if (Object.keys(body.errors).length) {
                console.error('JIRA API errors:')
            }

            lodash.forEach(body.errors, (msg, errorKey) => {
                console.error(errorKey + ': ' + msg)
            })

            if (error.error) {
                logger.error(error.error)
            }
        } catch (err) {
            logger.error(error)
            throw new Error(`Fatal\n${err}`)
        }
    }

    setAssigneeByGitHubUsername() {
        var options = this.options

        if (options.assignee === null) {
            return Promise.resolve()
        }

        return this.findAssigneeByGitHubUsername(options.assignee).then(assignee => {
            options.assignee = assignee
        })
    }

    runCommands() {
        return this.setAssigneeByGitHubUsername().then(() => {
            return [
                'new',
                'update',
                'transition',
                'assign',
                'comment',
                'label',
                'browser',
                'status',
            ].reduce((promise, item) => {
                return promise.then(() => {
                    return this.callActionIfExists(item)
                })
            }, Promise.resolve())
        })
    }

    callActionIfExists(item) {
        if (this.options[item]) {
            return this[item + 'Action']()
        }
    }

    browserAction() {
        openUrl(this.getIssueUrl(this.options.jiraNumber), { wait: false })
        return Promise.resolve()
    }

    assignAction() {
        var options = this.options
        let assignee = options.assignee

        if (options.unassign) {
            assignee = null
        }

        return this.api
            .put('/issue/' + this.api.encode(options.jiraNumber) + '/assignee', {
                body: {
                    name: assignee,
                },
            })
            .then(response => {
                if (response.statusCode !== 204) {
                    logger.error("Can't assign issue (status code " + response.statusCode + ')')
                }

                logger.log(assignee ? 'Issue assigned to ' + assignee : 'Issue unassigned.')
                logger.log(this.getIssueUrl(options.jiraNumber))
            })
    }

    getUpdatePayload() {
        var options = this.options
        var payload = { fields: {} }

        return this.getIssueEditMeta(options.jiraNumber).then(meta => {
            if (options.project && options.project !== payload.fields.project.key) {
                // https://confluence.atlassian.com/jira/moving-an-issue-185729549.html
                logger.warn('To move a Jira issue to another project you must use its web GUI.')
            }

            lodash.forEach(meta.fieldsMeta, (field, type) => {
                if (field.required) {
                    payload.fields[type] = meta.fields[type]
                }

                let fieldValue = this.findFieldValue(type, options[type], field)

                if (options[type] !== undefined && fieldValue) {
                    payload.fields[type] = fieldValue
                } else if (field.name === 'Git Pull Request') {
                    payload.fields[type] = options.submittedLink
                }
            })

            logger.debug('Payload for update')
            logger.debug(JSON.stringify(payload, ' ', 4))
            return payload
        })
    }

    getCreatePayload() {
        var options = this.options
        var meta
        var payload = { fields: {} }

        return this.getNewIssueMeta(options.project, options.issuetype)
            .then(data => {
                meta = data
                return this.openFieldQuestions(meta.fieldsMeta, payload)
            })
            .then(() => {
                if (meta.issueTypeId) {
                    payload.fields.issuetype = {
                        id: meta.issueTypeId,
                    }
                }

                if (meta.projectId) {
                    payload.fields.project = {
                        id: meta.projectId,
                    }
                }

                logger.debug('Payload for create')
                logger.debug(JSON.stringify(payload, ' ', 4))

                return payload
            })
    }

    newAction() {
        var options = this.options

        if (!options.project) {
            logger.error('Project name argument is missing.')
        }

        logger.log('Creating a new issue on project ' + options.project)

        return this.getCreatePayload()
            .then(issue => {
                return this.api.post('/issue', {
                    body: issue,
                })
            })
            .then(response => {
                let issue = response.body
                options.jiraNumber = issue.key
                logger.log(this.getIssueUrl(options.jiraNumber))
            })
    }

    updateAction() {
        var options = this.options

        logger.log('Updating JIRA issue ' + options.jiraNumber)

        return this.getUpdatePayload()
            .then(payload => {
                return this.api.put('/issue/' + this.api.encode(options.number), {
                    body: payload,
                })
            })
            .then(() => {
                logger.log(this.getIssueUrl(options.jiraNumber))
            })
    }

    getIssue(number) {
        return this.api.get('/issue/' + this.api.encode(number))
    }

    getStatus(number) {
        return this.api
            .get('/issue/' + this.api.encode(number), {
                qs: {
                    fields: 'status',
                },
            })
            .then(response => {
                return response.body.fields.status.name
            })
            .catch(err => {
                logger.debug(query + ' was not found on Jira.')
            })
    }

    comment(jiraNumber, comment) {
        return this.getIssue(jiraNumber)
            .then(response => {
                let issue = response.body
                comment = this.expandComment(logger.applyReplacements(comment))

                return this.api.post('/issue/' + this.api.encode(issue.id) + '/comment', {
                    body: {
                        body: comment,
                    },
                })
            })
            .then(comment => {
                logger.log(this.getIssueUrl(jiraNumber))
                return comment
            })
    }

    label(jiraNumber, label) {
        return this.getIssue(jiraNumber)
            .then(response => {
                let issue = response.body
                return this.api.put('/issue/' + this.api.encode(issue.id), {
                    body: {
                        update: {
                            labels: [
                                {
                                    add: label,
                                },
                            ],
                        },
                    },
                })
            })
            .then(result => {
                logger.log(this.getIssueUrl(jiraNumber))
                return result
            })
    }

    transitionSelector(issue) {
        var options = this.options

        let assignToSomeone = Jira.ASSIGN_TO_SOMEONE_MESSAGE + ' ' + options.assignee
        let choices = [Jira.CANCEL_MESSAGE]
        let transitions = issue.transitions

        if (options.assignee && options.assignee !== jiraConfig.user) {
            choices.push(assignToSomeone)
        }

        choices.push(
            Jira.ASSIGN_TO_ME_MESSAGE,
            Jira.OPEN_ISSUE_IN_BROWSER_MESSAGE,
            new inquirer.Separator()
        )

        transitions.forEach(val => {
            choices.push(val.name)
        })

        let promptOptions = [
            {
                choices: choices,
                message: issue.key + ' ' + issue.fields.summary,
                name: 'transition',
                type: 'list',
            },
        ]

        return new Promise(resolve => {
            inquirer.prompt(promptOptions, answers => {
                let transition

                if (answers.transition === assignToSomeone) {
                    options.assign = true
                }

                if (answers.transition === Jira.ASSIGN_TO_ME_MESSAGE) {
                    options.assign = true
                    options.assignee = jiraConfig.user
                }

                if (answers.transition === Jira.OPEN_ISSUE_IN_BROWSER_MESSAGE) {
                    options.browser = true
                }

                if (answers.transition !== Jira.CANCEL_MESSAGE) {
                    transition = lodash.findWhere(transitions, {
                        name: answers.transition,
                    })

                    if (transition) {
                        options.transition = transition.name
                    }
                }

                resolve(issue)
            })
        })
    }

    findFieldValueSingle(type, value, field) {
        if (field.allowedValues) {
            let option = lodash.findWhere(field.allowedValues, {
                name: value,
            })

            if (!option && value !== undefined && type !== 'project') {
                logger.warn('Ignoring unallowed value ' + value + ' for ' + field.name)
            }

            return option
        }

        if (field.schema.type === 'string') {
            return value
        }

        return {
            name: value,
        }
    }

    findFieldValue(type, value, field) {
        if (value && field.schema.type === 'array') {
            let res = []
            value = value.split(',').map(x => {
                return x.trim()
            })

            value.forEach(v => {
                let s = this.findFieldValueSingle(type, v, field)

                if (s) {
                    res.push(s)
                }
            })

            return res
        }

        return this.findFieldValueSingle(type, value, field)
    }

    compileObjectValuesTemplate(o) {
        var options = this.options
        let value = JSON.stringify(o)

        value = logger.compileTemplate(value, {
            jira: jiraConfig,
            options: options,
        })

        return JSON.parse(value)
    }

    openFieldQuestions(fields, payload) {
        var operations = []
        var options = this.options
        var transitionConfig = jiraConfig.transition[options.transition]

        if (transitionConfig) {
            transitionConfig = this.compileObjectValuesTemplate(transitionConfig)
        }

        lodash.forEach(fields, (field, type) => {
            let configValue = transitionConfig && transitionConfig[field.name]

            if (configValue !== undefined && configValue !== true) {
                payload.fields[type] = configValue
                return
            }

            let fieldValue = this.findFieldValue(type, options[type], field)

            if (options[type] !== undefined && fieldValue) {
                payload.fields[type] = fieldValue
                return
            }

            if (type === 'project' || (!field.required && configValue !== true)) {
                return
            }

            let question = {
                message: field.name + ':',
                name: 'fieldName',
            }

            if (field.allowedValues) {
                question.type = 'list'
                question.choices = field.allowedValues
                question.message = 'Select the ' + question.message
            }

            logger.debug('Trying to add value for:')
            logger.debug(field)

            operations.push(() => {
                return new Promise(resolve => {
                    inquirer.prompt([question], answers => {
                        fieldValue = this.findFieldValue(type, answers.fieldName, field)
                        payload.fields[type] = fieldValue
                        resolve()
                    })
                })
            })
        })

        return operations.reduce((promise, item) => {
            return promise.then(item)
        }, Promise.resolve())
    }

    expandTransitionFields(transition, payload) {
        var options = this.options

        return this.api
            .get('/issue/' + this.api.encode(options.number) + '/transitions', {
                qs: {
                    expand: 'transitions.fields',
                    transitionId: transition.id,
                },
            })
            .then(response => {
                let body = response.body
                let fields = body.transitions[0].fields

                return this.openFieldQuestions(fields, payload)
            })
    }

    getTransitionPayload(issue) {
        var options = this.options
        var message = options.message

        var transition = lodash.findWhere(issue.transitions, {
            name: options.transition,
        })

        if (!transition) {
            throw "Can't transition to " + options.transition + '.'
        }

        var payload = {
            update: {},
            fields: {},
            transition: {
                id: transition.id,
            },
        }

        if (message) {
            message = this.expandComment(logger.applyReplacements(options.message))

            payload.update.comment = [
                {
                    add: {
                        body: message,
                    },
                },
            ]
        }

        return this.expandTransitionFields(transition, payload).then(() => {
            logger.debug('Payload for transition')
            logger.debug(JSON.stringify(payload, ' ', 4))
            return payload
        })
    }

    continueTransition(issue) {
        var options = this.options

        logger.log('Transitioning issue ' + options.jiraNumber + ' to ' + options.transition)

        return this.getTransitionPayload(issue)
            .then(payload => {
                return this.api.post(
                    '/issue/' + this.api.encode(options.jiraNumber) + '/transitions',
                    {
                        body: payload,
                    }
                )
            })
            .then(() => {
                logger.log(this.getIssueUrl(options.jiraNumber))
            })
    }

    transitionAction() {
        var options = this.options
        let issue

        if (!options.jiraNumber) {
            return Promise.reject('Skipping JIRA transition, issue number not specified.')
        }
        console.log('!!!!!!!!!!!!!!')
        return this.api
            .get('/issue/' + this.api.encode(options.number), {
                qs: {
                    expand: 'transitions',
                },
            })
            .then(response => {
                issue = response.body

                if (String(options.transition) === 'true') {
                    options.transition = undefined
                    return this.transitionSelector(issue)
                }
            })
            .then(() => {
                if (options.transition) {
                    return this.continueTransition(issue)
                }
            })
    }

    commentAction() {
        var options = this.options
        logger.log('Adding comment on issue ' + logger.colors.green('#' + options.jiraNumber))
        return this.comment(options.jiraNumber, options.comment)
    }

    labelAction() {
        var options = this.options
        logger.log(
            'Adding label ' +
                options.label +
                ' to issue ' +
                logger.colors.green('#' + options.jiraNumber)
        )
        return this.label(options.jiraNumber, options.label)
    }

    statusAction() {
        var options = this.options
        this.getStatus(options.jiraNumber).then(status => {
            logger.log(
                'Status of issue ' + logger.colors.green('#' + options.jiraNumber) + ' => ' + status
            )
        })
    }

    encryptText(text) {
        var cipher = crypto.createCipher(Jira.CRYPTO_ALGORITHM, Jira.CRYPTO_PASSWORD)

        var crypted = cipher.update(text, 'utf8', 'hex')

        crypted += cipher.final('hex')

        return crypted
    }

    getIssueUrl(number) {
        return url.format({
            hostname: jiraConfig.host,
            pathname: '/browse/' + number,
            port: jiraConfig.port,
            protocol: jiraConfig.protocol,
        })
    }

    normalizeOptions() {
        var options = this.options

        options.summary = options.title
        options.description = options.message
        options.components = options.component
        options.issuetype = options.type
        options.versions = options.version

        options.jiraNumber = options.number
        options.originalAssignee = options.assignee
        options.assignee = options.assignee || jiraConfig.user
        options.jira = jiraConfig

        if (options.unassign) {
            options.assign = true
            options.unassigned = true
        }

        if (options.unassigned) {
            options.assignee = null
        }

        options.message = options.message || ''
        options.summary = options.summary || ''

        if (options.message) {
            options.message = logger.applyReplacements(options.message)
        }
    }

    expandAliases() {
        var options = this.options

        if (config.alias) {
            options.assignee = config.alias[options.assignee] || options.assignee
        }

        if (options.new && config.alias) {
            options.reporter = config.alias[options.reporter] || options.reporter
        }
    }

    expandComment(comment) {
        return comment + this.expandEmoji(config.signature)
    }

    expandEmoji(content) {
        return content
            .replace('<br><br>:octocat:', '\n\n\\\\\n\n!http://nodegh.io/images/octocat.png!')
            .replace('*Sent from [GH](http://nodegh.io).*', '_Sent from [GH|http://nodegh.io/]_')
    }

    login() {
        let promptOptions = [
            {
                message: 'Enter your JIRA server',
                name: 'host',
            },
            {
                message: 'Enter your JIRA user',
                name: 'user',
            },
            {
                type: 'password',
                message: 'Enter your JIRA password',
                name: 'password',
            },
        ]

        return new Promise(resolve => {
            inquirer.prompt(promptOptions, answers => {
                answers.password = this.encryptText(answers.password)
                answers.base = Jira.DEFAULT_JIRA_BASE
                jiraConfig.user = answers.user
                jiraConfig.password = answers.password
                jiraConfig.base = answers.base

                logger.log('Writing GH config data.')
                base.writeGlobalConfig('plugins.jira', answers)

                resolve()
            })
        })
    }

    selectUserWithQuestion(users) {
        let options = {
            choices: lodash.pluck(users, 'name'),
            message: 'Which user are you looking for?',
            name: 'username',
            type: 'list',
        }

        return new Promise(resolve => {
            inquirer.prompt([options], answers => {
                resolve(answers.username)
            })
        })
    }

    getIssueEditMeta(number) {
        return this.api
            .get('/issue/' + this.api.encode(number), {
                qs: {
                    expand: 'editmeta',
                },
            })
            .then(response => {
                let body = response.body
                let editmeta = body.editmeta
                let meta = {
                    fields: body.fields,
                }

                meta.fieldsMeta = editmeta.fields

                return meta
            })
    }

    getNewIssueMeta(projectName, issueType) {
        return this.api
            .get('/issue/createmeta', {
                qs: {
                    projectKeys: projectName,
                    issuetypeNames: issueType,
                    expand: 'projects.issuetypes.fields',
                },
            })
            .then(response => {
                let project = response.body.projects[0]
                let issueTypes = project.issuetypes

                if (!issueTypes || issueTypes.length !== 1 || issueTypes[0].name !== issueType) {
                    throw 'Issue type not found for the given project.'
                }

                let type = issueTypes[0]

                let meta = {
                    projectId: project.id,
                    issueTypeId: type.id,
                    fieldsMeta: type.fields,
                    allowedValues: {},
                }

                return meta
            })
    }

    registerLoggerHelpers() {
        logger.registerHelper('jiraIssueLink', () => {
            return this.getIssueUrl(this.options.jiraNumber)
        })
    }
}

Jira.DETAILS = {
    alias: 'ji',
    iterative: 'number',
    commands: [
        'assign',
        'unassign',
        'browser',
        'comment',
        'label',
        'new',
        'status',
        'transition',
        'update',
    ],
    description: 'NodeGH plugin for integrating Jira, an issue management system.',
    options: {
        assign: Boolean,
        assignee: String,
        unassign: Boolean,
        browser: Boolean,
        comment: String,
        component: String,
        label: String,
        message: String,
        new: Boolean,
        number: [String, Array],
        priority: String,
        project: String,
        reporter: String,
        submittedLink: String,
        title: String,
        transition: [String, Boolean],
        type: String,
        update: Boolean,
        version: String,
    },
    shorthands: {
        A: ['--assignee'],
        B: ['--browser'],
        c: ['--comment'],
        C: ['--component'],
        l: ['--label'],
        m: ['--message'],
        N: ['--new'],
        n: ['--number'],
        P: ['--priority'],
        p: ['--project'],
        R: ['--reporter'],
        t: ['--title'],
        T: ['--type'],
        u: ['--update'],
        v: ['--version'],
    },
}

Jira.DEFAULT_JIRA_BASE = 'rest/api/2'

Jira.CRYPTO_ALGORITHM = 'AES-256-CBC'
Jira.CRYPTO_PASSWORD = 'nodegh.io'

Jira.CANCEL_MESSAGE = 'Cancel'
Jira.ASSIGN_TO_ME_MESSAGE = 'Assign to me'
Jira.ASSIGN_TO_SOMEONE_MESSAGE = 'Assign to'
Jira.OPEN_ISSUE_IN_BROWSER_MESSAGE = 'Open in browser'

Jira.USERS_NOT_FOUND_ERROR = 'Users not found.'

let jira = new Jira()

exports.setupAfterHooks = function(context) {
    var options = context.options

    jira.setIssueNumber(options.pullBranch, options.repo, options)

    context.jira = jiraConfig
    context.jira.number = options.jiraNumber

    return context
}

exports.setupBeforeHooks = function(context) {
    var options = context.options

    jira.setIssueNumber(options.pullBranch, options.repo, options)

    context.jira = jiraConfig
    context.jira.number = options.jiraNumber

    return context
}

exports.Impl = Jira
