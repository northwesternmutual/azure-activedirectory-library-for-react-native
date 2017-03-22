/*******************************************************************************
 * Copyright (c) Northwestern Mutual
 * All Rights Reserved
 * Licensed under the Apache License, Version 2.0.
 * See License.txt in the project root for license information.
 ******************************************************************************/

/*******************************************************************************
 * Copyright (c) Microsoft Open Technologies, Inc.
 * All Rights Reserved
 * See License in the project root for license information.
 ******************************************************************************/


#import "ReactNativeAdalPlugin.h"
#import "ReactNativeAdalUtils.h"
#import <React/RCTLog.h>
#import <React/RCTConvert.h>

#import <ADAL/ADAL.h>

@implementation ReactNativeAdalPlugin

RCT_EXPORT_MODULE();


RCT_EXPORT_METHOD(createAsync:(NSDictionary *)obj callback: (RCTResponseSenderBlock)callback)
{
        @try
        {
            NSString *authority = [obj objectForKey:@"authority"] ? [RCTConvert NSString:obj[@"authority"]] : nil;
            BOOL validateAuthority = [obj objectForKey:@"validateAuthority"] ? [RCTConvert BOOL:obj[@"validateAuthority"]] : false;

            [ReactNativeAdalPlugin getOrCreateAuthContext:authority
                                    validateAuthority:validateAuthority];

            callback(@[[NSNull null]]);
        }
        @catch (ADAuthenticationError *error)
        {
            NSMutableDictionary *dict = [ReactNativeAdalUtils ADAuthenticationErrorToDictionary:error];
            callback(@[dict, [NSNull null]]);
        }
}


RCT_EXPORT_METHOD(acquireTokenAsync:(NSDictionary *)obj callback: (RCTResponseSenderBlock)callback)
{
        @try
        {

            NSString *authority = [obj objectForKey:@"authority"] ? [RCTConvert NSString:obj[@"authority"]] : nil;
            NSString *resourceId = [obj objectForKey:@"resourceId"] ? [RCTConvert NSString:obj[@"resourceId"]] : nil;
            NSString *clientId = [obj objectForKey:@"clientId"] ? [RCTConvert NSString:obj[@"clientId"]] : nil;
            NSURL *redirectUri = [obj objectForKey:@"redirectUri"] ? [RCTConvert NSURL:obj[@"redirectUri"]] : nil;
            NSString *userId = [obj objectForKey:@"userId"] ? [RCTConvert NSString:obj[@"userId"]] : nil;
            NSString *extraQueryParameters =[obj objectForKey:@"extraQueryParameters"] ? [RCTConvert NSString:obj[@"extraQueryParameters"]] : nil;
            BOOL validateAuthority = [obj objectForKey:@"validateAuthority"] ? [RCTConvert BOOL:obj[@"validateAuthority"]] : false;


            ADAuthenticationContext *authContext = [ReactNativeAdalPlugin getOrCreateAuthContext:authority
                                                                           validateAuthority:validateAuthority];
            //
            // `x-msauth-` redirect url prefix means we should use brokered authentication
            // https://github.com/AzureAD/azure-activedirectory-library-for-objc#brokered-authentication
            authContext.credentialsType = (redirectUri.scheme && [redirectUri.scheme hasPrefix: @"x-msauth-"]) ?
                AD_CREDENTIALS_AUTO : AD_CREDENTIALS_EMBEDDED;

            // TODO iOS sdk requires user name instead of guid so we should map provided id to a known user name
            userId = [ReactNativeAdalUtils mapUserIdToUserName:authContext
                                                    userId:userId];
            dispatch_async(dispatch_get_main_queue(), ^{
                [authContext
                 acquireTokenWithResource:resourceId
                 clientId:clientId
                 redirectUri:redirectUri
                 promptBehavior:AD_PROMPT_ALWAYS
                 userId:userId
                 extraQueryParameters:extraQueryParameters
                 completionBlock:^(ADAuthenticationResult *result) {

                   NSMutableDictionary *dict = [ReactNativeAdalUtils ADAuthenticationResultToDictionary:result];
                   if (AD_SUCCEEDED != result.status){
                     callback(@[dict, [NSNull null]]);
                   }
                   else{
                     callback(@[[NSNull null], dict]);
                   }

                 }];
            });
        }
        @catch (ADAuthenticationError *error)
        {
            NSMutableDictionary *dict = [ReactNativeAdalUtils ADAuthenticationErrorToDictionary:error];
            callback(@[dict, [NSNull null]]);
        }
}

