/*
 * Copyright 2013, All Rights Reserved.
 *
 * Code licensed under the BSD License:
 * https://github.com/node-gh/gh/blob/master/LICENSE.md
 *
 * @author Eduardo Lundgren <eduardolundgren@gmail.com>
 */

'use strict';

var base = require('./base'),
    spawn = require('child_process').spawn,
    config = base.getConfig();

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

exports.clone = function(url, folder, opt_callback) {
    exports.exec('clone', [url, folder], function(err, data) {
        opt_callback(err, data.trim());
    });
};

exports.countUserAdjacentCommits = function(opt_callback) {
    var skip = 0,
        counter = [0];

    exports.getConfig('user.name', function(err, myUser) {
        exports.countUserAdjacentCommits_(opt_callback, skip, myUser, counter);
    });
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

exports.exec = function(cmd, args, opt_callback, opt_log) {
    var buf = '',
        errbuf = '',
        git;

    args.unshift(cmd);

    git = spawn(config.git_command, exports.deleteArrayEmptyValues_(args));

    git.stdout.on('data', function(data) {
        buf += data;
        if (opt_log) {
            console.log(data.toString());
        }
    });

    git.stderr.on('data', function(data) {
        errbuf += data;
        if (opt_log) {
            console.log(data.toString());
        }
    });

    git.on('close', function(err) {
        opt_callback && opt_callback(err, err ? errbuf : buf);
    });
};

exports.findRoot = function(opt_callback) {
    exports.exec('rev-parse', ['--show-toplevel'], function(err, data) {
        opt_callback(err, data.trim());
    });
};

exports.getCommitMessage = function(opt_branch, opt_number, opt_callback) {
    opt_number = opt_number || 1;

    exports.exec(
        'log', ['-' + opt_number, '--first-parent', '--no-merges', '--pretty=%s', opt_branch || ''],
        function(err, data) {
            opt_callback(err, data.trim());
        });
};

exports.getConfig = function(key, opt_callback) {
    exports.exec('config', ['--get', key], function(err, data) {
        opt_callback(err, data.trim());
    });
};

exports.getCurrentBranch = function(opt_callback) {
    exports.exec('symbolic-ref', ['HEAD'], function(err, data) {
        data = data.substring(data.lastIndexOf('/') + 1);
        opt_callback(err, data.trim());
    });
};

exports.getLastCommitMessage = function(opt_branch, opt_callback) {
    exports.getCommitMessage(opt_branch, 1, opt_callback);
};

exports.getLastCommitSHA = function(opt_callback) {
    exports.exec('rev-parse', ['--short', 'HEAD'], function(err, data) {
        opt_callback(err, data.trim());
    });
};

exports.getRemoteUrl = function(remote, opt_callback) {
    exports.getConfig('remote.' + remote + '.url', opt_callback);
};

exports.getRepoFromRemoteURL = function(url) {
    var parsed = exports.parseRemoteUrl(url);

    return parsed && parsed[1];
};

exports.getUserFromRemoteUrl = function(url) {
    var parsed = exports.parseRemoteUrl(url);

    return parsed && parsed[0];
};

exports.getRepo = function(remote, opt_callback) {
    exports.getRemoteUrl(remote, function(err, data) {
        opt_callback(err, exports.getRepoFromRemoteURL(data));
    });
};

exports.getUser = function(remote, opt_callback) {
    exports.getRemoteUrl(remote, function(err, data) {
        opt_callback(err, exports.getUserFromRemoteUrl(data));
    });
};

exports.merge = function(branch, rebase, abort, opt_callback) {
    var type;

    type = rebase ? 'rebase' : 'merge';

    exports.exec(type, [branch], function(err, data) {
        if (err) {
            console.log(data);

            if (abort) {
                exports.exec(type, ['--abort'], function() {
                    base.logger.error('unable to ' + type);
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
