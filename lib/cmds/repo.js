/*
 * Copyright 2013, All Rights Reserved.
 *
 * Code licensed under the BSD License:
 * https://github.com/eduardolundgren/blob/master/LICENSE.md
 *
 * @author Henrique Vicente <henriquevicente@gmail.com>
 */

// -- Requires -----------------------------------------------------------------
var async = require('async'),
    base = require('../base'),
    clc = require('cli-color'),
    logger = require('../logger'),
    open = require('open'),
    url = require('url'),
    childProcess = require('child_process');

// -- Constructor --------------------------------------------------------------
function Repo(options) {
    this.options = options;

    if (!options.repo) {
        logger.error('You must specify a Git repository to run this command');
    }
}

// -- Constants ----------------------------------------------------------------
Repo.DETAILS = {
    alias: 're',
    description: 'Provides a set of util commands to work with Repositories.',
    options: {
        'list'     : Boolean,
        'detailed' : Boolean,
        'new'      : Boolean,
        'repo'     : String,
        'clone'    : Boolean,
        'user'     : String,
        'type'     : ['all', 'owner', 'public', 'private', 'member'],
        'auto-init': Boolean,
        'gitignore-template' : String,
        'homepage' : String,
        'description' : String
    },
    shorthands: {
        'l': [ '--list' ],
        'd': [ '--detailed' ],
        'N': [ '--new' ],
        'r': [ '--repo' ],
        'c': [ '--clone' ],
        'u': [ '--user' ],
        't' : [ '--type' ]
    },
    payload: function(payload, options) {
        options.list = true;
    }
};

Repo.TYPE_ALL = 'all';
Repo.TYPE_OWNER = 'owner';
Repo.TYPE_PUBLIC = 'public';
Repo.TYPE_PRIVATE = 'private';
Repo.TYPE_MEMBER = 'member';

// -- Commands -----------------------------------------------------------------
Repo.prototype.run = function() {
    var instance = this,
        options = instance.options,
        config = base.getGlobalConfig();

    options.type = options.type || Repo.TYPE_ALL;

    if (options.list) {
        logger.logTemplate('{{prefix}} [info] Listing {{greenBright options.type}} repos for {{greenBright options.user}}', {
            options: options
        });

        instance.list(options.user, function(err) {
            logger.defaultCallback(err, null, false);
        });
    }

    if (options.new) {
        logger.logTemplate('{{prefix}} [info] Creating a new repo on {{greenBright options.user '/' options.repo}}', {
            options: options
        });

        instance.new(function(err, repo) {
            if (repo) {
                options.id = repo.id;

                if (config.open_repo_in_browser) {
                    open(repo.html_url);
                }

                if (options.clone) {
                    var cmd = 'git clone ' + url.parse(repo.ssh_url).href;
                    childProcess.exec(cmd, function (error, stdout, stderr) {
                        if (error !== null) {
                            logger.error(logger.getErrorMessage(stderr));
                        }
                        else {
                            logger.log(stdout);
                        }
                    });
                }
            }

            logger.defaultCallback(
                err, null, logger.compileTemplate('{{repoLink}}', { options: options }));
        });
    }
};

Repo.prototype.list = function(user, opt_callback) {
    var instance = this,
        options = instance.options,
        payload;

    payload = {
        type: options.type,
        user: user
    };

    this.listCallback = function (err, repos) {
        if (err && !options.all) {
            logger.error(logger.getErrorMessage(err));
        }

        if (repos && repos.length > 0) {
            logger.logTemplateFile('repo.handlebars', {
                detailed: options.detailed,
                repos: repos,
                user: user
            });

            opt_callback && opt_callback(err);
        }
    };

    if (options.type === 'public' || options.type === 'private') {
        if (options.user !== options.loggedUser) {
            logger.error('You can only list public and private repos of your own.');
        } else {
            base.github.repos.getAll(payload, this.listCallback);
        }
    } else {
        base.github.repos.getFromUser(payload, this.listCallback);
    }
};

Repo.prototype.new = function(opt_callback) {
    var instance = this,
        options = instance.options,
        payload;

    if (options.type !== 'private') {
        options.type = 'public';
    }

    if (!options['auto-init']) {
        options['auto-init'] = false;
    }

    if (!options['gitignore-template']) {
        options['gitignore-template'] = '';
    }
    else {
        options['auto-init'] = true;
    }

    if (!options.homepage) {
        options.homepage = '';
    }

    if (!options.description) {
        options.description = '';
    }

    payload = {
        name: options.repo,
        private: options.type,
        auto_init: options['auto-init'],
        gitignore_template: options['gitignore-template'],
        homepage: options.homepage,
        description: options.description
    };

    base.github.repos.create(payload, opt_callback);
};

exports.Impl = Repo;