"use strict";
/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: CONTRIBUTORS)
 * SPDX-License-Identifier: BSD-3-Clause
 */
Object.defineProperty(exports, "__esModule", { value: true });
// -- Requires -------------------------------------------------------------------------------------
const inquirer = require("inquirer");
const openUrl = require("opn");
const base = require("../base");
const hooks = require("../hooks");
const logger = require("../logger");
const config = base.getConfig();
const testing = process.env.NODE_ENV === 'testing';
// -- Constructor ----------------------------------------------------------------------------------
function Gists(options) {
    this.options = options;
}
exports.default = Gists;
// -- Constants ------------------------------------------------------------------------------------
Gists.DETAILS = {
    alias: 'gi',
    description: 'Provides a set of util commands to work with Gists.',
    iterative: 'delete',
    commands: ['browser', 'delete', 'fork', 'list', 'new'],
    options: {
        browser: Boolean,
        content: String,
        delete: [String, Array],
        description: String,
        fork: String,
        id: String,
        list: Boolean,
        new: String,
        private: Boolean,
        user: String,
    },
    shorthands: {
        B: ['--browser'],
        c: ['--content'],
        D: ['--delete'],
        d: ['--description'],
        f: ['--fork'],
        i: ['--id'],
        l: ['--list'],
        N: ['--new'],
        p: ['--private'],
        u: ['--user'],
    },
    payload(payload, options) {
        options.list = true;
    },
};
// -- Commands -------------------------------------------------------------------------------------
Gists.prototype.run = function (done) {
    const instance = this;
    const options = instance.options;
    instance.config = config;
    if (options.paste) {
        logger.error('Sorry, this functionality was removed.');
        return;
    }
    if (options.browser) {
        !testing && instance.browser(options.id || options.loggedUser);
    }
    if (options.delete) {
        hooks.invoke('gists.delete', instance, afterHooksCallback => {
            logger.log(`Deleting gist ${logger.colors.green(`${options.loggedUser}/${options.delete}`)}`);
            if (testing) {
                return _deleteHandler(true, afterHooksCallback);
            }
            inquirer
                .prompt([
                {
                    type: 'input',
                    message: 'Are you sure? This action CANNOT be undone. [y/N]',
                    name: 'confirmation',
                },
            ])
                .then(answers => _deleteHandler(answers.confirmation.toLowerCase() === 'y', afterHooksCallback));
            function _deleteHandler(proceed, cb) {
                if (proceed) {
                    instance.delete(options.delete, err => {
                        if (err) {
                            logger.error("Can't delete gist.");
                            return;
                        }
                        cb && cb();
                        done && done();
                    });
                }
                else {
                    logger.log('Not deleted.');
                }
            }
        });
    }
    if (options.fork) {
        hooks.invoke('gists.fork', instance, afterHooksCallback => {
            logger.log(`Forking gist on ${logger.colors.green(options.loggedUser)}`);
            instance.fork(options.fork, (err, gist) => {
                if (err) {
                    logger.error(JSON.parse(err.message).message);
                    return;
                }
                logger.log(gist.html_url);
                afterHooksCallback();
                done && done();
            });
        });
    }
    if (options.list) {
        logger.log(`Listing gists for ${logger.colors.green(options.user)}`);
        instance.list(options.user, err => {
            if (err) {
                logger.error(`Can't list gists for ${options.user}.`);
                return;
            }
            done && done();
        });
    }
    if (options.new) {
        hooks.invoke('gists.new', instance, afterHooksCallback => {
            const privacy = options.private ? 'private' : 'public';
            options.new = options.new;
            logger.log(`Creating ${logger.colors.magenta(privacy)} gist on ${logger.colors.green(options.loggedUser)}`);
            instance.new(options.new, options.content, (err, gist) => {
                if (gist) {
                    options.id = gist.id;
                }
                if (err) {
                    logger.error(`Can't create gist. ${JSON.parse(err.message).message}`);
                    return;
                }
                logger.log(gist.html_url);
                afterHooksCallback();
                done && done();
            });
        });
    }
};
Gists.prototype.browser = function (gist) {
    openUrl(config.github_gist_host + gist, { wait: false });
};
Gists.prototype.delete = function (id, opt_callback) {
    var payload = {
        id,
    };
    base.github.gists.delete(payload, opt_callback);
};
Gists.prototype.fork = function (id, opt_callback) {
    var payload = {
        id,
    };
    base.github.gists.fork(payload, opt_callback);
};
Gists.prototype.list = function (user, opt_callback) {
    const instance = this;
    const payload = {
        user,
    };
    base.github.gists.getFromUser(payload, (err, gists) => {
        instance.listCallback_(err, gists, opt_callback);
    });
};
Gists.prototype.listCallback_ = function (err, gists, opt_callback) {
    const instance = this;
    const options = instance.options;
    if (err && !options.all) {
        logger.error(logger.getErrorMessage(err));
    }
    if (gists && gists.length > 0) {
        gists.forEach(gist => {
            logger.log(`${logger.colors.yellow(`${gist.owner.login}/${gist.id}`)} ${logger.getDuration(gist.updated_at)}`);
            if (gist.description) {
                logger.log(gist.description);
            }
            logger.log(`${logger.colors.blue(gist.html_url)}\n`);
        });
        opt_callback && opt_callback(err);
    }
};
Gists.prototype.new = function (name, content, opt_callback) {
    const instance = this;
    const file = {};
    const options = instance.options;
    let payload;
    options.description = options.description || '';
    file[name] = {
        content,
    };
    payload = {
        description: options.description,
        files: file,
        public: !options.private,
    };
    base.github.gists.create(payload, opt_callback);
};
