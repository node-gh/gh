"use strict";
/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: CONTRIBUTORS)
 * SPDX-License-Identifier: BSD-3-Clause
 */
Object.defineProperty(exports, "__esModule", { value: true });
// -- Requires -------------------------------------------------------------------------------------
const fs = require("fs");
const inquirer = require("inquirer");
const openUrl = require("opn");
const url = require("url");
const base = require("../base");
const git = require("../git");
const hooks = require("../hooks");
const logger = require("../logger");
const config = base.getConfig();
const testing = process.env.NODE_ENV === 'testing';
// -- Constructor ----------------------------------------------------------------------------------
function Repo(options) {
    this.options = options;
}
exports.default = Repo;
// -- Constants ------------------------------------------------------------------------------------
Repo.DETAILS = {
    alias: 're',
    description: 'Provides a set of util commands to work with Repositories.',
    commands: ['browser', 'clone', 'delete', 'fork', 'list', 'new', 'update'],
    options: {
        browser: Boolean,
        clone: Boolean,
        color: String,
        delete: String,
        description: String,
        detailed: Boolean,
        gitignore: String,
        fork: String,
        homepage: String,
        init: Boolean,
        label: Boolean,
        list: Boolean,
        new: String,
        organization: String,
        page: String,
        per_page: String,
        private: Boolean,
        protocol: String,
        repo: String,
        type: ['all', 'forks', 'member', 'owner', 'public', 'private', 'sources'],
        update: String,
        user: String,
    },
    shorthands: {
        B: ['--browser'],
        c: ['--clone'],
        C: ['--color'],
        D: ['--delete'],
        d: ['--detailed'],
        f: ['--fork'],
        L: ['--label'],
        l: ['--list'],
        N: ['--new'],
        O: ['--organization'],
        p: ['--private'],
        P: ['--protocol'],
        r: ['--repo'],
        t: ['--type'],
        U: ['--update'],
        u: ['--user'],
    },
    payload(payload, options) {
        if (options.browser !== false) {
            options.browser = true;
        }
    },
};
Repo.TYPE_ALL = 'all';
Repo.TYPE_FORKS = 'forks';
Repo.TYPE_MEMBER = 'member';
Repo.TYPE_OWNER = 'owner';
Repo.TYPE_PRIVATE = 'private';
Repo.TYPE_PUBLIC = 'public';
Repo.TYPE_SOURCES = 'sources';
// -- Commands -------------------------------------------------------------------------------------
Repo.prototype.run = function (done) {
    const instance = this;
    const options = instance.options;
    let user = options.loggedUser;
    instance.config = config;
    if (options.browser) {
        instance.browser(options.user, options.repo);
    }
    if (options.clone) {
        hooks.invoke('repo.get', instance, afterHooksCallback => {
            if (options.organization) {
                user = options.organization;
            }
            else if (options.user) {
                user = options.user;
            }
            if (fs.existsSync(`${process.cwd()}/${options.repo}`)) {
                logger.error(`Can't clone ${logger.colors.green(`${user}/${options.repo}`)}. ${logger.colors.green(options.repo)} already exists in this directory.`);
                return;
            }
            instance.get(user, options.repo, (err1, repo) => {
                if (err1) {
                    logger.error(`Can't clone ${logger.colors.green(`${user}/${options.repo}`)}. ${JSON.parse(err1).message}`);
                    return;
                }
                logger.log(repo.html_url);
                var repoUrl;
                if (options.protocol) {
                    if (options.protocol === 'https') {
                        repoUrl = `https://github.com/${user}/${options.repo}.git`;
                    }
                }
                else {
                    repoUrl = `git@github.com:${user}/${options.repo}.git`;
                }
                if (repo) {
                    instance.clone_(user, options.repo, repoUrl);
                }
                afterHooksCallback();
            });
        });
    }
    if (options.delete && !options.label) {
        hooks.invoke('repo.delete', instance, afterHooksCallback => {
            logger.log(`Deleting repo ${logger.colors.green(`${options.user}/${options.delete}`)}`);
            if (testing) {
                return _deleteHandler(true);
            }
            inquirer
                .prompt([
                {
                    type: 'input',
                    message: 'Are you sure? This action CANNOT be undone. [y/N]',
                    name: 'confirmation',
                },
            ])
                .then(answers => _deleteHandler(answers.confirmation.toLowerCase() === 'y'));
            function _deleteHandler(proceed) {
                if (proceed) {
                    instance.delete(options.user, options.delete, err => {
                        if (err) {
                            logger.error("Can't delete repo.");
                            return;
                        }
                        afterHooksCallback();
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
        hooks.invoke('repo.fork', instance, afterHooksCallback => {
            if (options.organization) {
                user = options.organization;
            }
            options.repo = options.fork;
            logger.log(`Forking repo ${logger.colors.green(`${options.user}/${options.repo}`)} on ${logger.colors.green(`${user}/${options.repo}`)}`);
            instance.fork((err1, repo) => {
                if (err1) {
                    logger.error(`Can't fork. ${JSON.parse(err1).message}`);
                    return;
                }
                logger.log(repo.html_url);
                if (repo && options.clone) {
                    instance.clone_(options.loggedUser, options.repo, repo.ssh_url);
                }
                afterHooksCallback();
                done && done();
            });
        });
    }
    if (options.label) {
        if (options.organization) {
            user = options.organization;
        }
        else if (options.user) {
            user = options.user;
        }
        if (options.delete) {
            hooks.invoke('repo.deleteLabel', instance, afterHooksCallback => {
                options.label = options.delete;
                logger.log(`Deleting label ${logger.colors.green(options.label)} on ${logger.colors.green(`${user}/${options.repo}`)}`);
                instance.deleteLabel(user, err1 => {
                    if (err1) {
                        logger.error("Can't delete label.");
                        return;
                    }
                    afterHooksCallback();
                    done && done();
                });
            });
        }
        else if (options.list) {
            hooks.invoke('repo.listLabels', instance, afterHooksCallback => {
                if (options.page) {
                    logger.log(`Listing labels from page ${logger.colors.green(options.page)} on ${logger.colors.green(`${user}/${options.repo}`)}`);
                }
                else {
                    logger.log(`Listing labels on ${logger.colors.green(`${user}/${options.repo}`)}`);
                }
                instance.listLabels(user, err1 => {
                    if (err1) {
                        logger.error("Can't list labels.");
                        return;
                    }
                    afterHooksCallback();
                    done && done();
                });
            });
        }
        else if (options.new) {
            hooks.invoke('repo.createLabel', instance, afterHooksCallback => {
                options.label = options.new;
                logger.log(`Creating label ${logger.colors.green(options.label)} on ${logger.colors.green(`${user}/${options.repo}`)}`);
                instance.createLabel(user, err1 => {
                    if (err1) {
                        throw new Error(`Can't create label.\n${err1}`);
                    }
                    afterHooksCallback();
                    done && done();
                });
            });
        }
        else if (options.update) {
            hooks.invoke('repo.updateLabel', instance, afterHooksCallback => {
                options.label = options.update;
                logger.log(`Updating label ${logger.colors.green(options.label)} on ${logger.colors.green(`${user}/${options.repo}`)}`);
                instance.updateLabel(user, err1 => {
                    if (err1) {
                        logger.error("Can't update label.");
                        return;
                    }
                    afterHooksCallback();
                    done && done();
                });
            });
        }
    }
    if (options.list && !options.label) {
        if (options.organization) {
            user = options.organization;
            options.type = options.type || Repo.TYPE_ALL;
        }
        else {
            user = options.user;
            options.type = options.type || Repo.TYPE_OWNER;
        }
        if (options.isTTY.out) {
            logger.log(`Listing ${logger.colors.green(options.type)} repos for ${logger.colors.green(user)}`);
        }
        instance.list(user, err => {
            if (err) {
                logger.error("Can't list repos.");
            }
            done && done();
        });
    }
    if (options.new && !options.label) {
        hooks.invoke('repo.new', instance, afterHooksCallback => {
            options.repo = options.new;
            if (options.organization) {
                options.user = options.organization;
            }
            logger.log(`Creating a new repo on ${logger.colors.green(`${options.user}/${options.new}`)}`);
            instance.new((err1, repo) => {
                if (err1) {
                    logger.error(`Can't create new repo. ${JSON.parse(err1.message).message}`);
                    return;
                }
                logger.log(repo.html_url);
                if (repo && options.clone) {
                    instance.clone_(options.user, options.repo, repo.ssh_url);
                }
                afterHooksCallback();
                done && done();
            });
        });
    }
};
Repo.prototype.browser = function (user, repo) {
    !testing && openUrl(`${config.github_host}${user}/${repo}`, { wait: false });
};
Repo.prototype.clone_ = function (user, repo, repo_url) {
    logger.log(`Cloning ${logger.colors.green(`${user}/${repo}`)}`);
    git.clone(url.parse(repo_url).href, repo);
};
Repo.prototype.createLabel = function (user, opt_callback) {
    const instance = this;
    const options = instance.options;
    let payload;
    payload = {
        user,
        color: options.color,
        name: options.new,
        repo: options.repo,
    };
    console.log('payload', payload);
    base.github.issues.createLabel(payload, opt_callback);
};
Repo.prototype.delete = function (user, repo, opt_callback) {
    var payload;
    payload = {
        user,
        repo,
    };
    base.github.repos.delete(payload, opt_callback);
};
Repo.prototype.deleteLabel = function (user, opt_callback) {
    const instance = this;
    const options = instance.options;
    let payload;
    payload = {
        user,
        name: options.delete,
        repo: options.repo,
    };
    base.github.issues.deleteLabel(payload, opt_callback);
};
Repo.prototype.get = function (user, repo, opt_callback) {
    var payload;
    payload = {
        user,
        repo,
    };
    base.github.repos.get(payload, opt_callback);
};
Repo.prototype.list = function (user, opt_callback) {
    const instance = this;
    let method = 'getFromUser';
    const options = instance.options;
    let payload;
    payload = {
        user,
        type: options.type,
        per_page: 100,
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
            logger.error('You can only list your own public and private repos.');
            return;
        }
    }
    base.github.repos[method](payload, (err, repos) => {
        instance.listCallback_(err, repos, opt_callback);
    });
};
Repo.prototype.listCallback_ = function (err, repos, opt_callback) {
    const instance = this;
    const options = instance.options;
    let pos;
    let repo;
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
                    logger.log(`last update ${logger.getDuration(repo.updated_at)}`);
                }
                if (options.isTTY.out) {
                    logger.log(`${logger.colors.green(`forks: ${repo.forks}, stars: ${repo.watchers}, issues: ${repo.open_issues}`)}\n`);
                }
            }
        }
        opt_callback && opt_callback(err);
    }
};
Repo.prototype.listLabels = function (user, opt_callback) {
    const instance = this;
    const options = instance.options;
    let payload;
    payload = {
        user,
        page: options.page,
        per_page: options.per_page,
        repo: options.repo,
    };
    base.github.issues.getLabels(payload, (err, labels) => {
        instance.listLabelsCallback_(err, labels, opt_callback);
    });
};
Repo.prototype.listLabelsCallback_ = function (err, labels, opt_callback) {
    const instance = this;
    const options = instance.options;
    if (err && !options.all) {
        logger.error(logger.getErrorMessage(err));
    }
    if (labels && labels.length > 0) {
        labels.forEach(label => {
            logger.log(logger.colors.yellow(label.name));
        });
        opt_callback && opt_callback(err);
    }
};
Repo.prototype.fork = function (opt_callback) {
    const instance = this;
    const options = instance.options;
    let payload;
    payload = {
        user: options.user,
        repo: options.repo,
    };
    if (options.organization) {
        payload.organization = options.organization;
    }
    base.github.repos.fork(payload, opt_callback);
};
Repo.prototype.new = function (opt_callback) {
    const instance = this;
    const options = instance.options;
    let payload;
    let method = 'create';
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
        private: options.private,
    };
    if (options.organization) {
        method = 'createFromOrg';
        payload.org = options.organization;
    }
    base.github.repos[method](payload, opt_callback);
};
Repo.prototype.updateLabel = function (user, opt_callback) {
    const instance = this;
    const options = instance.options;
    let payload;
    payload = {
        user,
        color: options.color,
        name: options.update,
        repo: options.repo,
    };
    base.github.issues.updateLabel(payload, opt_callback);
};
