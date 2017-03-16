//
// // Copyright (c) Microsoft Open Technologies, Inc.  All rights reserved.  Licensed under the Apache License, Version 2.0.  See License.txt in the project root for license information.
//
// /*jshint jasmine: true */
// /*global require, module, Microsoft*/
//
// var TENANT_NAME = '17bf7168-5251-44ed-a3cf-37a5997cc451';
// var APP_ID = '3cfa20df-bca4-4131-ab92-626fb800ebb5';
// var REDIRECT_URL = "http://test.com";
//
// var RESOURCE_URL = 'https://graph.windows.net/';
//
// var AUTHORITY_URL = 'https://login.windows.net/' + TENANT_NAME + '/';
// var INVALID_AUTHORITY_URL = 'https://invalid.authority.url';
// var TEST_USER_ID = '';
// var INVALID_USER_ID = 'invalid@user.id';
//
// var AuthenticationContext = Microsoft.ADAL.AuthenticationContext;
// var AuthenticationResult = require('cordova-plugin-ms-adal.AuthenticationResult');
// var TokenCacheItem = require('cordova-plugin-ms-adal.TokenCacheItem');
// var TokenCache = require('cordova-plugin-ms-adal.TokenCache');
// var UserInfo = require('cordova-plugin-ms-adal.UserInfo');
//
// module.exports.defineAutoTests = function () {
//
//     describe("Authentication Context", function () {
//
//         it("Should have a constructor", function () {
//             expect(AuthenticationContext).toBeDefined();
//             expect(typeof AuthenticationContext).toEqual("function");
//         });
//
//         it("Should have createAsync static method", function () {
//             expect(AuthenticationContext.createAsync).toBeDefined();
//             expect(typeof AuthenticationContext.createAsync).toEqual("function");
//         });
//
//         it("Should not have any other static properties", function () {
//             var ownProperties = [],
//                 context = AuthenticationContext;
//
//             for (var p in context) {
//                 if (context.hasOwnProperty(p)) {
//                     ownProperties.push(p);
//                 }
//             }
//
//             expect(ownProperties.length).toEqual(1);
//             expect(ownProperties[0]).toEqual("createAsync");
//         });
//
//         it("Should have been created properly using constructor", function () {
//             var context;
//             try {
//                 context = new AuthenticationContext(AUTHORITY_URL);
//                 expect(context instanceof AuthenticationContext).toBeTruthy();
//                 expect(context.authority).toEqual(AUTHORITY_URL);
//                 expect(context.tokenCache instanceof TokenCache).toBeTruthy();
//             } catch (err) {
//                 expect(err).not.toBeDefined();
//             }
//         });
//
//         it("Should correctly parse jwt token", function () {
//             try {
//                 var user = UserInfo.fromJWT("eyJ0eXAiOiJKV1QiLCJhbGciOiJub25lIn0.eyJhdWQiOiI2NjllZWI2Ny05NTY4LTQ5M2UtODhkYy1hYzI4MWUyNDY5MTAiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC81MTRiZGFhNC1iODhhLTQzODctOTViOS0zNzI0ZDg4ZjM2MmMvIiwiaWF0IjoxNDcyNjM2ODY3LCJuYmYiOjE0NzI2MzY4NjcsImV4cCI6MTQ3MjY0MDc2NywiYW1yIjpbInB3ZCJdLCJmYW1pbHlfbmFtZSI6Imxhc3ROYW1lLcOhxaFraGFsaWTDocWhIiwiZ2l2ZW5fbmFtZSI6Im5hbWUtw6HFoWtoYWxpZMOhxaEiLCJpcGFkZHIiOiIxMDkuNjAuMTM1LjEwOSIsIm5hbWUiOiJkaXNwbGF5TmFtZS3DocWha2hhbGlkw6HFoSIsIm9pZCI6IjExNzY1NWY4LTBmODItNGQ0ZC1hZTUwLWY3OWQ4MmYxMzJiMCIsInN1YiI6IkZPT2EzdDd1VFdSZVpDdzFfNUdEVVF3TnU2N3VFM2J3cVNIcnFUNzFlVFEiLCJ0aWQiOiI1MTRiZGFhNC1iODhhLTQzODctOTViOS0zNzI0ZDg4ZjM2MmMiLCJ1bmlxdWVfbmFtZSI6InVzZXJAY29yZG92YUFEQUwub25taWNyb3NvZnQuY29tIiwidXBuIjoidXNlckBjb3Jkb3ZhQURBTC5vbm1pY3Jvc29mdC5jb20iLCJ2ZXIiOiIxLjAifQ.");
//
//                 expect(user).toBeDefined();
//                 expect(user instanceof UserInfo).toBeTruthy();
//                 // ensure utf8 characters are correctly handled
//                 expect(user.displayableId).toEqual("displayName-áškhalidáš");
//                 expect(user.familyName).toEqual("lastName-áškhalidáš");
//                 expect(user.givenName).toEqual("name-áškhalidáš");
//                 expect(user.uniqueId).toEqual("user@cordovaADAL.onmicrosoft.com");
//                 expect(user.userId).toEqual("117655f8-0f82-4d4d-ae50-f79d82f132b0");
//                 expect(user.identityProvider).toEqual("https://sts.windows.net/514bdaa4-b88a-4387-95b9-3724d88f362c/");
//                 expect(user.passwordExpiresOn).toEqual(new Date(1472640767 * 1000));
//
//             } catch (err) {
//                 expect(err).not.toBeDefined();
//             }
//         });
//
//         // We need to test this case here because we need to be sure
//         // that context for this authority hadn't been created already
//         it("Should get token successfully if created using constructor", function (done) {
//             // skip tests that require user interaction if running on CI
//             if (window.IS_CI) {
//                 pending();
//             }
//             var context = new AuthenticationContext(AUTHORITY_URL);
//             context.acquireTokenSilentAsync(RESOURCE_URL, APP_ID, TEST_USER_ID)
//             .then(function (authResult) {
//                 expect(authResult).toBeDefined();
//                 expect(authResult instanceof AuthenticationResult).toBeTruthy();
//                 expect(authResult.accessToken).toBeDefined();
//                 expect(authResult.expiresOn).toBeDefined();
//                 expect(typeof authResult.accessToken).toEqual("string");
//                 expect(authResult.expiresOn instanceof Date).toBeTruthy();
//                 done();
//             }, function (err) {
//                 expect(err).not.toBeDefined();
//                 done();
//             });
//         });
//
//         it("Should have been created properly via 'createAsync' method", function (done) {
//             AuthenticationContext.createAsync(AUTHORITY_URL)
//             .then(function (context) {
//                 expect(context instanceof AuthenticationContext).toBeTruthy();
//                 expect(context.authority).toEqual(AUTHORITY_URL);
//                 expect(context.tokenCache instanceof TokenCache).toBeTruthy();
//                 done();
//             }, function (err) {
//                 expect(err).not.toBeDefined();
//                 done();
//             });
//         });
//
//         it("Should accept validateAuthority flag", function (done) {
//             AuthenticationContext.createAsync(AUTHORITY_URL, false)
//             .then(function (context) {
//                 expect(context instanceof AuthenticationContext).toBeTruthy();
//                 expect(context.authority).toEqual(AUTHORITY_URL);
//                 expect(context.validateAuthority).toBeFalsy();
//                 done();
//             }, function (err) {
//                 expect(err).not.toBeDefined();
//                 done();
//             });
//         });
//
//         it("Should fail to create context if AUTHORITY_URL is not valid", function (done) {
//             AuthenticationContext.createAsync(INVALID_AUTHORITY_URL, true)
//             .then(function (context) {
//                 expect(context).not.toBeDefined();
//                 done();
//             }, function (err) {
//                 expect(err).toBeDefined();
//                 expect(err instanceof Error).toBeTruthy();
//                 expect(err.message).toBeDefined();
//                 expect(err.code).toBeDefined();
//                 done();
//             });
//         });
//
//         describe("Token acquisition", function () {
//
//             var authContext;
//
//             beforeEach(function (done) {
//                 AuthenticationContext.createAsync(AUTHORITY_URL)
//                 .then(function (context) {
//                     authContext = context;
//                     done();
//                 });
//             });
//
//             afterEach(function () {
//                 authContext = null;
//             });
//
//             it("Should have an 'acquireTokenAsync' method", function (done) {
//                 expect(authContext.acquireTokenAsync).toBeDefined();
//                 expect(typeof authContext.acquireTokenAsync).toEqual("function");
//                 done();
//             });
//
//             // This test is pended since acquireTokenAsync will always bypass cookies and show UI
//             xit("Should acquire token via 'acquireTokenAsync' method", function (done) {
//                 // skip tests that require user interaction if running on CI
//                 if (window.IS_CI) {
//                     pending();
//                 }
//                 authContext.acquireTokenAsync(RESOURCE_URL, APP_ID, REDIRECT_URL)
//                 .then(function (authResult) {
//                     expect(authResult).toBeDefined();
//                     expect(authResult instanceof AuthenticationResult).toBeTruthy();
//                     expect(authResult.accessToken).toBeDefined();
//                     expect(authResult.expiresOn).toBeDefined();
//                     expect(typeof authResult.accessToken).toEqual("string");
//                     expect(authResult.expiresOn instanceof Date).toBeTruthy();
//                     expect(authResult.userInfo instanceof UserInfo).toBeTruthy();
//                     // Save acquired userId for further usage
//                     TEST_USER_ID = authResult.userInfo.userId;
//                     done();
//                 }, function (err) {
//                     expect(err).not.toBeDefined();
//                     done();
//                 });
//             });
//
//             it("Should have an 'acquireTokenSilentAsync' method", function (done) {
//                 expect(authContext.acquireTokenSilentAsync).toBeDefined();
//                 expect(typeof authContext.acquireTokenSilentAsync).toEqual("function");
//                 done();
//             });
//
//             it("Should acquire token via 'acquireTokenSilentAsync' method", function (done) {
//                 // skip tests that require user interaction if running on CI
//                 if (window.IS_CI) {
//                     pending();
//                 }
//                 authContext.acquireTokenSilentAsync(RESOURCE_URL, APP_ID, TEST_USER_ID)
//                 .then(function (authResult) {
//                     expect(authResult).toBeDefined();
//                     expect(authResult instanceof AuthenticationResult).toBeTruthy();
//                     expect(authResult.accessToken).toBeDefined();
//                     expect(authResult.expiresOn).toBeDefined();
//                     expect(typeof authResult.accessToken).toEqual("string");
//                     expect(authResult.expiresOn instanceof Date).toBeTruthy();
//                     expect(authResult.userInfo instanceof UserInfo).toBeTruthy();
//                     done();
//                 }, function (err) {
//                     expect(err).not.toBeDefined();
//                     done();
//                 });
//             });
//
//             it("Should fail to acquire token via 'acquireTokenSilentAsync' method if username is not valid", function (done) {
//                 // skip tests that require user interaction if running on CI
//                 if (window.IS_CI) {
//                     pending();
//                 }
//                 authContext.acquireTokenSilentAsync(RESOURCE_URL, APP_ID, INVALID_USER_ID)
//                 .then(function (authResult) {
//                     expect(authResult).not.toBeDefined();
//                     done();
//                 }, function (err) {
//                     expect(err).toBeDefined();
//                     done();
//                 });
//             });
//         });
//     });
//
//     describe("Token Cache", function () {
//
//         var context, cache;
//
//         beforeEach(function() {
//             context = new AuthenticationContext(AUTHORITY_URL);
//             cache = context.tokenCache;
//         });
//
//         afterEach(function () {
//             context = cache = null;
//         });
//
//         it("Should exist in authentication context instance", function () {
//             expect(context.tokenCache).toBeDefined();
//             expect(context.tokenCache instanceof TokenCache).toBeTruthy();
//         });
//
//         it("Should contain proper fields and methods", function () {
//             expect(cache.authContext).toBeDefined();
//             expect(typeof cache.clear).toBe("function");
//             expect(typeof cache.readItems).toBe("function");
//             expect(typeof cache.deleteItem).toBe("function");
//         });
//
//         it("Should acquire native cache via 'readItems' method", function (done) {
//             // skip tests that require user interaction if running on CI
//             if (window.IS_CI) {
//                 pending();
//             }
//             cache.readItems()
//             .then(function (cacheItems) {
//                 expect(cacheItems.constructor).toBe(Array);
//                 expect(cacheItems.length).toBeGreaterThan(0);
//                 expect(cacheItems[0] instanceof TokenCacheItem).toBeTruthy();
//                 done();
//             }, function (err) {
//                 expect(err).not.toBeDefined();
//                 done();
//             });
//         });
//
//         it("Should be able to delete item via 'deleteItem' method", function(done) {
//             // skip tests that require user interaction if running on CI
//             if (window.IS_CI) {
//                 pending();
//             }
//
//             var fail = function (err) {
//                 expect(err).not.toBeDefined();
//                 done();
//             };
//
//             var initialLength;
//
//             cache.readItems().then(function (cacheItems) {
//                 var item = cacheItems[0];
//                 initialLength = cacheItems.length;
//                 return cache.deleteItem(item);
//             }, fail).then(function () {
//                 return cache.readItems();
//             }, fail).then(function (cacheItems) {
//                 expect(cacheItems.length).toEqual(initialLength - 1);
//                 done();
//             }, fail);
//         });
//
//         it("Should be able to clear native cache via 'clear' method", function(done) {
//
//             var fail = function (err) {
//                 expect(err).not.toBeDefined();
//                 done();
//             };
//
//             cache.readItems().then(function () {
//                 return cache.clear();
//             }, fail).then(function () {
//                 return cache.readItems();
//             }, fail).then(function (cacheItems) {
//                 expect(cacheItems.length).toEqual(0);
//                 done();
//             }, fail);
//         });
//
//         it("AuthenticationSettings.setUseBroker should not crash", function(done) {
//             Microsoft.ADAL.AuthenticationSettings.setUseBroker(false).then(function() {
//                 done();
//             }, function(err) {
//                 expect(err).not.toBeDefined();
//                 done();
//             });
//         })
//     });
// };
//
// module.exports.defineManualTests = function (contentEl, createActionButton) {
//
//     var context;
//
//     createActionButton("Create Authentication context", function () {
//         AuthenticationContext.createAsync(AUTHORITY_URL)
//         .then(function (ctx) {
//             context = ctx;
//             contentEl.innerHTML = JSON.stringify(ctx, null, 4);
//         }, function (err) {
//             contentEl.innerHTML = err ? err.message : "";
//         });
//     });
//
//     createActionButton("Acquire token", function () {
//
//         if (!context) {
//             contentEl.innerHTML = "Create context first";
//             return;
//         }
//
//         context.acquireTokenAsync(RESOURCE_URL, APP_ID, REDIRECT_URL).then(function (authRes) {
//             // Save acquired userId for further usage
//             TEST_USER_ID = authRes.userInfo.userId;
//             contentEl.innerHTML = authRes;
//             contentEl.innerHTML += "<br /> AccessToken: " + authRes.accessToken;
//             contentEl.innerHTML += "<br /> ExpiresOn: " + authRes.expiresOn;
//         }, function(err) {
//             contentEl.innerHTML = err ? err.message : "";
//         });
//     });
//
//     createActionButton("Acquire token with userId", function () {
//
//         if (!context) {
//             contentEl.innerHTML = "Create context first";
//             return;
//         }
//
//         context.tokenCache.readItems()
//         .then(function function_name (items) {
//             var itemsWithUserId = items.filter(function(item) {
//                 return item.userInfo && item.userInfo.userId;
//             });
//
//             if (itemsWithUserId.length <= 0 ) {
//                 contentEl.innerHTML = "No users withUserId found in cache, please acquire token first";
//                 return;
//             }
//
//             context.acquireTokenAsync(RESOURCE_URL, APP_ID, REDIRECT_URL, itemsWithUserId[0].userInfo.userId).then(function (authRes) {
//                 // Save acquired userId for further usage
//                 TEST_USER_ID = authRes.userInfo.userId;
//                 contentEl.innerHTML = authRes;
//                 contentEl.innerHTML += "<br /> AccessToken: " + authRes.accessToken;
//                 contentEl.innerHTML += "<br /> ExpiresOn: " + authRes.expiresOn;
//             }, function(err) {
//                 contentEl.innerHTML = err ? err.message : "";
//             });
//
//             contentEl.innerHTML = JSON.stringify(items, null, 4);
//         }, function(err) {
//             contentEl.innerHTML = err ? err.message : "";
//         });
//     });
//
//     createActionButton("Acquire token with userId (specified as DisplayableId aka email)", function () {
//
//         if (!context) {
//             contentEl.innerHTML = "Create context first";
//             return;
//         }
//
//         context.tokenCache.readItems()
//         .then(function function_name(items) {
//             var itemsWithDisplayableId = items.filter(function (item) {
//                 return item && item.displayableId;
//             });
//
//             if (itemsWithDisplayableId.length <= 0) {
//                 contentEl.innerHTML = "No users withDisplayableId found in cache, please acquire token first";
//                 return;
//             }
//
//             context.acquireTokenAsync(RESOURCE_URL, APP_ID, REDIRECT_URL, itemsWithDisplayableId[0].displayableId).then(function (authRes) {
//                 TEST_USER_ID = itemsWithDisplayableId[0].displayableId;
//                 contentEl.innerHTML = authRes;
//                 contentEl.innerHTML += "<br /> AccessToken: " + authRes.accessToken;
//                 contentEl.innerHTML += "<br /> ExpiresOn: " + authRes.expiresOn;
//             }, function (err) {
//                 contentEl.innerHTML = err ? err.message : "";
//             });
//
//             contentEl.innerHTML = JSON.stringify(items, null, 4);
//         }, function (err) {
//             contentEl.innerHTML = err ? err.message : "";
//         });
//     });
//
//     createActionButton("Acquire token silently", function () {
//
//         if (!context) {
//             contentEl.innerHTML = "Create context first";
//             return;
//         }
//
//         context.acquireTokenSilentAsync(RESOURCE_URL, APP_ID, TEST_USER_ID).then(function (authRes) {
//             contentEl.innerHTML = authRes;
//             contentEl.innerHTML += "<br /> AccessToken: " + authRes.accessToken;
//             contentEl.innerHTML += "<br /> ExpiresOn: " + authRes.expiresOn;
//         }, function(err) {
//             contentEl.innerHTML = err ? err.message : "";
//         });
//     });
//
//     createActionButton("Acquire token silently with userId", function () {
//
//         if (!context) {
//             contentEl.innerHTML = "Create context first";
//             return;
//         }
//
//         context.tokenCache.readItems()
//         .then(function function_name(items) {
//             var itemsWithUserId = items.filter(function (item) {
//                 return item.userInfo && item.userInfo.userId;
//             });
//
//             if (itemsWithUserId.length <= 0) {
//                 contentEl.innerHTML = "No users withUserId found in cache, please acquire token first";
//                 return;
//             }
//
//             context.acquireTokenSilentAsync(RESOURCE_URL, APP_ID, itemsWithUserId[0].userInfo.userId).then(function (authRes) {
//                 contentEl.innerHTML = authRes;
//                 contentEl.innerHTML += "<br /> AccessToken: " + authRes.accessToken;
//                 contentEl.innerHTML += "<br /> ExpiresOn: " + authRes.expiresOn;
//             }, function (err) {
//                 contentEl.innerHTML = err ? err.message : "";
//             });
//         });
//     });
//
//     createActionButton("Acquire token silently with userId (specified as DisplayableId aka email)", function () {
//
//         if (!context) {
//             contentEl.innerHTML = "Create context first";
//             return;
//         }
//
//         context.tokenCache.readItems()
//         .then(function function_name(items) {
//             var itemsWithDisplayableId = items.filter(function (item) {
//                 return item && item.displayableId;
//             });
//
//             if (itemsWithDisplayableId.length <= 0) {
//                 contentEl.innerHTML = "No users withDisplayableId found in cache, please acquire token first";
//                 return;
//             }
//
//             context.acquireTokenSilentAsync(RESOURCE_URL, APP_ID, itemsWithDisplayableId[0].displayableId).then(function (authRes) {
//                 contentEl.innerHTML = authRes;
//                 contentEl.innerHTML += "<br /> AccessToken: " + authRes.accessToken;
//                 contentEl.innerHTML += "<br /> ExpiresOn: " + authRes.expiresOn;
//             }, function (err) {
//                 contentEl.innerHTML = err ? err.message : "";
//             });
//         });
//     });
//
//     createActionButton("Read token cache items", function () {
//
//         if (!context) {
//             contentEl.innerHTML = "Create context first";
//             return;
//         }
//
//         context.tokenCache.readItems()
//         .then(function function_name (items) {
//             contentEl.innerHTML = JSON.stringify(items, null, 4);
//         }, function(err) {
//             contentEl.innerHTML = err ? err.message : "";
//         });
//     });
//
//     createActionButton("Clear cache", function () {
//
//         if (!context) {
//             contentEl.innerHTML = "Create context first";
//             return;
//         }
//
//         context.tokenCache.clear().then(function() {
//             contentEl.innerHTML = "Logged out";
//         }, function(err) {
//             contentEl.innerHTML = err ? err.message : "";
//         });
//     });
//
//     if (cordova.platformId === 'android') { // android specific logic
//
//         createActionButton("setUseBroker(true)", function () {
//             Microsoft.ADAL.AuthenticationSettings.setUseBroker(true)
//             .then(function (res) {
//                 contentEl.innerHTML = res;
//             }, function (err) {
//                 contentEl.innerHTML = err ? err.message : "";
//             });
//         });
//
//         createActionButton("setUseBroker(false)", function () {
//             Microsoft.ADAL.AuthenticationSettings.setUseBroker(false)
//             .then(function (res) {
//                 contentEl.innerHTML = res;
//             }, function (err) {
//                 contentEl.innerHTML = err ? err.message : "";
//             });
//         });
//     }
// };
