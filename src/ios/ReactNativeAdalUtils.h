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

#import <Foundation/Foundation.h>
#import <ADAL/ADAL.h>

// Implements helper functionality for Cordova ADAL Plugin.
@interface ReactNativeAdalUtils : NSObject

// Populates dictonary from ADAuthenticationResult class instance.
+ (NSMutableDictionary *)ADAuthenticationResultToDictionary:(ADAuthenticationResult *)obj;

// Populates dictonary from ADUserInformation class instance.
+ (id)ADUserInformationToDictionary:(ADUserInformation *)obj;

// Populates dictonary from ADTokenCacheStoreItem class instance.
+ (NSMutableDictionary *)ADAuthenticationErrorToDictionary:(ADAuthenticationError *)obj;

// Populates dictonary from ADTokenCacheStoreItem class instance.
+ (NSMutableDictionary *)ADTokenCacheStoreItemToDictionary:(ADTokenCacheItem *)obj;

// Retrieves user name from Token Cache Store.
+ (NSString *)mapUserIdToUserName:(ADAuthenticationContext *)authContext
                           userId:(NSString *)userId;
@end