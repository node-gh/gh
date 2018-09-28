/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: CONTRIBUTORS)
 * SPDX-License-Identifier: BSD-3-Clause
 */

'use strict';

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function');
    }
}

var _request = require('request');
var http = require('http');
var _url = require('url');
var _ = require('lodash');
var logger = require('./logger');

var RestApiClient = function () {
    function RestApiClient(options) {
        _classCallCheck(this, RestApiClient);

        options = _.merge(this.DEFAULT_CONFIG, options);
        this.options = options;
    }

    RestApiClient.prototype.encode = function encode() {
        return encodeURIComponent.apply(this, arguments);
    };

    RestApiClient.prototype.url = function url(pathname, query) {
        var options = this.options;
        var uri = _url.format({
            protocol: options.protocol,
            hostname: options.host,
            port: options.port,
            pathname: options.base + pathname,
            query: query
        });

        return decodeURIComponent(uri);
    };

    RestApiClient.prototype.authorize = function authorize(p) {
        var options = this.options;

        if (p.oauth) {
            p.oauth = options.oauth;
            return;
        }

        if (typeof options.user === 'string') {
            p.auth = {
                user: options.user,
                pass: options.password
            };
        }
    };

    RestApiClient.prototype.request = function request(method, path, params) {
        if (typeof path === 'object') {
            var args = Array.from(path);
            args.unshift(method);
            return this.request.apply(this, args);
        }

        var options = this.options;

        var p = {
            strictSSL: options.strictSSL,
            method: method,
            uri: this.url(path),
            json: true,
            followAllRedirects: true
        };

        if (params) {
            p = _.merge(p, params);
        }

        this.authorize(p);

        var id = Math.floor(Math.random() * 10000000);
        var begin = new Date().getTime();

        return new Promise(function (resolve, reject) {
            logger.debug('New request #' + id + ' started at ' + begin + ':\n' + method + ' ' + p.uri);
            logger.insane(p);
            _request(p, function (error, response) {
                var end = new Date().getTime();
                logger.debug('End of request #' + id + ' at ' + end + ' (' + (end - begin) + 'ms)' + ' with status code: ' + (response && response.statusCode));

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
                        error: response.statusCode + ' ' + http.STATUS_CODES[response.statusCode],
                        code: response.statusCode,
                        msg: http.STATUS_CODES[response.statusCode],
                        response: response
                    });
                    return;
                }

                resolve(response);
            });
        });
    };

    RestApiClient.prototype.get = function get() {
        return this.request('GET', arguments);
    };

    RestApiClient.prototype.post = function post() {
        return this.request('POST', arguments);
    };

    RestApiClient.prototype.put = function put() {
        return this.request('PUT', arguments);
    };

    RestApiClient.prototype['delete'] = function _delete() {
        return this.request('DELETE', arguments);
    };

    return RestApiClient;
}();

RestApiClient.prototype.DEFAULT_CONFIG = {
    protocol: 'https',
    host: 'localhost',
    port: '443',
    user: 'user',
    password: 'password',
    base: '',
    // oauth: undefined,
    strictSSL: true
};

module.exports = RestApiClient;
