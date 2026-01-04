/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions, IDataObject, INodePropertyOptions } from 'n8n-workflow';
import {
  linearGraphQLRequest,
  linearGraphQLPaginatedRequest,
} from '../../transport/graphql';

const INTEGRATION_FIELDS = `
  id
  service
  createdAt
  updatedAt
  creator {
    id
    name
    email
  }
  team {
    id
    name
    key
  }
`;

export const integrationsOperations: INodePropertyOptions[] = [
  { name: 'Delete Integration', value: 'deleteIntegration' },
  { name: 'Get Integration', value: 'getIntegration' },
  { name: 'List Integration Templates', value: 'listIntegrationTemplates' },
  { name: 'List Integrations', value: 'listIntegrations' },
];

export const integrationsFields = [
  // Integration ID for get/delete
  {
    displayName: 'Integration ID',
    name: 'integrationId',
    type: 'string' as const,
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['integrations'],
        operation: ['getIntegration', 'deleteIntegration'],
      },
    },
    description: 'The ID of the integration',
  },

  // Pagination
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean' as const,
    default: false,
    displayOptions: {
      show: {
        resource: ['integrations'],
        operation: ['listIntegrations', 'listIntegrationTemplates'],
      },
    },
    description: 'Whether to return all results or only up to a given limit',
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number' as const,
    default: 50,
    typeOptions: {
      minValue: 1,
      maxValue: 250,
    },
    displayOptions: {
      show: {
        resource: ['integrations'],
        operation: ['listIntegrations', 'listIntegrationTemplates'],
        returnAll: [false],
      },
    },
    description: 'Max number of results to return',
  },
];

export async function executeIntegrationsOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject> {
  let result: IDataObject = {};

  switch (operation) {
    case 'listIntegrations':
      result = await listIntegrations.call(this, i);
      break;
    case 'getIntegration':
      result = await getIntegration.call(this, i);
      break;
    case 'deleteIntegration':
      result = await deleteIntegration.call(this, i);
      break;
    case 'listIntegrationTemplates':
      result = await listIntegrationTemplates.call(this, i);
      break;
  }

  return result;
}

async function listIntegrations(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const returnAll = this.getNodeParameter('returnAll', i) as boolean;
  const limit = this.getNodeParameter('limit', i, 50) as number;

  const query = `
    query Integrations($first: Int, $after: String) {
      integrations(first: $first, after: $after) {
        nodes {
          ${INTEGRATION_FIELDS}
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;

  const integrations = await linearGraphQLPaginatedRequest.call(
    this,
    query,
    {},
    'integrations',
    returnAll,
    limit,
  );

  return { integrations };
}

async function getIntegration(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const integrationId = this.getNodeParameter('integrationId', i) as string;

  const query = `
    query Integration($id: String!) {
      integration(id: $id) {
        ${INTEGRATION_FIELDS}
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, query, { id: integrationId });
  return (response as IDataObject).integration as IDataObject;
}

async function deleteIntegration(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const integrationId = this.getNodeParameter('integrationId', i) as string;

  const mutation = `
    mutation IntegrationDelete($id: String!) {
      integrationDelete(id: $id) {
        success
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, mutation, { id: integrationId });
  return { success: ((response as IDataObject).integrationDelete as IDataObject).success };
}

async function listIntegrationTemplates(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const returnAll = this.getNodeParameter('returnAll', i) as boolean;
  const limit = this.getNodeParameter('limit', i, 50) as number;

  const query = `
    query IntegrationTemplates($first: Int, $after: String) {
      integrationTemplates(first: $first, after: $after) {
        nodes {
          id
          name
          description
          logoUrl
          service
          templateUrl
          createdAt
          updatedAt
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;

  const templates = await linearGraphQLPaginatedRequest.call(
    this,
    query,
    {},
    'integrationTemplates',
    returnAll,
    limit,
  );

  return { templates };
}
