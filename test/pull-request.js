/*
 * Copyright 2013-2015, All Rights Reserved.
 *
 * Code licensed under the BSD License:
 * https://github.com/node-gh/gh/blob/master/LICENSE.md
 *
 * @author Henrique Vicente <henriquevicente@gmail.com>
 */

'use strict';

var rewire = require('rewire'),
    assert = require('assert'),
    pullRequest = rewire('../lib/cmds/pull-request'),
    pullRequestsUnstable = require('./fixture/pull-request-unstable.json'),
    pullRequestsInfo = require('./fixture/pull-request-info.json');

describe('Pull Requests Module Tests', function () {
    it('should fail to get pull request', function () {
        var pr = new pullRequest.Impl({
            repo: 'senna.js'
        });

        pullRequest.__with__({
            'logger.log': function () {
                assert.fail('Expected test to fail.');
            },
            'logger.warn': function () {
            },
            base: {
                github: {
                    pullRequests: {
                        get: function (payload, callback) {
                            callback(new Error('Should fail to get pull request.'), undefined);
                        }
                    }
                }
            }
        })(function () {
            pr.get('liferay', 'senna.js', '36');
        });
    });

    it('should get pull request with mergeable state clean', function () {
        var cleanLogFound = false,
            pr = new pullRequest.Impl({
                repo: 'senna.js'
            });

        pr.options.info = true;

        pullRequest.__with__({
            'logger.log': function () {
                // only evaluate that the clean has a green log message
                if (arguments[0].indexOf('clean') > 1) {
                    cleanLogFound = true;

                    assert.strictEqual(arguments[0], '\u001B[32mMergeable (clean)\u001b[39m');
                }
            },
            'logger.warn': function () {
                assert.fail('Expected test to pass.');
            },
            base: {
                github: {
                    pullRequests: {
                        get: function (payload, callback) {
                            callback(undefined, pullRequestsInfo);
                        }
                    }
                }
            }
        })(function () {
            pr.get('liferay', 'senna.js', '36');
        });

        if (cleanLogFound === false) {
            assert.fail('Clean log was not found.');
        }
    });

    it('should get pull request with mergeable state unstable', function () {
        var pr = new pullRequest.Impl({
            repo: 'senna.js'
        });

        pr.options.info = true;

        pullRequest.__with__({
            'logger.log': function () {
            },
            'logger.warn': function () {
                assert.strictEqual(arguments[0], '\u001B[31mNot mergeable (unstable)\u001b[39m');
            },
            base: {
                github: {
                    pullRequests: {
                        get: function (payload, callback) {
                            callback(undefined, pullRequestsUnstable);
                        }
                    }
                }
            }
        })(function () {
            pr.get('liferay', 'senna.js', '78');
        });
    });
});
