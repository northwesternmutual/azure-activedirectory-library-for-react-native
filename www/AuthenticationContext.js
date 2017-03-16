// Copyright (c) Northwestern Mutual.  All rights reserved.  Licensed under the Apache License, Version 2.0.  See License.txt in the project root for license information.

// Copyright (c) Microsoft Open Technologies, Inc.  All rights reserved.  Licensed under the Apache License, Version 2.0.  See License.txt in the project root for license information.

/*global module, require*/

import { NativeModules } from 'react-native';
var reactNativeAdalPlugin = NativeModules.ReactNativeAdalPlugin;

var AuthenticationResult = require('./AuthenticationResult');
var TokenCache = require('./TokenCache');

/**
 * Constructs context to use with known authority to get the token. It reuses existing context
 * for this authority URL in native proxy or creates a new one if it doesn't exists.
 * Corresponding native context will be created at first time when it will be needed.
 *
 * @param   {String}  authority         Authority url to send code and token requests
 * @param   {Boolean} validateAuthority Validate authority before sending token request
 *                                      When context is being created syncronously using this constructor
 *                                      validateAuthority in native context will be disabled to prevent
 *                                      context initialization failure
 *
 * @returns {Object}  Newly created authentication context.
 */
function AuthenticationContext(authority, validateAuthority) {

    if (validateAuthority !== false) {
        validateAuthority = true;
    }

    this.authority = authority;
    this.validateAuthority = validateAuthority;
    this.tokenCache = new TokenCache(this);
}

/**
 * Constructs context asynchronously to use with known authority to get the token.
 * It reuses existing context for this authority URL in native proxy or creates a new one if it doesn't exists.
 *
 * @param   {String}   authority         Authority url to send code and token requests
 * @param   {Boolean}  validateAuthority Validate authority before sending token request. True by default
 *
 * @returns {Promise}  Promise either fulfilled with newly created authentication context or rejected with error
 */
AuthenticationContext.createAsync = function (authority, validateAuthority) {

    return new Promise( (resolve, reject) => {

        if (validateAuthority !== false) {
            validateAuthority = true;
        }

        reactNativeAdalPlugin.createAsync({
            authority: authority,
            validateAuthority: validateAuthority
        }, (err) => {
            if (err) {
                return reject(err);
            }

            resolve(new AuthenticationContext(authority, validateAuthority));
        });


    });

};

/**
 * Acquires token using interactive flow. It always shows UI and skips token from cache.
 *
 * @param   {String}  resourceUrl Resource identifier
 * @param   {String}  clientId    Client (application) identifier
 * @param   {String}  redirectUrl Redirect url for this application
 * @param   {String}  userId      User identifier (optional)
 * @param   {String}  extraQueryParameters
 *                                Extra query parameters (optional)
 *                                Parameters should be escaped before passing to this method (e.g. using 'encodeURI()')
 *
 * @returns {Promise} Promise either fulfilled with AuthenticationResult object or rejected with error
 */
AuthenticationContext.prototype.acquireTokenAsync = function (resourceUrl, clientId, redirectUrl, userId, extraQueryParameters) {


    return new Promise( (resolve, reject) => {
        reactNativeAdalPlugin.acquireTokenAsync({
            authority: this.authority,
            validateAuthority: this.validateAuthority,
            resourceId: resourceUrl,
            clientId: clientId,
            redirectUri: redirectUrl,
            userId: userId,
            extraQueryParameters: extraQueryParameters
        }, (err, authResult) => {

            if (err) {
                return reject(err);
            }

            resolve(new AuthenticationResult(authResult));
        });


    });
};

/**
 * Acquires token WITHOUT using interactive flow. It checks the cache to return existing result
 * if not expired. It tries to use refresh token if available. If it fails to get token without
 * displaying UI it will fail. This method guarantees that no UI will be shown to user.
 *
 * @param   {String}  resourceUrl Resource identifier
 * @param   {String}  clientId    Client (application) identifier
 * @param   {String}  userId      User identifier (optional)
 *
 * @returns {Promise} Promise either fulfilled with AuthenticationResult object or rejected with error
 */
AuthenticationContext.prototype.acquireTokenSilentAsync = function (resourceUrl, clientId, userId) {

    return new Promise( (resolve, reject) => {
        reactNativeAdalPlugin.acquireTokenSilentAsync({
            authority: this.authority,
            validateAuthority: this.validateAuthority,
            resourceId: resourceUrl,
            clientId: clientId,
            userId: userId,
        }, (err, authResult) => {
            if (err) {
                return reject(err);
            }
            resolve(new AuthenticationResult(authResult));
        });

    });
};

module.exports = AuthenticationContext;
