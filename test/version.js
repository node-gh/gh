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
    version = rewire('../lib/cmds/version');

describe('Version Module Tests', function () {
    it('should load Version', function () {
        assert.doesNotThrow(function () {
            assert(typeof new version.Impl() === 'object');
        });
    });

    it('should print versions', function () {
        var pkgMock,
            baseMock,
            loggerMock;

        pkgMock = {
            name: 'gh',
            version: '0.0.1'
        };

        baseMock = {
            asyncReadPackages: function (callback) {
                callback(pkgMock);
            }
        };

        loggerMock = {
            log: function (message) {
                var parts = message.split(' ');

                assert.strictEqual(parts.length, 2);
                assert.strictEqual(parts[0], 'gh');
                assert.strictEqual(parts[1], pkgMock.version);
            }
        };

        version.__set__('base', baseMock);
        version.__set__('logger', loggerMock);

        new version.Impl().run();
    });
});
