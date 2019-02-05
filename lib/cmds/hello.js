"use strict";
/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: CONTRIBUTORS)
 * SPDX-License-Identifier: BSD-3-Clause
 */
Object.defineProperty(exports, "__esModule", { value: true });
// -- Requires -------------------------------------------------------------------------------------
const logger = require("../logger");
// -- Constructor ----------------------------------------------------------------------------------
function Hello(options) {
    this.options = options;
}
exports.default = Hello;
// -- Constants ------------------------------------------------------------------------------------
Hello.DETAILS = {
    alias: 'he',
    description: 'Hello world example. Copy to start a new command.',
    commands: ['world'],
    options: {
        world: Boolean,
    },
    shorthands: {
        w: ['--world'],
    },
    payload(payload, options) {
        options.world = true;
    },
};
// -- Commands -------------------------------------------------------------------------------------
Hello.prototype.run = function () {
    const instance = this;
    const options = instance.options;
    if (options.world) {
        instance.world();
    }
};
Hello.prototype.world = function () {
    logger.log('hello world :)');
};
