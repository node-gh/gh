/*
 * Copyright 2013-2018, All Rights Reserved.
 *
 * Code licensed under the BSD License:
 * https://github.com/node-gh/gh/blob/master/LICENSE.md
 *
 * @author Zeno Rocha <zno.rocha@gmail.com>
 * @author Eduardo Lundgren <edu@rdo.io>
 */

'use strict'

// -- Requires -------------------------------------------------------------------------------------

var async = require('async'),
    base = require('../base'),
    logger = require('../logger')

// -- Constructor ----------------------------------------------------------------------------------

function Milestone(options) {
    this.options = options

    if (options.organization) {
        options.all = true
    }

    if (!options.repo && !options.all) {
        logger.error('You must specify a Git repository with a GitHub remote to run this command')
    }
}

// -- Constants ------------------------------------------------------------------------------------

Milestone.DETAILS = {
    alias: 'ms',
    description: 'Provides a set of util commands to work with Milestones.',
    iterative: 'number',
    commands: ['list'],
    options: {
        all: Boolean,
        organization: String,
        list: Boolean,
    },
    shorthands: {
        a: ['--all'],
        o: ['--organization'],
        l: ['--list'],
    },
    payload: function(payload, options) {
        options.list = true
    },
}

// -- Commands -------------------------------------------------------------------------------------

Milestone.prototype.run = function() {
    var instance = this,
        options = instance.options

    if (options.list) {
        if (options.all) {
            logger.log(
                'Listing milestones for ' +
                    logger.colors.green(options.organization || options.user)
            )

            instance.listFromAllRepositories(function(err) {
                if (err) {
                    logger.error("Can't list milestones for " + options.user + '.')
                    return
                }
            })
        } else {
            logger.log(
                'Listing milestones on ' + logger.colors.green(options.user + '/' + options.repo)
            )

            instance.list(options.user, options.repo, function(err) {
                if (err) {
                    logger.error("Can't list milestones on " + options.user + '/' + options.repo)
                    return
                }
            })
        }
    }
}

Milestone.prototype.list = function(user, repo, opt_callback) {
    var instance = this,
        options = instance.options,
        payload

    payload = {
        repo: repo,
        user: user,
    }

    base.github.issues.getAllMilestones(payload, function(err, milestones) {
        if (err && !options.all) {
            logger.error(logger.getErrorMessage(err))
        }

        milestones.sort(function(a, b) {
            return a.due_date > b.due_date ? -1 : 1
        })

        if (milestones && milestones.length > 0) {
            milestones.forEach(function(milestone) {
                var due = milestone.due_on ? logger.getDuration(milestone.due_on) : 'n/a'
                var description = milestone.description || ''
                var prefix = ''

                if (options.all) {
                    prefix = logger.colors.blue(user + '/' + repo + ' ')
                }

                logger.log(
                    prefix +
                        logger.colors.green(milestone.title) +
                        ' ' +
                        (description + ' ').trim() +
                        logger.colors.magenta('@' + milestone.state + ' (due ' + due + ')')
                )
            })
        }

        opt_callback && opt_callback(err)
    })
}

Milestone.prototype.listFromAllRepositories = function(opt_callback) {
    var instance = this,
        options = instance.options,
        operations = [],
        op = 'getAll',
        payload

    payload = {
        type: 'all',
        user: options.user,
    }

    if (options.organization) {
        op = 'getFromOrg'
        payload.org = options.organization
    }

    base.github.repos[op](payload, function(err, repositories) {
        if (err) {
            opt_callback && opt_callback(err)
        } else {
            repositories.forEach(function(repository) {
                operations.push(function(callback) {
                    instance.list(repository.owner.login, repository.name, callback)
                })
            })
        }

        async.series(operations, opt_callback)
    })
}

exports.Impl = Milestone
