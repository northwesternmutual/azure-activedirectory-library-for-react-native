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

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import android.support.v4.app.ActivityCompat;
import android.support.v4.content.ContextCompat;
import android.text.TextUtils;
import android.util.Log;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.BaseActivityEventListener;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;

import org.json.JSONArray;
import org.json.JSONException;

import java.io.UnsupportedEncodingException;
import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;
import java.util.Hashtable;
import java.util.Iterator;
import java.util.List;

import javax.crypto.NoSuchPaddingException;
import javax.crypto.SecretKey;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import javax.crypto.spec.SecretKeySpec;

import static com.microsoft.aad.adal.SimpleSerialization.tokenItemToJSON;

public class ReactNativeAdalPlugin extends ReactContextBaseJavaModule {

    @Override
    public String getName() {
        return "ReactNativeAdalPlugin";
    }

    private static final PromptBehavior SHOW_PROMPT_ALWAYS = PromptBehavior.Always;

    private static final int GET_ACCOUNTS_PERMISSION_REQ_CODE = 0;
    private static final String PERMISSION_DENIED_ERROR =  "Permissions denied";
    private static final String SECRET_KEY =  "com.microsoft.aad.CordovaADAL";

    private final Hashtable<String, AuthenticationContext> contexts = new Hashtable<String, AuthenticationContext>();
    private AuthenticationContext currentContext;
    private Callback permissionCallback;

