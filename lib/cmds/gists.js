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

var async = require('async'),
    base = require('../base'),
    copyPaste = require('copy-paste'),
    hooks = require('../hooks'),
    inquirer = require('inquirer'),
    logger = require('../logger'),
    openUrl = require('open');

// -- Constructor ----------------------------------------------------------------------------------

function Gists(options) {
    this.options = options;
}

// -- Constants ------------------------------------------------------------------------------------

Gists.DETAILS = {
    alias: 'gi',
    description: 'Provides a set of util commands to work with Gists.',
    iterative: 'delete',
    commands: [
        'browser',
        'delete',
        'fork',
        'list',
        'new'
    ],
    options: {
        'browser': Boolean,
        'content': String,
        'delete': [String, Array],
        'description': String,
        'fork': String,
        'id': String,
        'list': Boolean,
        'new': String,
        'paste': Boolean,
        'private': Boolean,
        'user': String
    },
    shorthands: {
        'B': ['--browser'],
        'c': ['--content'],
        'D': ['--delete'],
        'd': ['--description'],
        'f': ['--fork'],
        'i': ['--id'],
        'l': ['--list'],
        'N': ['--new'],
        'P': ['--paste'],
        'p': ['--private'],
        'u': ['--user']
    },
    payload: function(payload, options) {
        options.list = true;
    }
};

// -- Commands -------------------------------------------------------------------------------------

Gists.prototype.run = function() {
    var instance = this,
        operations,
        options = instance.options;

    if (options.browser) {
        instance.browser(options.id || options.loggedUser);
    }

    if (options.delete) {
        hooks.invoke('gists.delete', instance, function(afterHooksCallback) {
            logger.logTemplate(
                '{{prefix}} [info] Deleting gist {{greenBright options.loggedUser "/" options.delete}}', {
                    options: options
                });

            inquirer.prompt(
                [
                    {
                        type: 'input',
                        message: 'Are you sure? This action CANNOT be undone. [y/N]',
                        name: 'confirmation'
                    }
                ], function(answers) {
                    if (answers.confirmation.toLowerCase() === 'y') {
                        instance.delete(options.delete, logger.defaultCallback);

                        afterHooksCallback();
                    }
                    else {
                        logger.info('Not deleted.');
                    }
                });
        });
    }

    if (options.fork) {
        hooks.invoke('gists.fork', instance, function(afterHooksCallback) {
            logger.logTemplate(
                '{{prefix}} [info] Forking gist on {{greenBright options.loggedUser}}', {
                    options: options
                });

            instance.fork(options.fork, function(err, fork) {
                options.id = fork.id;
                logger.defaultCallback(
                    err, null, logger.compileTemplate(
                        'https://gist.github.com/{{options.id}}', {
                            options: options
                        }));

                afterHooksCallback();
            });
        });
    }

    if (options.list) {
        logger.logTemplate(
            '{{prefix}} [info] Listing gists for {{greenBright options.user}}', {
                options: options
            });

        instance.list(options.user, function(err) {
            logger.defaultCallback(err, null, false);
        });
    }

    if (options.new) {
        hooks.invoke('gists.new', instance, function(afterHooksCallback) {
            operations = [];
            options.new = options.new;

            operations.push(function(opt_callback) {
                if (options.paste) {
                    // When creating from clipboard prefer private gists for privacy
                    if (options.private === undefined) {
                        options.private = true;
                    }

                    copyPaste.paste(function(undefined, clipboard) {
                        options.content = clipboard;
                        opt_callback && opt_callback();
                    });
                }
            });

            operations.push(function(opt_callback) {
                logger.logTemplateFile('gi-new.handlebars', {
                    options: options,
                    privacy: options.private ? 'private' : 'public'
                });

                instance.new(options.new, options.content, function(err, gist) {
                    if (gist) {
                        options.id = gist.id;
                    }

                    logger.defaultCallback(
                        err, null, logger.compileTemplate('{{gistLink}}', {
                            options: options
                        }));

                    opt_callback && opt_callback();
                });
            });

            async.series(operations, function(err) {
                if (err) {
                    logger.error(err);
                }

                afterHooksCallback();
            });
        });
    }
};

Gists.prototype.browser = function(gist) {
    openUrl('https://gist.github.com/' + gist);
};

Gists.prototype.delete = function(id, opt_callback) {
    var payload = {
        id: id
    };

    base.github.gists.delete(payload, opt_callback);
};

Gists.prototype.fork = function(id, opt_callback) {
    var payload = {
        id: id
    };

    base.github.gists.fork(payload, opt_callback);
};

Gists.prototype.list = function(user, opt_callback) {
    var instance = this,
        payload;

    payload = {
        user: user
    };

    base.github.gists.getFromUser(payload, function(err, gists) {
        instance.listCallback_(err, gists, opt_callback);
    });
};

Gists.prototype.listCallback_ = function(err, gists, opt_callback) {
    var instance = this,
        options = instance.options;

    if (err && !options.all) {
        logger.error(logger.getErrorMessage(err));
    }

    if (gists && gists.length > 0) {
        logger.logTemplateFile('gi-list.handlebars', {
            gists: gists,
            user: options.user
        });

        opt_callback && opt_callback(err);
    }
};

Gists.prototype.new = function(name, content, opt_callback) {
    var instance = this,
        file = {},
        options = instance.options,
        payload;

    options.description = options.description || '';

    file[name] = {
        content: content
    };

    payload = {
        description: options.description,
        files: file,
        public: !options.private
    };

    base.github.gists.create(payload, opt_callback);
};

exports.Impl = Gists;
