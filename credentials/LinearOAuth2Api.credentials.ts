/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class LinearOAuth2Api implements ICredentialType {
  name = 'linearOAuth2Api';
  displayName = 'Linear OAuth2 API';
  documentationUrl = 'https://developers.linear.app/docs/oauth/authentication';
  extends = ['oAuth2Api'];
  properties: INodeProperties[] = [
    {
      displayName: 'Grant Type',
      name: 'grantType',
      type: 'hidden',
      default: 'authorizationCode',
    },
    {
      displayName: 'Authorization URL',
      name: 'authUrl',
      type: 'hidden',
      default: 'https://linear.app/oauth/authorize',
    },
    {
      displayName: 'Access Token URL',
      name: 'accessTokenUrl',
      type: 'hidden',
      default: 'https://api.linear.app/oauth/token',
    },
    {
      displayName: 'Scope',
      name: 'scope',
      type: 'hidden',
      default: 'read write issues:create comments:create',
    },
    {
      displayName: 'Auth URI Query Parameters',
      name: 'authQueryParameters',
      type: 'hidden',
      default: 'response_type=code&prompt=consent',
    },
    {
      displayName: 'Authentication',
      name: 'authentication',
      type: 'hidden',
      default: 'body',
    },
    {
      displayName: 'Actor',
      name: 'actor',
      type: 'options',
      options: [
        {
          name: 'User',
          value: 'user',
          description: 'Act as the authenticated user',
        },
        {
          name: 'Application',
          value: 'application',
          description: 'Act as the application',
        },
      ],
      default: 'user',
      description: 'Whether to act as the user or the application',
    },
  ];
}
