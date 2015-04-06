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
    semver = require('semver'),
    version = rewire('../lib/cmds/version');

describe('Version Module Tests', function() {
    it('should load Version', function() {
        assert.doesNotThrow(function() {
            assert(typeof new version.Impl() === 'object');
        });
    });

    it('should print versions', function() {
        var loggerMock = {
            log: function(message) {
                var parts = message.split(' ');

                assert.strictEqual(parts.length, 2);
                assert.strictEqual(parts[0].slice(0, 2), 'gh');
                assert(semver.valid(parts[1]) !== null);
            }
        };

        version.__set__("logger", loggerMock);

        new version.Impl().run();
    });
});
