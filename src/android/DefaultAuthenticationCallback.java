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

import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.WritableMap;

import org.json.JSONException;
import org.json.JSONObject;

import static com.microsoft.aad.adal.SimpleSerialization.authenticationResultToJSON;

/**
 * Class that provides implementation for passing AuthenticationResult from acquireToken* methods
 * to Cordova JS code
 */
class DefaultAuthenticationCallback implements AuthenticationCallback<AuthenticationResult> {

    /**
     * Private field that stores cordova callback context which is used to send results back to JS
     */
    private final Callback callbackContext;

    /**
     * Default constructor
     * @param callbackContext Cordova callback context which is used to send results back to JS
     */
    DefaultAuthenticationCallback(Callback callbackContext){
        this.callbackContext = callbackContext;
    }

    /**
     * Success callback that serializes AuthenticationResult instance and passes it to Cordova
     * @param authResult AuthenticationResult instance
     */
    @Override
    public void onSuccess(AuthenticationResult authResult) {

        WritableMap result;
        try {
            result = authenticationResultToJSON(authResult);
            callbackContext.invoke(null, result);
        } catch (Exception e) {
            callbackContext.invoke("Failed to serialize Authentication result");
        }
    }

    /**
     * Error callback that passes error to Cordova
     * @param authException AuthenticationException
     */
    @Override
    public void onError(Exception authException) {

        WritableMap error = Arguments.createMap();
        try {
            error.putString("errorDescription",authException.getMessage());
            if (authException instanceof AuthenticationException) {
                error.putString("errorCode", ((AuthenticationException)authException).mCode.toString());
            }
            callbackContext.invoke(error);
        }
        catch(Exception ex){
            callbackContext.invoke(ex.getMessage());
        }
    }
}