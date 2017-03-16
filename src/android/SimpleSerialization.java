/*******************************************************************************
 * Copyright (c) Northwestern Mutual
 * All Rights Reserved
 * Licensed under the Apache License, Version 2.0.
 * See License.txt in the project root for license information.
 ******************************************************************************/

/*******************************************************************************
 * Copyright (c) Microsoft Open Technologies, Inc.
 * All Rights Reserved
 * Licensed under the Apache License, Version 2.0.
 * See License.txt in the project root for license information.
 ******************************************************************************/

package com.microsoft.aad.adal;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;

import org.json.JSONException;
import org.json.JSONObject;

/**
 * Class that responsible for simple serialization of ADAL primitives
 */
class SimpleSerialization {

    /**
     * Convert UserInfo object to JSON representation
     * @param info UserInfo object
     * @return JSONObject that represents a UserInfo structure
     * @throws JSONException
     */
    static WritableMap userInfoToJSON(UserInfo info) {

        WritableMap userInfo = Arguments.createMap();

        if (info == null) {
            return userInfo;
        }

        userInfo.putString("displayableId", info.getDisplayableId());
        userInfo.putString("familyName", info.getFamilyName());
        userInfo.putString("givenName", info.getGivenName());
        userInfo.putString("identityProvider", info.getIdentityProvider());
        userInfo.putString("passwordChangeUrl", String.valueOf(info.getPasswordChangeUrl()));
        userInfo.putString("passwordExpiresOn", String.valueOf(info.getPasswordExpiresOn()));
        userInfo.putString("uniqueId", info.getUserId());
        userInfo.putString("userId", info.getUserId());

        return userInfo;
    }

    /**
     * Convert AuthenticationResult object to JSON representation. Nested userInfo field is being
     * serialized as well. In case if userInfo field is not exists in input object it will
     * be equal to null in resultant object
     * @param authenticationResult AuthenticationResult object
     * @return JSONObject that represents a AuthenticationResult structure
     * @throws JSONException
     */
    static WritableMap authenticationResultToJSON(AuthenticationResult authenticationResult) {
        WritableMap authResult = Arguments.createMap();

        authResult.putString("accessToken", authenticationResult.getAccessToken());
        authResult.putString("accessTokenType", authenticationResult.getAccessTokenType());
        authResult.putString("expiresOn", String.valueOf(authenticationResult.getExpiresOn()));
        authResult.putString("idToken", authenticationResult.getIdToken());
        authResult.putBoolean("isMultipleResourceRefreshToken", authenticationResult.getIsMultiResourceRefreshToken());
        authResult.putString("statusCode", String.valueOf(authenticationResult.getStatus()));
        authResult.putString("tenantId", authenticationResult.getTenantId());

        WritableMap userInfo = null;
        userInfo = userInfoToJSON(authenticationResult.getUserInfo());

        authResult.putMap("userInfo", userInfo);

        return authResult;
    }

    /**
     * Convert TokenCacheItem object to JSON representation. Nested userInfo field is being
     * serialized as well. In case if userInfo field is not exists in input object it will
     * be equal to null in resultant object
     * @param item TokenCacheItem object
     * @return JSONObject that represents a TokenCacheItem structure
     * @throws JSONException
     */
    static WritableMap tokenItemToJSON(TokenCacheItem item) {
        WritableMap result = Arguments.createMap();

        result.putString("accessToken", item.getAccessToken());
        result.putString("authority", item.getAuthority());
        result.putString("clientId", item.getClientId());
        result.putString("expiresOn", String.valueOf(item.getExpiresOn()));
        result.putBoolean("isMultipleResourceRefreshToken", item.getIsMultiResourceRefreshToken());
        result.putString("resource", item.getResource());
        result.putString("tenantId", item.getTenantId());
        result.putString("idToken", item.getRawIdToken());

        WritableMap userInfo = null;

        userInfo = userInfoToJSON(item.getUserInfo());


        result.putMap("userInfo", userInfo);

        return result;
    }
}