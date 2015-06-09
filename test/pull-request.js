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
    pullRequestsInfo = require('./fixture/pull-request-info.json');

describe('Pull Requests Module Tests', function() {
    it('should fail to get pull request', function() {
        var pr = new pullRequest.Impl({
            repo: 'senna.js'
        });

        pullRequest.__with__({
            'logger.log': function() {
                assert.fail('Expected test to fail.');
            },
            'logger.warn': function() {
            },
            base: {
                github: {
                    pullRequests: {
                        get: function(payload, callback) {
                            callback(new Error('Should fail to get pull request.'), undefined);
                        }
                    }
                }
            }
        })(function() {
            pr.get('liferay', 'senna.js', '36');
        });
    });

    it('should get pull request', function() {
        var pr = new pullRequest.Impl({
            repo: 'senna.js'
        });

        pullRequest.__with__({
            'logger.log': function() {
            },
            'logger.warn': function() {
                assert.fail('Expected test to pass.');
            },
            base: {
                github: {
                    pullRequests: {
                        get: function(payload, callback) {
                            callback(undefined, pullRequestsInfo);
                        }
                    }
                }
            }
        })(function() {
            pr.get('liferay', 'senna.js', '36');
        });
    });
});
