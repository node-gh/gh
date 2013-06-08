/*
 * Copyright 2013 Eduardo Lundgren, All Rights Reserved.
 *
 * Code licensed under the BSD License:
 * https://github.com/eduardolundgren/blob/master/LICENSE.md
 *
 * @author Eduardo Lundgren <eduardolundgren@gmail.com>
 */

var base = require('./base'),
    git = require('git-wrapper'),
    toArray;

toArray = Array.prototype.slice;

exports.git = new git();

exports.checkout = function(branch, opt_newBranch, opt_callback) {
    var args;

    args = [ branch ];

    if (opt_newBranch && opt_newBranch != null) {
        args.push('-B', opt_newBranch);
    }

    exports.exec('checkout', args, function(err, data) {
        opt_callback && opt_callback(err, data);
    });
};

exports.exec = function() {
    var args;

    args = toArray.call(arguments);

    if (typeof args[args.length - 1] !== 'function') {
        args.push(function() {});
    }

    exports.git.exec.apply(exports.git, args);
};

exports.findRoot = function(opt_callback) {
    exports.exec('rev-parse', ['--show-toplevel'], function(err, data) {
        opt_callback(err, data.trim());
    });
};

exports.getConfig = function(key, opt_callback) {
    exports.exec('config', ['--get', key], function(err, data) {
        if (opt_callback) opt_callback(err, data.trim());
    });
};

exports.getCurrentBranch = function(opt_callback) {
    exports.exec('symbolic-ref', ['HEAD'], function(err, data) {
        data = data.substring(data.lastIndexOf('/') + 1);
        opt_callback(err, data.trim());
    });
};

exports.getRemoteUrl = function(remote, opt_callback) {
    exports.getConfig('remote.' + remote + '.url', opt_callback);
};

exports.getAllCheckoutedBranches = function(opt_callback) {
    exports.exec('branch', ['-l'], function(err, data) {
        var dataSplit = data.split('\n');
        var name;
        var branches = {};
        for (var i = 0; i< dataSplit.length; i++) {
            name = dataSplit[i].trim();
            if (name.substring(0,1) == '*') {
                name = name.substring(2);
                branches['*'] = name;
            }
            branches[name] = name;
        }
        opt_callback(err, branches);
    });
}

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

    exports.exec(type, [ branch ], function(err, data) {
        if (err) {
            console.log(data);

            if (abort && abort != null) {
                exports.exec(type, [ '--abort' ], function() {
                    base.logger.error('unable to ' + type);
                });
            }
            return;
        }
        opt_callback && opt_callback(err, data);
    });
};

exports.parseRemoteUrl = function(url) {
    var parsed = /[\/:](\w+)\/(.*?)(?:\.git)?$/.exec(url);

    if (parsed) {
        parsed.shift();
    }

    return parsed;
};

exports.getFlowFindName = function(type,branchToFind, opt_callback) {
    exports.getConfig('gitflow.'+type+'.' + branchToFind, opt_callback);
};

exports.createBranch= function(branchName,opt_callback) {
    var args = [ branchName ];
    exports.exec('branch', args, opt_callback);
};

exports.removeBranch = function(branchName,opt_callback) {
    var args = [ '-D',branchName ];
    exports.exec('branch', args, opt_callback);
}