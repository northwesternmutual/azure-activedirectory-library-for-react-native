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


#import <React/RCTBridgeModule.h>
#import <ADAL/ADAuthenticationContext.h>

@interface ReactNativeAdalPlugin : NSObject <RCTBridgeModule>

+ (ADAuthenticationContext *)getOrCreateAuthContext:(NSString *)authority
                                  validateAuthority:(BOOL)validate;

@end