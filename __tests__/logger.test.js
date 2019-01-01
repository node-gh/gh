/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: CONTRIBUTORS)
 * SPDX-License-Identifier: BSD-3-Clause
 */

'use strict'

const rewire = require('rewire')
const assert = require('assert')
const logger = rewire('../lib/logger')

describe('Logger Module Tests', function() {
    it('should log debug', function() {
        logger.debug('message ignored')
        logger.__with__({
            console: {
                log: function() {
                    assert.fail(arguments)
                },
            },
        })(function() {
            logger.debug('messages')
        })

        logger.__with__({
            process: {
                env: {
                    GH_VERBOSE: true,
                },
            },
            console: {
                log: function() {
                    assert.strictEqual(arguments.length, 1)
                    assert.strictEqual(arguments[0], 'DEBUG: help')
                },
            },
        })(function() {
            logger.debug('help')
        })
    })

    it('should log errors', function() {
        logger.__with__({
            process: {
                exit: function() {
                    assert.strictEqual(arguments.length, 1)
                    assert.strictEqual(arguments[0], 1)
                },
            },
            console: {
                error: function() {
                    assert.strictEqual(arguments.length, 1)
                    assert.strictEqual(arguments[0], 'fatal: help')
                },
            },
        })(function() {
            logger.error('help')
        })
    })

    it('should log warnings', function() {
        logger.__with__({
            console: {
                error: function() {
                    assert.strictEqual(arguments.length, 1)
                    assert.strictEqual(arguments[0], 'warning: help')
                },
            },
        })(function() {
            logger.warn('help')
        })
    })

    it('should log', function() {
        logger.__with__({
            console: {
                log: function() {
                    assert.strictEqual(arguments.length, 1)
                    assert.strictEqual(arguments[0], 'help')
                },
            },
        })(function() {
            logger.log('help')
        })
    })

    describe('color logging', function() {
        it('should log colored', function() {
            logger.__with__({
                console: {
                    log: function() {
                        assert.strictEqual(arguments.length, 1)
                        assert.strictEqual(arguments[0], 'help')
                    },
                },
            })(function() {
                process.argv.push('--no-color')
                logger.colors.green('help')
            })
        })

        it("shouldn't log colored", function() {
            logger.__with__({
                console: {
                    log: function() {
                        assert.strictEqual(arguments.length, 1)
                        assert.strictEqual(arguments[0], 'help')
                    },
                },
            })(function() {
                logger.colors.green('help')
            })
        })
    })
})
