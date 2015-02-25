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
    child_process = require('child_process'),
    spawn = child_process.spawn,
    git_command = process.env.GH_GIT_COMMAND || 'git';

exports.checkout = function(branch, opt_newBranch, opt_callback) {
    var args;

    args = [branch];

    if (opt_newBranch) {
        args.push('-B', opt_newBranch);
    }

    exports.exec('checkout', args, function(err, data) {
        opt_callback && opt_callback(err, data);
    });
};

exports.clone = function(url, folder) {
    var git,
        args = ['clone', url, folder];

    git = child_process.spawn(git_command,
        exports.deleteArrayEmptyValues_(args), {
            stdio: ['pipe', process.stdout, process.stderr]
    });
};

exports.countUserAdjacentCommits = function(opt_callback) {
    var skip = 0,
        counter = [0],
        myUser = exports.getConfig('user.name');

    exports.countUserAdjacentCommits_(opt_callback, skip, myUser, counter);
};

exports.countUserAdjacentCommits_ = function(opt_callback, skip, myUser, counter) {
    skip = skip || 0;

    exports.exec('log', ['-1', '--skip=' + skip, '--pretty="%an"'], function(err, user) {
        if (myUser === user.trim()) {
            skip++;
            counter[0]++;
            exports.countUserAdjacentCommits_(opt_callback, skip, myUser, counter);
            return;
        }

        opt_callback(err, counter[0]);
    });
};

exports.deleteArrayEmptyValues_ = function(values) {
    return values.filter(function(value) {
        return value !== '';
    });
};

exports.exec = function(cmd, args, opt_callback) {
    var git;

    args.unshift(cmd);

    git = spawn(git_command, exports.deleteArrayEmptyValues_(args), {
        stdio: ['pipe', process.stdout, process.stderr]
    });

    git.on('close', opt_callback);
};

exports.findRoot = function() {
    return exec.spawnSync(git_command, ['rev-parse', '--show-toplevel']).stdout;
};

exports.getCommitMessage = function(opt_branch, opt_number) {
    var git = exec.spawnSync(git_command,
        ['log', '-' + opt_number,
        '--first-parent', '--no-merges', '--pretty=%s',
        opt_branch || '']);

    opt_number = opt_number || 1;

    if (git.status !== 0) {
        throw new Error('Can\'t retrieve commit message.');
    }

    return git.stdout;
};

exports.getConfig = function(key) {
    var git = exec.spawnSync(git_command, ['config', '--get', key]);

    if (git.status !== 0) {
        throw new Error('No git config found for ' + key + '\n');
    }

    return git.stdout;
};

exports.getCurrentBranch = function() {
    var git = exec.spawnSync(git_command, ['symbolic-ref', 'HEAD']);

    if (git.status !== 0) {
        return;
    }

    return git.stdout.substring(git.stdout.lastIndexOf('/') + 1);
};

exports.getLastCommitMessage = function(opt_branch) {
    return exports.getCommitMessage(opt_branch, 1);
};

exports.getLastCommitSHA = function() {
    var git = exec.spawnSync(git_command, ['rev-parse', '--short', 'HEAD']);

    if (git.status !== 0) {
        throw new Error('Can\'t retrieve last commit.');
    }

    return git.stdout;
};

exports.getRemoteUrl = function(remote) {
    try {
        return exports.getConfig('remote.' + remote + '.url');
    }
    catch(e) {
        return;
    }
};

exports.getRepoFromRemoteURL = function(url) {
    var parsed = exports.parseRemoteUrl(url);

    return parsed && parsed[1];
};

exports.getUserFromRemoteUrl = function(url) {
    var parsed = exports.parseRemoteUrl(url);

    return parsed && parsed[0];
};

exports.getRepo = function(remote) {
    return exports.getRepoFromRemoteURL(exports.getRemoteUrl(remote));
};

exports.getUser = function(remote) {
    return exports.getUserFromRemoteUrl(exports.getRemoteUrl(remote));
};

exports.merge = function(branch, rebase, abort, opt_callback) {
    var type;

    type = rebase ? 'rebase' : 'merge';

    exports.exec(type, [branch], function(err, data) {
        if (err) {
            console.log(data);

            if (abort) {
                exports.exec(type, ['--abort'], function() {
                    logger.error('unable to ' + type);
                });
            }
            return;
        }
        opt_callback && opt_callback(err, data);
    });
};

exports.parseRemoteUrl = function(url) {
    var parsed = /[\/:]([\w-]+)\/(.*?)(?:\.git)?$/.exec(url);

    if (parsed) {
        parsed.shift();
    }

    return parsed;
};
