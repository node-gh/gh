/*
 * Copyright 2013-2015, All Rights Reserved.
 *
 * Code licensed under the BSD License:
 * https://github.com/node-gh/gh/blob/master/LICENSE.md
 *
 * @author Henrique Vicente <henriquevicente@gmail.com>
 * @author Eduardo Lundgren <eduardo.lundgren@gmail.com>
 * @author Zeno Rocha <zno.rocha@gmail.com>
 */

'use strict';

// -- Requires -------------------------------------------------------------------------------------

var base = require('../base'),
    git = require('../git'),
    hooks = require('../hooks'),
    logger = require('../logger'),
    openUrl = require('open'),
    inquirer = require('inquirer'),
    url = require('url');

// -- Constructor ----------------------------------------------------------------------------------

function Repo(options) {
    this.options = options;
}

// -- Constants ------------------------------------------------------------------------------------

Repo.DETAILS = {
    alias: 're',
    description: 'Provides a set of util commands to work with Repositories.',
    commands: [
        'browser',
        'clone',
        'delete',
        'fork',
        'list',
        'new'
    ],
    options: {
        'browser': Boolean,
        'clone': Boolean,
        'delete': String,
        'description': String,
        'detailed': Boolean,
        'gitignore': String,
        'fork': String,
        'homepage': String,
        'init': Boolean,
        'list': Boolean,
        'new': String,
        'organization': String,
        'private': Boolean,
        'repo': String,
        'type': ['all', 'forks', 'member', 'owner', 'public', 'private', 'sources'],
        'user': String
    },
    shorthands: {
        'B': ['--browser'],
        'c': ['--clone'],
        'D': ['--delete'],
        'd': ['--detailed'],
        'f': ['--fork'],
        'l': ['--list'],
        'N': ['--new'],
        'O': ['--organization'],
        'p': ['--private'],
        'r': ['--repo'],
        't': ['--type'],
        'u': ['--user']
    },
    payload: function (payload, options) {
        options.browser = true;
    }
};

Repo.TYPE_ALL = 'all';
Repo.TYPE_FORKS = 'forks';
Repo.TYPE_MEMBER = 'member';
Repo.TYPE_OWNER = 'owner';
Repo.TYPE_PRIVATE = 'private';
Repo.TYPE_PUBLIC = 'public';
Repo.TYPE_SOURCES = 'sources';

// -- Commands -------------------------------------------------------------------------------------

Repo.prototype.run = function () {
    var instance = this,
        options = instance.options,
        user = options.loggedUser;

    if (options.browser) {
        instance.browser(options.user, options.repo);
    }

    if (options.delete) {
        hooks.invoke('repo.delete', instance, function (afterHooksCallback) {
            logger.log('Deleting repo ' + logger.colors.green(options.user + '/' + options.delete));

            inquirer.prompt(
                [
                    {
                        type: 'input',
                        message: 'Are you sure? This action CANNOT be undone. [y/N]',
                        name: 'confirmation'
                    }
                ], function (answers) {
                    if (answers.confirmation.toLowerCase() === 'y') {
                        instance.delete(options.user, options.delete, function (err) {
                            if (err) {
                                logger.error('Can\'t delete repo.');
                                return;
                            }

                            afterHooksCallback();
                        });
                    }
                    else {
                        logger.log('Not deleted.');
                    }
                });
        });
    }

    if (options.fork) {
        hooks.invoke('repo.fork', instance, function (afterHooksCallback) {
            if (options.organization) {
                user = options.organization;
            }

            options.repo = options.fork;

            logger.log('Forking repo ' + logger.colors.green(options.user + '/' + options.repo) +
                ' on ' + logger.colors.green(user + '/' + options.repo));

            instance.fork(function (err1, repo) {
                if (err1) {
                    logger.error('Can\'t fork. ' + JSON.parse(err1).message);
                    return;
                }

                logger.log(repo.html_url);

                if (repo && options.clone) {
                    instance.clone_(options.loggedUser, options.repo, repo.ssh_url);
                }

                afterHooksCallback();
            });
        });
    }

    if (options.list) {
        if (options.organization) {
            user = options.organization;
            options.type = options.type || Repo.TYPE_ALL;
        } else {
            user = options.user;
            options.type = options.type || Repo.TYPE_OWNER;
        }

        if (options.isTTY.out) {
            logger.log('Listing ' + logger.colors.green(options.type) + ' repos for ' +
                logger.colors.green(user));
        }


        instance.list(user, function (err) {
            if (err) {
                logger.error('Can\'t list repos.');
            }
        });
    }

    if (options.new) {
        hooks.invoke('repo.new', instance, function (afterHooksCallback) {
            options.repo = options.new;

            if (options.organization) {
                options.user = options.organization;
            }

            logger.log('Creating a new repo on ' + logger.colors.green(options.user + '/' + options.new));

            instance.new(function (err1, repo) {
                if (err1) {
                    logger.error('Can\'t create new repo. ' + JSON.parse(err1.message).message);
                    return;
                }

                logger.log(repo.html_url);

                if (repo && options.clone) {
                    instance.clone_(options.user, options.repo, repo.ssh_url);
                }

                afterHooksCallback();
            });
        });
    }
};