RCT_EXPORT_METHOD(acquireTokenSilentAsync:(NSDictionary *)obj callback: (RCTResponseSenderBlock)callback)
{
        @try
        {

            NSString *authority = [obj objectForKey:@"authority"] ? [RCTConvert NSString:obj[@"authority"]] : nil;
            NSString *resourceId = [obj objectForKey:@"resourceId"] ? [RCTConvert NSString:obj[@"resourceId"]] : nil;
            NSString *clientId = [obj objectForKey:@"clientId"] ? [RCTConvert NSString:obj[@"clientId"]] : nil;
            NSString *userId = [obj objectForKey:@"userId"] ? [RCTConvert NSString:obj[@"userId"]] : nil;

            BOOL validateAuthority = [obj objectForKey:@"validateAuthority"] ? [RCTConvert BOOL:obj[@"validateAuthority"]] : false;


            ADAuthenticationContext *authContext = [ReactNativeAdalPlugin getOrCreateAuthContext:authority
                                                                           validateAuthority:validateAuthority];


            // TODO iOS sdk requires user name instead of guid so we should map provided id to a known user name
            userId = [ReactNativeAdalUtils mapUserIdToUserName:authContext
                                                    userId:userId];

            [authContext acquireTokenSilentWithResource:resourceId
                                               clientId:clientId
                                            redirectUri:nil
                                                 userId:userId
                                        completionBlock:^(ADAuthenticationResult *result) {
                                          NSMutableDictionary *dict = [ReactNativeAdalUtils ADAuthenticationResultToDictionary:result];
                                          if (AD_SUCCEEDED != result.status){
                                            callback(@[dict, [NSNull null]]);
                                          }
                                          else{
                                            callback(@[[NSNull null], dict]);
                                          }
                                        }];
        }
        @catch (ADAuthenticationError *error)
        {
            NSMutableDictionary *dict = [ReactNativeAdalUtils ADAuthenticationErrorToDictionary:error];
            callback(@[dict, [NSNull null]]);
        }

}

RCT_EXPORT_METHOD(tokenCacheClear:(NSDictionary *)obj callback: (RCTResponseSenderBlock)callback)
{
        @try
        {
            ADAuthenticationError *error;

            ADKeychainTokenCache* cacheStore = [ADKeychainTokenCache new];

            NSArray *cacheItems = [cacheStore allItems:&error];

            for (int i = 0; i < cacheItems.count; i++)
            {
                [cacheStore removeItem: cacheItems[i] error: &error];
            }

            if (error != nil)
            {
                @throw(error);
            }

            callback(@[[NSNull null]]);
        }
        @catch (ADAuthenticationError *error)
        {
            NSMutableDictionary *dict = [ReactNativeAdalUtils ADAuthenticationErrorToDictionary:error];
            callback(@[dict, [NSNull null]]);
        }
}

RCT_EXPORT_METHOD(tokenCacheReadItems:(NSDictionary *)obj callback: (RCTResponseSenderBlock)callback)
{
        @try
        {
            ADAuthenticationError *error;

            ADKeychainTokenCache* cacheStore = [ADKeychainTokenCache new];

            //get all items from cache
            NSArray *cacheItems = [cacheStore allItems:&error];

            NSMutableArray *items = [NSMutableArray arrayWithCapacity:cacheItems.count];

            if (error != nil)
            {
                @throw(error);
            }

            for (id obj in cacheItems)
            {
                [items addObject:[ReactNativeAdalUtils ADTokenCacheStoreItemToDictionary:obj]];
            }

            callback(@[[NSNull null], items]);
        }
        @catch (ADAuthenticationError *error)
        {
            NSMutableDictionary *dict = [ReactNativeAdalUtils ADAuthenticationErrorToDictionary:error];
            callback(@[dict, [NSNull null]]);
        }
}


