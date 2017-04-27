// Copyright (c) Northwestern Mutual.  All rights reserved.  Licensed under the Apache License, Version 2.0.  See License.txt in the project root for license information.

// Copyright (c) Microsoft Open Technologies, Inc.  All rights reserved.  Licensed under the Apache License, Version 2.0.  See License.txt in the project root for license information.


/**
 * Pads a string at the right to specified length with specified string
 *
 * @param  {String} str Input string to be padded
 *
 * @param  {Number} n   Resulting length
 *
 * @param  {String} pad String to pad with
 *
 * @return {String}     Right-padded string
 */
function padRight(str, n, pad) {
    var temp = str;

    if (n > str.length) {
        for (var i = 0; i < n - str.length; i++) {
            temp += pad;
        }
    }

    return temp;
}

/**
 * Converts Base64URL to Base64 encoded string
 *
 * @param  {String} jwt Base64URL encoded string
 *
 * @return {String}     Base64 encoded string with applied '=' right padding
 */
function base64UrlToBase64(b64Url) {
    b64Url = padRight(b64Url, b64Url.length + (4 - b64Url.length % 4) % 4, '=');
    return b64Url.replace(/-/g, '+').replace(/_/g, '/');
}

/**
 * Decodes the Base64-encoded value into a string with correct utf8 encoding support.
 * See for more details: https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding#The_Unicode_Problem
 *
 * @param  {String} str Base64-encoded string to decode
 *
 * @return {String}     Decoded string
 *
 */
function b64DecodeUnicode(str) {
    return decodeURIComponent(Array.prototype.map.call(atob(str), function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}

/**
 * Parses a valid JWT token into JSON representation.
 * This method doesn't validate/encode token.
 *
 * @param  {String} jwt Raw JWT token string
 *
 * @return {Object}     Raw object that contains data from token
 */
function parseJWT (jwt) {

    var jwtParseError = new Error("Error parsing JWT token.");

    var jwtParts = jwt.split('.');
    if (jwtParts.length !== 3) {
        throw jwtParseError;
    }

    var jwtBody = jwtParts[1];
    jwtBody = base64UrlToBase64(jwtBody);

    try {
        return JSON.parse(b64DecodeUnicode(jwtBody));
    } catch (e) {
        throw jwtParseError;
    }
}


module.exports.parseJWT = parseJWT;
