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

    if (options.paste) {
        logger.error('Sorry, this functionality was removed.');
        return;
    }

    if (options.browser) {
        instance.browser(options.id || options.loggedUser);
    }

    if (options.delete) {
        hooks.invoke('gists.delete', instance, function(afterHooksCallback) {
            logger.logTemplate(
                'Deleting gist {{greenBright options.loggedUser "/" options.delete}}', {
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
                        instance.delete(options.delete, function(err) {
                            if (err) {
                                logger.error('Can\'t delete gist.');
                                return;
                            }
                        });

                        afterHooksCallback();
                    }
                    else {
                        logger.log('Not deleted.');
                    }
                });
        });
    }

    if (options.fork) {
        hooks.invoke('gists.fork', instance, function(afterHooksCallback) {
            logger.logTemplate(
                'Forking gist on {{greenBright options.loggedUser}}', {
                    options: options
                });

            instance.fork(options.fork, function(err) {
                if (err) {
                    logger.error(JSON.parse(err.message).message);
                    return;
                }

                logger.logTemplate(
                    'https://gist.github.com/{{options.id}}', {
                    options: options
                });

                afterHooksCallback();
            });
        });
    }

    if (options.list) {
        logger.logTemplate(
            'Listing gists for {{greenBright options.user}}', {
                options: options
            });

        instance.list(options.user, function(err) {
            if (err) {
                logger.error('Can\'t list gists for ' + options.user + '.');
                return;
            }
        });
    }

    if (options.new) {
        hooks.invoke('gists.new', instance, function(afterHooksCallback) {
            operations = [];
            options.new = options.new;

            logger.logTemplateFile('gi-new.handlebars', {
                options: options,
                privacy: options.private ? 'private' : 'public'
            });

            instance.new(options.new, options.content, function(err, gist) {
                if (gist) {
                    options.id = gist.id;
                }

                if (err) {
                    logger.error('Can\'t create gist. ' + JSON.parse(err.message).message);
                    return;
                }

                logger.log('{{gistLink}}', {
                    options: options
                });

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
