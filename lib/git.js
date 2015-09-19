/*
 * Copyright 2013-2015, All Rights Reserved.
 *
 * Code licensed under the BSD License:
 * https://github.com/node-gh/gh/blob/master/LICENSE.md
 *
 * @author Eduardo Lundgren <edu@rdo.io>
 */

'use strict';

var logger = require('./logger'),
    exec = require('./exec'),
    git_command = process.env.GH_GIT_COMMAND || 'git';

exports.checkout = function (branch, newBranch) {
    var args = ['checkout', branch];

    if (newBranch) {
        args.push('-B', newBranch);
    }

    return exec.spawnSyncStream(git_command, args);
};

exports.clone = function (url, folder) {
    var args = ['clone', url];

    if (folder) {
        args.push(folder);
    }

    return exec.spawnSyncStream(git_command, args);
};

exports._merge = function (branch, type) {
    var res;

    try {
        res = exec.spawnSyncStream(git_command, [type, branch]);
    } catch(err) {
        if (err.code && err.code !== 0) {
            exec.spawnSyncStream(git_command, [type, '--abort']);
            throw err;
        }
    }
};

exports.merge = function (branch) {
    return this._merge(branch, 'merge');
};

exports.rebase = function (branch) {
    return this._merge(branch, 'rebase');
};

exports.push = function (remote, branch) {
    var args = ['push', remote];

    if (branch) {
        args.push(branch);
    }

    return exec.spawnSyncStream(git_command, args);
};

exports.fetch = function (repoUrl, headBranch, pullBranch) {
    var args = ['fetch', repoUrl, headBranch + ':' + pullBranch];

    return exec.spawnSyncStream(git_command, args);
};

exports.countUserAdjacentCommits = function () {
    var git,
        params,
        commits = 0,
        user = exports.getConfig('user.name'),
        author;

    do {
        params = ['log', '-1', '--skip=' + commits, '--pretty=%an'];
        git = exec.spawnSync(git_command, params);

        if (git.status !== 0) {
            logger.error(git.stderr);
        }

        author = git.stdout;

        commits += 1;
    } while (author === user);

    commits -= 1;

    return commits;
};

exports.deleteBranch = function (branch) {
    var git = exec.spawnSync(git_command, ['branch', '-d', branch]);

    if (git.status !== 0) {
        logger.debug(git.stderr);
    }

    return git.stdout;
};

exports.findRoot = function () {
    return exec.spawnSync(git_command, ['rev-parse', '--show-toplevel']).stdout;
};

exports.getCommitMessage = function (branch, number) {
    var git,
        params = ['log'];

    if (!number) {
        number = 1;
    }

    params.push('-' + number, '--first-parent', '--no-merges', '--pretty=%s');

    if (branch) {
        params.push(branch);
    }

    params.push('--');

    git = exec.spawnSync(git_command, params);

    if (git.status !== 0) {
        logger.debug('Can\'t get commit message.');
        return;
    }

    return git.stdout;
};

exports.getConfig = function (key) {
    var git = exec.spawnSync(git_command, ['config', '--get', key]);

    if (git.status !== 0) {
        throw new Error('No git config found for ' + key + '\n');
    }

    return git.stdout;
};

exports.getCurrentBranch = function () {
    var git = exec.spawnSync(git_command, ['symbolic-ref', '--short', 'HEAD']);

    if (git.status !== 0) {
        logger.debug('Can\'t get current branch.');
        return;
    }

    return git.stdout;
};

exports.getLastCommitMessage = function (branch) {
    return exports.getCommitMessage(branch, 1);
};

exports.getLastCommitSHA = function () {
    var git = exec.spawnSync(git_command, ['rev-parse', '--short', 'HEAD']);

    if (git.status !== 0) {
        throw new Error('Can\'t retrieve last commit.');
    }

    return git.stdout;
};

exports.getRemoteUrl = function (remote) {
    try {
        return exports.getConfig('remote.' + remote + '.url');
    }
    catch(e) {
        logger.debug('Can\'t get remote URL.');
        return;
    }
};

exports.getRepoFromRemoteURL = function (url) {
    var parsed = exports.parseRemoteUrl(url);

    return parsed && parsed[1];
};

exports.getUserFromRemoteUrl = function (url) {
    var parsed = exports.parseRemoteUrl(url);

    return parsed && parsed[0];
};

exports.getRepo = function (remote) {
    return exports.getRepoFromRemoteURL(exports.getRemoteUrl(remote));
};

exports.getUser = function (remote) {
    return exports.getUserFromRemoteUrl(exports.getRemoteUrl(remote));
};

exports.parseRemoteUrl = function (url) {
    var parsed = /[\/:]([\w-]+)\/(.*?)(?:\.git)?$/.exec(url);

    if (parsed) {
        parsed.shift();
    }

    return parsed;
};
