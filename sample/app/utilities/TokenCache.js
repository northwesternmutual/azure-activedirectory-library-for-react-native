// Copyright (c) Northwestern Mutual.  All rights reserved.  Licensed under the Apache License, Version 2.0.  See License.txt in the project root for license information.

// Copyright (c) Microsoft Open Technologies, Inc.  All rights reserved.  Licensed under the Apache License, Version 2.0.  See License.txt in the project root for license information.

/*global module, require*/

import { NativeModules } from 'react-native';
var reactNativeAdalPlugin = NativeModules.ReactNativeAdalPlugin;
var TokenCacheItem = require('./TokenCacheItem');

/**
 * Token cache class used by {AuthenticationContext} to store access and refresh tokens.
 */
function TokenCache(authContext) {
    this.authContext = authContext;
}

/**
 * Clears the cache by deleting all the items.
 *
 * @returns {Promise} Promise either fulfilled when operation is completed or rejected with error.
 */
TokenCache.prototype.clear = function () {

    return new Promise( (resolve, reject) => {
        reactNativeAdalPlugin.tokenCacheClear({
            authority: this.authContext.authority,
            validateAuthority: this.authContext.validateAuthority
        }, (err) => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
};

/**
 * Gets all cached items.
 *
 * @returns {Promise} Promise either fulfilled with array of cached items or rejected with error.
 */
TokenCache.prototype.readItems = function () {


    return new Promise( (resolve, reject) => {
        var result = [];

        reactNativeAdalPlugin.tokenCacheReadItems({
            authority: this.authContext.authority,
            validateAuthority: this.authContext.validateAuthority
        }, (err, tokenCacheItems) => {

            if (err) {
                return reject(err);
            }

            tokenCacheItems.forEach(function (item) {
                result.push(new TokenCacheItem(item));
            });

            resolve(result);
        });
    });
};

/**
 * Deletes cached item.
 *
 * @param   {TokenCacheItem}  item Cached item to delete from cache
 *
 * @returns {Promise} Promise either fulfilled when operation is completed or rejected with error.
 */
TokenCache.prototype.deleteItem = function (item) {


    return new Promise( (resolve, reject) => {

        reactNativeAdalPlugin.tokenCacheDeleteItem({
            authority: this.authContext.authority,
            validateAuthority: this.authContext.validateAuthority,
            itemAuthority: item.authority,
            resourceId: item.resource,
            clientId: item.clientId,
            userId: item.userInfo && item.userInfo.userId,
            isMultipleResourceRefreshToken: item.isMultipleResourceRefreshToken
        }, (err) => {
            if (err) {
                return reject(err);
            }
            resolve();
        });

    });

};

module.exports = TokenCache;