RCT_EXPORT_METHOD(tokenCacheDeleteItem:(NSDictionary *)obj callback: (RCTResponseSenderBlock)callback)
{
        @try
        {
            ADAuthenticationError *error;

            NSString *authority = [obj objectForKey:@"authority"] ? [RCTConvert NSString:obj[@"authority"]] : nil;
            NSString *resourceId = [obj objectForKey:@"resourceId"] ? [RCTConvert NSString:obj[@"resourceId"]] : nil;
            NSString *clientId = [obj objectForKey:@"clientId"] ? [RCTConvert NSString:obj[@"clientId"]] : nil;
            NSString *userId = [obj objectForKey:@"userId"] ? [RCTConvert NSString:obj[@"userId"]] : nil;
            NSString *itemAuthority =[obj objectForKey:@"itemAuthority"] ? [RCTConvert NSString:obj[@"itemAuthority"]] : nil;

            BOOL validateAuthority = [obj objectForKey:@"validateAuthority"] ? [RCTConvert BOOL:obj[@"validateAuthority"]] : false;

            ADAuthenticationContext *authContext = [ReactNativeAdalPlugin getOrCreateAuthContext:authority
                                                                           validateAuthority:validateAuthority];

            // TODO iOS sdk requires user name instead of guid so we should map provided id to a known user name
            userId = [ReactNativeAdalUtils mapUserIdToUserName:authContext
                                                    userId:userId];

            ADKeychainTokenCache* cacheStore = [ADKeychainTokenCache new];

            //get all items from cache
            NSArray *cacheItems = [cacheStore allItems:&error];

            if (error != nil)
            {
                @throw(error);
            }

            for (ADTokenCacheItem*  item in cacheItems)
            {
                NSDictionary *itemAllClaims = [[item userInformation] allClaims];

                NSString * userUniqueName = (itemAllClaims && itemAllClaims[@"unique_name"]) ? itemAllClaims[@"unique_name"] : nil;

                if ([itemAuthority isEqualToString:[item authority]]
                    && ((userUniqueName != nil && [userUniqueName isEqualToString:userId])
                        || [userId isEqualToString:[[item userInformation] userId]])
                    && [clientId isEqualToString:[item clientId]]
                    // resource could be nil which is fine
                    && ((!resourceId && ![item resource]) || [resourceId isEqualToString:[item resource]])) {

                    //remove item
                    [cacheStore removeItem:item error: &error];

                    if (error != nil)
                    {
                        @throw(error);
                    }
                }

            }

            callback(@[[NSNull null]]);
        }
        @catch (ADAuthenticationError *error)
        {
          NSMutableDictionary *dict = [ReactNativeAdalUtils ADAuthenticationErrorToDictionary:error];
          callback(@[dict, [NSNull null]]);
        }
}

static NSMutableDictionary *existingContexts = nil;

+ (ADAuthenticationContext *)getOrCreateAuthContext:(NSString *)authority
                                  validateAuthority:(BOOL)validate
{
    if (!existingContexts)
    {
        existingContexts = [NSMutableDictionary dictionaryWithCapacity:1];
    }

    ADAuthenticationContext *authContext = [existingContexts objectForKey:authority];

    if (!authContext)
    {
        ADAuthenticationError *error;

        authContext = [ADAuthenticationContext authenticationContextWithAuthority:authority
                                                                validateAuthority:validate
                                                                            error:&error];
        if (error != nil)
        {
            @throw(error);
        }

        [existingContexts setObject:authContext forKey:authority];
    }

    return authContext;
}

@end