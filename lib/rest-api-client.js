"use strict";
/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: CONTRIBUTORS)
 * SPDX-License-Identifier: BSD-3-Clause
 */
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
const lodash_1 = require("lodash");
const request = require("request");
const url = require("url");
const logger = require("./logger");
class RestApiClient {
    constructor(options) {
        this.DEFAULT_CONFIG = {
            protocol: 'https',
            host: 'localhost',
            port: '443',
            user: 'user',
            password: 'password',
            base: '',
            strictSSL: true,
        };
        options = lodash_1.merge(this.DEFAULT_CONFIG, options);
        this.options = options;
    }
    encode() {
        return encodeURIComponent.apply(this, arguments);
    }
    url(pathname, query) {
        const options = this.options;
        const uri = url.format({
            query,
            hostname: options.host,
            pathname: options.base + pathname,
            port: options.port,
            protocol: options.protocol,
        });
        return decodeURIComponent(uri);
    }
    authorize(p) {
        const options = this.options;
        if (p.oauth) {
            p.oauth = options.oauth;
            return;
        }
        if (typeof options.user === 'string') {
            p.auth = {
                user: options.user,
                pass: options.password,
            };
        }
    }
    request(method, path, params) {
        if (typeof path === 'object') {
            let args = Array.from(path);
            args.unshift(method);
            return this.request.apply(this, args);
        }
        let options = this.options;
        let p = {
            method,
            strictSSL: options.strictSSL,
            uri: this.url(path),
            json: true,
            followAllRedirects: true,
        };
        if (params) {
            p = lodash_1.merge(p, params);
        }
        this.authorize(p);
        let id = Math.floor(Math.random() * 10000000);
        let begin = new Date().getTime();
        return new Promise((resolve, reject) => {
            logger.debug(`New request #${id} started at ${begin}:\n${method} ${p.uri}`);
            logger.insane(p);
            request(p, (error, response) => {
                let end = new Date().getTime();
                logger.debug(`End of request #${id} at ${end} (${end -
                    begin}ms) with status code: ${response && response.statusCode}`);
                if (response) {
                    logger.insane('Response headers:');
                    logger.insane(response.headers);
                    logger.debug('Response body');
                    logger.debug(response.body);
                }
                if (error) {
                    reject(error);
                    return;
                }
                if (response.statusCode < 200 || response.statusCode > 399) {
                    reject({
                        response,
                        error: `${response.statusCode} ${http.STATUS_CODES[response.statusCode]}`,
                        code: response.statusCode,
                        msg: http.STATUS_CODES[response.statusCode],
                    });
                    return;
                }
                resolve(response);
            });
        });
    }
    get() {
        return this.request('GET', arguments);
    }
    post() {
        return this.request('POST', arguments);
    }
    put() {
        return this.request('PUT', arguments);
    }
    delete() {
        return this.request('DELETE', arguments);
    }
}
module.exports = RestApiClient;
