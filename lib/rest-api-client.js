'use strict';

var request = require('request');
var http = require('http');
var url = require('url');
var lodash = require('lodash');
var logger = require('./logger');

class RestApiClient {
    constructor (options) {
        options = lodash.merge(this.DEFAULT_CONFIG, options);
        this.options = options;
    }

    encode () {
        return encodeURIComponent.apply(this, arguments);
    }

    url (pathname, query) {
        let options = this.options;
        let uri = url.format({
            protocol: options.protocol,
            hostname: options.host,
            port: options.port,
            pathname: options.base + pathname,
            query: query
        });

        return decodeURIComponent(uri);
    }

    authorize (p) {
        let options = this.options;

        if (p.oauth) {
            p.oauth = options.oauth;
            return;
        }

        if (typeof options.user === 'string') {
            p.auth = {
                'user': options.user,
                'pass': options.password
            };
        }
    }

    request (method, path, params) {
        if (typeof path === 'object') {
            let args = Array.from(path);
            args.unshift(method);
            return this.request.apply(this, args);
        }

        let options = this.options;

        let p = {
            strictSSL: options.strictSSL,
            method: method,
            uri: this.url(path),
            json: true,
            followAllRedirects: true
        };

        if (params) {
            p = lodash.merge(p, params);
        }

        this.authorize(p);

        let id = Math.floor((Math.random() * 10000000));
        let begin = new Date().getTime();

        return new Promise((resolve, reject) => {
            logger.debug('New request #' + id + ' started at ' + begin + ':\n' +
                method + ' ' + p.uri);
            logger.insane(p);
            request(p, (error, response) => {
                let end = new Date().getTime();
                logger.debug('End of request #' + id + ' at ' + end + ' (' + (end - begin) + 'ms)' +
                    ' with status code: ' + (response && response.statusCode));

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

                if (response.statusCode < 200 || response.statusCode >= 300) {
                    reject({
                        error: response.statusCode + ' ' + http.STATUS_CODES[response.statusCode],
                        code: response.statusCode,
                        msg: http.STATUS_CODES[response.statusCode],
                        response
                    });
                    return;
                }

                resolve(response);
            });
        });
    }

    get () {
        return this.request('GET', arguments);
    }

    post () {
        return this.request('POST', arguments);
    }

    put () {
        return this.request('PUT', arguments);
    }

    delete () {
        return this.request('DELETE', arguments);
    }

}

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
