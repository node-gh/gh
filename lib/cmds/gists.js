/*
 * Copyright 2013, All Rights Reserved.
 *
 * Code licensed under the BSD License:
 * https://github.com/node-gh/gh/blob/master/LICENSE.md
 *
 * @author Henrique Vicente <henriquevicente@gmail.com>
 * @author Eduardo Lundgren <eduardo.lundgren@gmail.com>
 * @author Zeno Rocha <zno.rocha@gmail.com>
 */

// -- Requires -----------------------------------------------------------------
var base = require('../base'),
    copyPaste = require('copy-paste'),
    hooks = require('../hooks'),
    logger = require('../logger'),
    openUrl = require('open'),
    prompt = require('prompt');

// -- Constructor --------------------------------------------------------------
function Gists(options) {
    this.options = options;
}

// -- Constants ----------------------------------------------------------------
Gists.DETAILS = {
    alias: 'gi',
    description: 'Provides a set of util commands to work with Gists.',
    commands: [
        'browser',
        'delete',
        'fork',
        'new'
    ],
    options: {
        'browser'       : Boolean,
        'content'       : String,
        'delete'        : String,
        'description'   : String,
        'fork'          : String,
        'id'            : String,
        'new'           : String,
        'paste'         : Boolean,
        'private'       : Boolean
    },
    shorthands: {
        'B': [ '--browser' ],
        'c': [ '--content' ],
        'D': [ '--delete' ],
        'f': [ '--fork' ],
        'i': [ '--id' ],
        'N': [ '--new' ],
        'p': [ '--private' ],
        'P': [ '--paste' ],
    },
    payload: function(payload, options) {
        options.browser = true;
    }
};

// -- Commands -----------------------------------------------------------------
Gists.prototype.run = function() {
    var instance = this,
        options = instance.options;

    options.type = options.type || Gists.TYPE_ALL;

    if (options.browser) {
        instance.browser(options.id || options.loggedUser);
    }

    if (options.delete) {
        options.id = options.delete;
        hooks.invoke('gists.delete', instance, function(afterHooksCallback) {
            logger.logTemplate('{{prefix}} [info] Deleting gist {{greenBright options.loggedUser "/" options.delete}}', {
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
                    instance.delete(options.id, logger.defaultCallback);

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
            logger.logTemplate('{{prefix}} [info] Forking a gist on {{greenBright options.loggedUser}}', {
                options: options
            });

            instance.fork(function(err1, fork) {
                options.id = fork.id;
                logger.defaultCallback(
                    err1, null, logger.compileTemplate('https://github.com/' + options.loggedUser + '/' + options.id, { options: options }));

                afterHooksCallback();
            });
        });
    }

    if (options.new) {
        hooks.invoke('gists.new', instance, function(afterHooksCallback) {
            if (options.paste) {
                options.content = copyPaste.paste();
            }

            logger.logTemplate('{{prefix}} [info] Creating a new gist on {{greenBright options.user}}', {
                options: options
            });

            instance.new(function(err1, gist) {
                options.id = gist.id;

                logger.defaultCallback(
                    err1, null, logger.compileTemplate('{{gistLink}}', { options: options }));

                afterHooksCallback();
            });
        });
    }
};

Gists.prototype.browser = function(user, id) {
    if (id !== undefined && id !== 'undefined') {
        openUrl('https://gist.github.com/' + id);
    }
    else {
        openUrl('https://gist.github.com/' + user);
    }
};

Gists.prototype.delete = function(id, opt_callback) {
    var payload = {
        id: id
    };

    base.github.gists.delete(payload, opt_callback);
};

Gists.prototype.fork = function(opt_callback) {
    var instance = this,
        options = instance.options,
        payload;

    payload = {
        id: options.fork
    };

    base.github.gists.fork(payload, opt_callback);
};

Gists.prototype.new = function(opt_callback) {
    var file = {},
        instance = this,
        options = instance.options,
        payload;

    options.description = options.description || '';
    options.public = !options.private || false;

    file[options.new] = {
        content: options.content
    };

    payload = {
        files: file,
        description: options.description,
        public: options.public
    };

    base.github.gists.create(payload, opt_callback);
};

exports.Impl = Gists;