    private final ActivityEventListener activityEventListener = new BaseActivityEventListener() {

        @Override
        public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
            if (currentContext != null) {
                currentContext.onActivityResult(requestCode, resultCode, data);
            }
        }
    };

    public ReactNativeAdalPlugin(ReactApplicationContext reactContext) {
        super(reactContext);



        reactContext.addActivityEventListener(activityEventListener);
    }


    @ReactMethod
    public void createAsync(ReadableMap obj, Callback callback) {

        try {
            String authority = obj.hasKey("authority") ? obj.getString("authority") : null;
            boolean validateAuthority = obj.hasKey("validateAuthority") ? obj.getBoolean("validateAuthority") : false;

            getOrCreateContext(authority, validateAuthority);
            callback.invoke();

        } catch (Exception e) {
            callback.invoke(e.getMessage());
        }
    }

    @ReactMethod
    public void acquireTokenAsync(ReadableMap obj, Callback callback) {

        final AuthenticationContext authContext;
        String authority = obj.hasKey("authority") ? obj.getString("authority") : null;
        boolean validateAuthority = obj.hasKey("validateAuthority") ? obj.getBoolean("validateAuthority") : false;
        String resourceId = obj.hasKey("resourceId") ? obj.getString("resourceId") : null;
        String clientId = obj.hasKey("clientId") ? obj.getString("clientId") : null;
        String redirectUri = obj.hasKey("redirectUri") ? obj.getString("redirectUri") : null;
        String userId = obj.hasKey("userId") ? obj.getString("userId") : null;
        String extraQueryParams = obj.hasKey("extraQueryParams") ? obj.getString("extraQueryParams") : null;

        try{
            authContext = getOrCreateContext(authority, validateAuthority);
        } catch (Exception e) {
            callback.invoke(e.getMessage());
            return;
        }

        if (userId != null) {
            ITokenCacheStore cache = authContext.getCache();
            if (cache instanceof ITokenStoreQuery) {

                List<TokenCacheItem> tokensForUserId = ((ITokenStoreQuery)cache).getTokensForUser(userId);
                if (tokensForUserId.size() > 0) {
                    // Try to acquire alias for specified userId
                    userId = tokensForUserId.get(0).getUserInfo().getDisplayableId();
                }
            }
        }

        authContext.acquireToken(this.getCurrentActivity(), resourceId, clientId, redirectUri,
                userId, SHOW_PROMPT_ALWAYS, extraQueryParams, new DefaultAuthenticationCallback(callback));
    }

    @ReactMethod
    public void acquireTokenSilentAsync(ReadableMap obj, Callback callback) { //String authority, boolean validateAuthority, String resourceUrl, String clientId, String userId) {

        final AuthenticationContext authContext;
        String authority = obj.hasKey("authority") ? obj.getString("authority") : null;
        boolean validateAuthority = obj.hasKey("validateAuthority") ? obj.getBoolean("validateAuthority") : false;
        String resourceId = obj.hasKey("resourceId") ? obj.getString("resourceId") : null;
        String clientId = obj.hasKey("clientId") ? obj.getString("clientId") : null;
        String userId = obj.hasKey("userId") ? obj.getString("userId") : null;
        try{
            authContext = getOrCreateContext(authority, validateAuthority);

            //  We should retrieve userId from broker cache since local is always empty
            boolean useBroker = AuthenticationSettings.INSTANCE.getUseBroker();
            if (useBroker) {
                if (TextUtils.isEmpty(userId)) {
                    // Get first user from account list
                    userId = authContext.getBrokerUser();
                }

                for (UserInfo info: authContext.getBrokerUsers()) {
                    if (info.getDisplayableId().equals(userId)) {
                        userId = info.getUserId();
                        break;
                    }
                }
            }

        } catch (Exception e) {
            callback.invoke(e.getMessage());
            return;
        }

        authContext.acquireTokenSilentAsync(resourceId, clientId, userId, new DefaultAuthenticationCallback(callback));
    }

    @ReactMethod
    public void tokenCacheReadItems(ReadableMap obj, Callback callback) throws JSONException {

        final AuthenticationContext authContext;
        String authority = obj.hasKey("authority") ? obj.getString("authority") : null;
        boolean validateAuthority = obj.hasKey("validateAuthority") ? obj.getBoolean("validateAuthority") : false;

        try{
            authContext = getOrCreateContext(authority, validateAuthority);
        } catch (Exception e) {
            callback.invoke(e.getMessage());
            return;
        }

        WritableArray result = Arguments.createArray();
        ITokenCacheStore cache = authContext.getCache();

        if (cache instanceof ITokenStoreQuery) {
            Iterator<TokenCacheItem> cacheItems = ((ITokenStoreQuery)cache).getAll();

            while (cacheItems.hasNext()){
                TokenCacheItem item = cacheItems.next();
                result.pushMap(tokenItemToJSON(item));
            }
        }

        callback.invoke(null, result);

    }

    @ReactMethod
    public void tokenCacheDeleteItem(ReadableMap obj, Callback callback) {


        final AuthenticationContext authContext;
        String authority = obj.hasKey("authority") ? obj.getString("authority") : null;
        boolean validateAuthority = obj.hasKey("validateAuthority") ? obj.getBoolean("validateAuthority") : false;
        String resourceId = obj.hasKey("resourceId") ? obj.getString("resourceId") : null;
        String clientId = obj.hasKey("clientId") ? obj.getString("clientId") : null;
        String userId = obj.hasKey("userId") ? obj.getString("userId") : null;
        String itemAuthority = obj.hasKey("itemAuthority") ? obj.getString("itemAuthority") : null;
        boolean isMultipleResourceRefreshToken = obj.hasKey("isMultipleResourceRefreshToken") ? obj.getBoolean("isMultipleResourceRefreshToken") : false;


        try{
            authContext = getOrCreateContext(authority, validateAuthority);
        } catch (Exception e) {
            callback.invoke(e.getMessage());
            return;
        }

        String key = CacheKey.createCacheKey(itemAuthority, resourceId, clientId, isMultipleResourceRefreshToken, userId, "1");
        authContext.getCache().removeItem(key);

        callback.invoke();
    }

    @ReactMethod
    public void tokenCacheClear(ReadableMap obj, Callback callback) {
        final AuthenticationContext authContext;
        String authority = obj.hasKey("authority") ? obj.getString("authority") : null;
        boolean validateAuthority = obj.hasKey("validateAuthority") ? obj.getBoolean("validateAuthority") : false;
        try{
            authContext = getOrCreateContext(authority, validateAuthority);
        } catch (Exception e) {
            callback.invoke(e.getMessage());
            return;
        }

        authContext.getCache().removeAll();
        callback.invoke();
    }

    @ReactMethod
    public void setUseBroker(ReadableMap obj, Callback callback) {

        boolean useBroker = obj.hasKey("useBroker") ? obj.getBoolean("useBroker") : false;
        this.permissionCallback = callback;
        try {
            AuthenticationSettings.INSTANCE.setUseBroker(useBroker);

            // Android 6.0 "Marshmallow" introduced a new permissions model where the user can turn on and off permissions as necessary.
            // This means that applications must handle these permission in run time.
            // http://cordova.apache.org/docs/en/latest/guide/platforms/android/plugin.html#android-permissions
            if (useBroker && Build.VERSION.SDK_INT >= 23 /* Build.VERSION_CODES.M */ ) {

                requestBrokerPermissions();
                // Cordova callback will be handled by requestBrokerPermissions method
            }

        } catch (Exception e) {
            callback.invoke(e.getMessage());
        }
    }

    private void requestBrokerPermissions() {

        if(ContextCompat.checkSelfPermission(this.getCurrentActivity(), Manifest.permission.GET_ACCOUNTS) == PackageManager.PERMISSION_GRANTED) { // android.permission.GET_ACCOUNTS
            // already granted
            this.permissionCallback.invoke();
            return;
        }

        ActivityCompat.requestPermissions(this.getCurrentActivity(),
                new String[]{Manifest.permission.GET_ACCOUNTS},
                GET_ACCOUNTS_PERMISSION_REQ_CODE);
    }



    public void onRequestPermissionResult(int requestCode, String[] permissions,
                                          int[] grantResults) throws JSONException
    {
        for(int r:grantResults)
        {
            if(r == PackageManager.PERMISSION_DENIED)
            {
                this.permissionCallback.invoke(PERMISSION_DENIED_ERROR);
                return;
            }
        }
        this.permissionCallback.invoke();
    }

    private AuthenticationContext getOrCreateContext (String authority, boolean validateAuthority) throws NoSuchPaddingException, NoSuchAlgorithmException {

        AuthenticationContext result;
        if (!contexts.containsKey(authority)) {
            result = new AuthenticationContext(this.getCurrentActivity(), authority, validateAuthority);
            this.contexts.put(authority, result);
        } else {
            result = contexts.get(authority);
        }

        currentContext = result;
        return result;
    }
}