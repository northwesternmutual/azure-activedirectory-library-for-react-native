# Active Directory Authentication Library (ADAL) plugin for React Native apps

Active Directory Authentication Library ([ADAL](https://msdn.microsoft.com/en-us/library/azure/jj573266.aspx)) plugin provides easy to use authentication functionality for your Apache Cordova apps by taking advantage of Windows Server Active Directory and Windows Azure Active Directory.
Here you can find the source code for the library.

  * [ADAL for Android](https://github.com/AzureAD/azure-activedirectory-library-for-android),
  * [ADAL for iOS](https://github.com/AzureAD/azure-activedirectory-library-for-objc),

This library is a fork of the library for Cordova. The code was change into a plugin to work with React Native. The JavaScript API's were kept virtually the same to keep parity between the two plugins. 

## Initial setup
1. create your application in Azure AD. You will need to set the redriect URI for the application. 
    1. iOS:  `x-msauth-<bundleId>://com.myapp.mytestapp`
        1. example: `x-msauth-org-reactjs-native-example-sample://org.reactjs.native.example.sample`
    1. android: `msauth://packagename/Base64UrlencodedSignature`
        
        You can get your redirecturi for your app using the script brokerRedirectPrint.ps1 on Windows or brokerRedirectPrint.sh on Linux or Mac from the [Android SDK repo](https://github.com/AzureAD/azure-activedirectory-library-for-android). You can also use API call mContext.getBrokerRedirectUri. Signature is related to your signing certificates.

        Yes, since the redirect URI is based on your signing cert, it will change if your cert changes. If you are not using a common dev cert the redirect URI will be different on each developers computers.
1. follow the directions below

### Manually Install iOS

1. Copy `src/ios/*` to `<path to RN app>/ios/<appname>`
1. Open xcode to `<path to RN app>/ios` and include those files in the app.
1. Add the following to the apps .plist files.

    ```
    <key>LSApplicationQueriesSchemes</key>
    <array>
        <string>msauth</string>
    </array>
    ```
    
    ```
    <key>CFBundleURLTypes</key>
    <array>     
      <dict>
        <key>CFBundleTypeRole</key>
        <string>Editor</string>
        <key>CFBundleURLName</key>
        <string>$(CFBundleIdentifier)</string>
        <key>CFBundleURLSchemes</key>
        <array>
          <string>x-msauth-$(CFBundleIdentifier:rfc1034identifier)</string>
        </array>
      </dict>
    </array>
    ```
    
    ```
    <key>CFBundleIdentifier</key>
    <string>org.your.package.bundle.name</string>
    ```

1. Enable keychain sharing under the Capabilities Settings. Add the keychain group `com.microsoft.adalcache`



### Manually Install Android


1. copy `src/android/*` to `<path to RN app>/android/app/src/main/java/com/microsoft/add/adal`
1. Add `compile('com.microsoft.aad:adal:1.2.2')` to the `build.gradle (Module: app)` file
1. Add the following to AndroidManifest.xml
    ```
    <uses-permission android:name="android.permission.GET_ACCOUNTS" />
    <uses-permission android:name="android.permission.MANAGE_ACCOUNTS" />
    <uses-permission android:name="android.permission.USE_CREDENTIALS" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    
    
    <activity android:configChanges="orientation|keyboardHidden|screenSize" android:name="com.microsoft.aad.adal.AuthenticationActivity" />
    ```
1. Open MainApplication.java and add `new ReactNativeAdalPackage()` to the return of the `getPackages()` method. You will need to add the import statement `import com.microsoft.aad.adal.ReactNativeAdalPackage;` as  well 
1. If doing brokered auth, you must call `AuthenticationSettings.setUseBroker(config.adal.brokeredAuth);`

### Manually Install JavaScript into React Native app

1. Copy contents of www folder into your React Native app. Example `app/utilities`
1. add the following to where you want to use the ADAL lib
    ```javascript
    import AuthenticationContext from "./AuthenticationContext";
    import AuthenticationSettings from "./AuthenticationSettings";
    ```

## How To Use The Library

This plugin uses native SDKs for ADAL for each supported platform and provides single API across all platforms. Here is a quick usage sample:

```javascript

import AuthenticationContext from "./AuthenticationContext";
import AuthenticationSettings from "./AuthenticationSettings";

AuthenticationSettings.setUseBroker(false)

// Shows user authentication dialog if required
function authenticate(authCompletedCallback, errorCallback) {
  var authContext = new AuthenticationContext(authority);
  authContext.tokenCache.readItems().then(function (items) {
    if (items.length > 0) {
        authority = items[0].authority;
        authContext = new AuthenticationContext(authority);
    }
    // Attempt to authorize user silently
    authContext.acquireTokenSilentAsync(resourceUri, clientId)
    .then(authCompletedCallback, function () {
        // We require user cridentials so triggers authentication dialog
        authContext.acquireTokenAsync(resourceUri, clientId, redirectUri)
        .then(authCompletedCallback, errorCallback);
    });
  });
};

authenticate(function(authResponse) {
  console.log("Token acquired: " + authResponse.accessToken);
  console.log("Token will expire on: " + authResponse.expiresOn);
}, function(err) {
  console.log("Failed to authenticate: " + err);
});
```

## Supported platforms

  * Android (OS 5.0 and higher)
  * iOS
 
## Creating new AuthenticationContext

The `Microsoft.ADAL.AuthenticationContext` class retrieves authentication tokens from Azure Active Directory and ADFS services.
Use `AuthenticationContext` constructor to synchronously create a new `AuthenticationContext` object.

#### Parameters
- __authority__: Authority url to send code and token requests. _(String)_ [Required]
- __validateAuthority__: Validate authority before sending token request. _(Boolean)_ (Default: `true`) [Optional]

#### Example
    var authContext = new Microsoft.ADAL.AuthenticationContext("https://login.windows.net/common");

## AuthenticationContext methods and properties
- acquireTokenAsync
- acquireTokenSilentAsync
- tokenCache

### acquireTokenAsync
The `AuthenticationContext.acquireTokenAsync` method asynchronously acquires token using interactive flow.
It **always shows UI** and skips token from cache.

- __resourceUrl__: Resource identifier. _(String)_ [Required]
- __clientId__: Client (application) identifier. _(String)_ [Required]
- __redirectUrl__: Redirect url for this application. _(String)_ [Required]
- __userId__: User identifier. _(String)_ [Optional]
- __extraQueryParameters__: Extra query parameters. Parameters should be escaped before passing to this method (e.g. using 'encodeURI()') _(String)_ [Optional]

__Note__: Those with experience in using native ADAL libraries should pay attention as the plugin uses `PromptBehaviour.Always`
when calling `AcquireToken` method and native libraries use `PromptBehaviour.Auto` by default. As a result
the plugin does not check the cache for existing access or refresh token. This is special design decision
so that `AcquireToken` is always showing a UX and `AcquireTokenSilent` never does so.

#### Example
```
var authContext = new Microsoft.ADAL.AuthenticationContext("https://login.windows.net/common");
authContext.acquireTokenAsync("https://graph.windows.net", "a5d92493-ae5a-4a9f-bcbf-9f1d354067d3", "http://MyDirectorySearcherApp")
  .then(function(authResponse) {
    console.log("Token acquired: " + authResponse.accessToken);
    console.log("Token will expire on: " + authResponse.expiresOn);
  }, function(err) {
    console.log("Failed to authenticate: " + err);
  });
```

### acquireTokenSilentAsync
The `AuthenticationContext.acquireTokenSilentAsync` method acquires token WITHOUT using interactive flow.
It checks the cache to return existing result if not expired. It tries to use refresh token if available.
If it fails to get token withoutd isplaying UI it will fail. This method guarantees that no UI will be shown to user.

- __resourceUrl__: Resource identifier. _(String)_ [Required]
- __clientId__: Client (application) identifier. _(String)_ [Required]
- __userId__: User identifier. _(String)_ [Optional]

#### Example
```
var authContext = new Microsoft.ADAL.AuthenticationContext("https://login.windows.net/common");
authContext.acquireTokenSilentAsync("https://graph.windows.net", "a5d92493-ae5a-4a9f-bcbf-9f1d354067d3")
  .then(function(authResponse) {
    console.log("Token acquired: " + authResponse.accessToken);
    console.log("Token will expire on: " + authResponse.expiresOn);
  }, function(err) {
    console.log("Failed to authenticate: " + err);
  });
```

### tokenCache
The `AuthenticationContext.tokenCache` property returns `TokenCache` class instance which stores access and refresh tokens.
This class could be used to retrieve cached items (`readItems` method), remove specific (`deleteItem` method) or all items (`clear` method).

#### Example
```
var authContext = new Microsoft.ADAL.AuthenticationContext("https://login.windows.net/common");
authContext.tokenCache.readItems().then(function (items) {
  console.log("Num cached items: " + items.length);
});
```

## Handling Errors

In case of method execution failure corresponding promise is rejected with a standard `JavaScript Error` instance.
The following error properties are available for you in this case:

* err.message - Human-readable description of the error.
* err.code - Error-code returned by native SDK; you can use this information to detect most common error reasons and provide extra
logic based on this information. **Important:** code is platform specific, see below for more details:
 * iOS: https://github.com/AzureAD/azure-activedirectory-library-for-objc/blob/dev/ADAL/src/public/ADErrorCodes.h
 * Android: https://github.com/AzureAD/azure-activedirectory-library-for-android/blob/master/src/src/com/microsoft/aad/adal/ADALError.java
 * Windows: https://github.com/AzureAD/azure-activedirectory-library-for-dotnet/blob/master/src/ADAL.PCL/Constants.cs
* err.details - Raw error information returned by Apache Cordova bridge and native implementation (if available).



## Known issues and workarounds

## How to sign out

Similar to native labraries the plugin does not provide special method to sign out as it depends on server/application logic.
The recomendation here is

1. Step1: clear cache

    var authContext = new Microsoft.ADAL.AuthenticationContext("https://login.windows.net/common");
    authContext.tokenCache.clear();
1. Step2: make `XmlHttpRequest` (or open InAppBrowser instance) pointing to the sign out url.
In most cases the url should look like the following: `https://login.windows.net/{tenantid or "common"}/oauth2/logout?post_logout_redirect_uri={URL}`

## 'Class not registered' error on Windows

If you are using Visual Studio 2013 and see 'WinRTError: Class not registered' runtime error on Windows make sure Visual Studio [Update 5](https://www.visualstudio.com/news/vs2013-update5-vs) is installed.

## Multiple login windows issue

Multiple login dialog windows will be shown if `acquireTokenAsync` is called multiple times and the token could not be acquired silently (at the first run for example). Use a [promise queueing](https://www.npmjs.com/package/promise-queue)/semaphore logic in the app code to avoid this issue.

## Installation Instructions

### Prerequisites

* [NodeJS and NPM](https://nodejs.org/)

* [React Native](https://facebook.github.io/react-native/)


## Setting up an Application in Azure AD

You can find detailed instructions how to set up a new application in Azure AD [here](https://github.com/AzureADSamples/NativeClient-MultiTarget-DotNet#step-4--register-the-sample-with-your-azure-active-directory-tenant).


## Android Quirks ##
### Broker support
The following method should be used to enable broker component support (delivered with Intune's Company portal app). Read [ADAL for Android](https://github.com/AzureAD/azure-activedirectory-library-for-android) to understand broker concept in more details.

`Microsoft.ADAL.AuthenticationSettings.setUseBroker(true);`

__Note__: Developer needs to register special redirectUri for broker usage. RedirectUri is in the format of `msauth://packagename/Base64UrlencodedSignature`

## iOS Quirks ##
### Broker support
Plugin automatically detects whether to enable brokered authentication based on redirectUri format (if starts with `x-msauth-`).
Developer needs to register special redirectUri for broker usage following format below:
```
x-msauth-<your-bundle-id>://<your.bundle.id>
ex: x-msauth-com-microsoft-mytestiosapp://com.microsoft.mytestiosapp
```
Read [ADAL for iOS](https://github.com/AzureAD/azure-activedirectory-library-for-objc#brokered-authentication) to understand broker concept in more details.

## Copyrights ##
Copyright (c) Northwestern Mutual. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use these files except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

-----

Copyright (c) Microsoft Open Technologies, Inc. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use these files except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

## We Value and Adhere to the Microsoft Open Source Code of Conduct

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
