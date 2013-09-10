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
    git = require('../git'),
    logger = require('../logger'),
    open = require('open'),
    prompt = require('prompt'),
    url = require('url');

// -- Constructor --------------------------------------------------------------
function Repo(options) {
    this.options = options;
}

// -- Constants ----------------------------------------------------------------
Repo.DETAILS = {
    alias: 're',
    description: 'Provides a set of util commands to work with Repositories.',
    options: {
        'clone'         : Boolean,
        'delete'        : Boolean,
        'description'   : String,
        'detailed'      : Boolean,
        'gitignore'     : String,
        'homepage'      : String,
        'init'          : Boolean,
        'list'          : Boolean,
        'new'           : String,
        'open'          : Boolean,
        'delete'        : String,
        'private'       : Boolean,
        'repo'          : String,
        'type'          : [ 'all', 'member', 'owner', 'public', 'private' ],
        'user'          : String
    },
    shorthands: {
        'c': [ '--clone' ],
        'D': [ '--delete' ],
        'd': [ '--detailed' ],
        'l': [ '--list' ],
        'n': [ '--new' ],
        'o': [ '--open' ],
        'p': [ '--private' ],
        'r': [ '--repo' ],
        't': [ '--type' ],
        'u': [ '--user' ]
    },
    payload: function(payload, options) {
        options.open = true;
    }
};

Repo.TYPE_ALL = 'all';
Repo.TYPE_MEMBER = 'member';
Repo.TYPE_OWNER = 'owner';
Repo.TYPE_PRIVATE = 'private';
Repo.TYPE_PUBLIC = 'public';

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
        options.user = options.loggedUser;
        options.repo = options.new;

        logger.logTemplate('{{prefix}} [info] Creating a new repo on {{greenBright options.user "/" options.new}}', {
            options: options
        });

        instance.new(function(err1, repo) {
            if (repo) {
                options.id = repo.id;

                if (config.open_repo_in_browser) {
                    open(repo.html_url);
                }

                if (options.clone) {
                    git.clone(
                        url.parse(repo.ssh_url).href,
                        null,
                        function(err2, data) {
                            console.log(data);
                        });
                }
            }

            logger.defaultCallback(
                err1, null, logger.compileTemplate('{{repoLink}}', { options: options }));
        });
    }

    if (options.delete) {
        logger.logTemplate('{{prefix}} [info] Deleting repo {{greenBright options.user "/" options.delete}}', {
            options: options
        });

        prompt.get({
            properties: {
                confirmation: {
                    description: 'Are you sure? This action CANNOT be undone. [y/N]'
                }
            }
        }, function (err, result) {
            if (result.confirmation.toLowerCase() === 'y') {
                instance.delete(function(err1) {
                    logger.defaultCallback(err1, null);
                });
            }
            else {
                logger.info('Not deleted.');
            }
        });
    }

    if (options.open) {
        instance.open(options.user, options.repo);
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

    if (options.type === 'public' || options.type === 'private') {
        if (user !== options.loggedUser) {
            logger.error('You can only list public and private repos of your own.');
        }
        else {
            base.github.repos.getAll(payload, function(err, repos) {
                instance.listCallback_(err, repos, opt_callback);
            });
        }
    } else {
        base.github.repos.getFromUser(payload, function(err, repos) {
            instance.listCallback_(err, repos, opt_callback);
        });
    }
};

Repo.prototype.listCallback_ = function(err, repos, opt_callback) {
    var instance = this,
        options = instance.options;

    if (err && !options.all) {
        logger.error(logger.getErrorMessage(err));
    }

    if (repos && repos.length > 0) {
        logger.logTemplateFile('repo.handlebars', {
            detailed: options.detailed,
            repos: repos,
            user: options.user
        });

        opt_callback && opt_callback(err);
    }
};

Repo.prototype.new = function(opt_callback) {
    var instance = this,
        options = instance.options,
        payload;

    options.description = options.description || '';
    options.gitignore = options.gitignore || '';
    options.homepage = options.homepage || '';
    options.init = options.init || false;
    options.private = options.private || false;

    if (options.gitignore) {
        options.init = true;
    }

    payload = {
        auto_init: options.init,
        description: options.description,
        gitignore_template: options.gitignore,
        homepage: options.homepage,
        name: options.new,
        private: options.private
    };

    base.github.repos.create(payload, opt_callback);
};

Repo.prototype.delete = function(opt_callback) {
    var instance = this,
        options = instance.options,
        payload;

    payload = {
        user: options.user,
        repo: options.delete
    };

    base.github.repos.delete(payload, opt_callback);
};

Repo.prototype.open = function(user, repo) {
    open('http://github.com/' + user + '/' + repo);
};

exports.Impl = Repo;