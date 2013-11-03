/*
 * Copyright 2013, All Rights Reserved.
 *
 * Code licensed under the BSD License:
 * https://github.com/node-gh/gh/blob/master/LICENSE.md
 *
 * @author Rodrigo Vidal <rodrigovidal777@gmail.com>
 * @author Zeno Rocha <zno.rocha@gmail.com>
 */

'use strict';

// -- Requires -------------------------------------------------------------------------------------

var assert = require('assert'),
    git = require('../lib/git');

// -- Suites ---------------------------------------------------------------------------------------

describe('Git Module Tests', function() {
    describe('Function parseRemoteUrl', function() {
        describe('ssh clone url', function() {
            it('should parse remote url with score on repo name', function() {
                var p = git.parseRemoteUrl(
                    'git@github.com:eduardolundgren/node-gh.git');

                assert.equal('eduardolundgren', p[0]);
                assert.equal('node-gh', p[1]);
            });

            it('should parse remote url with score on username', function() {
                var p = git.parseRemoteUrl(
                    'git@github.com:elixir-lang/elixir.git');

                assert.equal('elixir-lang', p[0]);
                assert.equal('elixir', p[1]);
            });
        });

        describe('https clone url', function() {
            it('should parse remote url with score on repo name', function() {
                var p = git.parseRemoteUrl(
                    'https://github.com/eduardolundgren/node-gh.git');

                assert.equal('eduardolundgren', p[0]);
                assert.equal('node-gh', p[1]);
            });

            it('should parse remote url with score on username', function() {
                var p = git.parseRemoteUrl(
                    'https://github.com/elixir-lang/elixir.git');

                assert.equal('elixir-lang', p[0]);
                assert.equal('elixir', p[1]);
            });
        });
    });
});