Repo.prototype.browser = function (user, repo) {
    openUrl('https://github.com/' + user + '/' + repo);
};

Repo.prototype.clone_ = function (user, repo, repo_url) {
    logger.log('Cloning ' + logger.colors.green(user + '/' + repo));
    git.clone(url.parse(repo_url).href, repo);
};

Repo.prototype.delete = function (user, repo, opt_callback) {
    var payload;

    payload = {
        user: user,
        repo: repo
    };

    base.github.repos.delete(payload, opt_callback);
};

Repo.prototype.list = function (user, opt_callback) {
    var instance = this,
        method = 'getFromUser',
        options = instance.options,
        payload;

    payload = {
        type: options.type,
        user: user,
        per_page: 1000
    };

    if (options.organization) {
        method = 'getFromOrg';
        payload.org = options.organization;
    }

    if (options.type === 'public' || options.type === 'private') {
        if (user === options.user) {
            method = 'getAll';
        }
        else {
            logger.error('You can only list your own public and private repos of your own.');
            return;
        }
    }

    base.github.repos[method](payload, function (err, repos) {
        instance.listCallback_(err, repos, opt_callback);
    });
};

Repo.prototype.listCallback_ = function (err, repos, opt_callback) {
    var instance = this,
        options = instance.options,
        pos,
        repo;

    if (err && !options.all) {
        logger.error(logger.getErrorMessage(err));
    }

    if (repos && repos.length > 0) {
        for (pos in repos) {
            if (repos.hasOwnProperty(pos) && repos[pos].full_name) {
                repo = repos[pos];
                logger.log(repo.full_name);

                if (options.detailed) {
                    logger.log(logger.colors.blue(repo.html_url));

                    if (repo.description) {
                        logger.log(logger.colors.blue(repo.description));
                    }

                    if (repo.homepage) {
                        logger.log(logger.colors.blue(repo.homepage));
                    }

                    logger.log('last update ' + logger.getDuration(repo.updated_at));
                }

                if (options.isTTY.out) {
                    logger.log(logger.colors.green('forks: ' + repo.forks +
                            ', stars: ' + repo.watchers + ', issues: ' + repo.open_issues) + '\n');
                }
            }
        }

        opt_callback && opt_callback(err);
    }
};

Repo.prototype.fork = function (opt_callback) {
    var instance = this,
        options = instance.options,
        payload;

    payload = {
        user: options.user,
        repo: options.repo
    };

    if (options.organization) {
        payload.organization = options.organization;
    }

    base.github.repos.fork(payload, opt_callback);
};

Repo.prototype.new = function (opt_callback) {
    var instance = this,
        options = instance.options,
        payload,
        method = 'create';

    options.description = options.description || '';
    options.gitignore = options.gitignore || '';
    options.homepage = options.homepage || '';
    options.init = options.init || false;

    if (options.type === Repo.TYPE_PRIVATE) {
        options.private = true;
    }

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

    if (options.organization) {
        method = 'createFromOrg';
        payload.org = options.organization;
    }

    base.github.repos[method](payload, opt_callback);
};

exports.Impl = Repo;
