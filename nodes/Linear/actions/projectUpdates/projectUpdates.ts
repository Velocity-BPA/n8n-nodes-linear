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
  cleanObject,
} from '../../transport/graphql';
import { PROJECT_UPDATE_FIELDS, HEALTH_OPTIONS } from '../../constants/constants';

export const projectUpdatesOperations: INodePropertyOptions[] = [
  { name: 'Create Project Update', value: 'createProjectUpdate' },
  { name: 'Delete Project Update', value: 'deleteProjectUpdate' },
  { name: 'List Project Updates', value: 'listProjectUpdates' },
  { name: 'Update Project Update', value: 'updateProjectUpdate' },
];

export const projectUpdatesFields = [
  // Project ID for listing/creating updates
  {
    displayName: 'Project',
    name: 'projectId',
    type: 'options' as const,
    typeOptions: {
      loadOptionsMethod: 'getProjects',
    },
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['projectUpdates'],
        operation: ['listProjectUpdates', 'createProjectUpdate'],
      },
    },
    description: 'The project to get/create updates for',
  },

  // Update ID
  {
    displayName: 'Update ID',
    name: 'updateId',
    type: 'string' as const,
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['projectUpdates'],
        operation: ['updateProjectUpdate', 'deleteProjectUpdate'],
      },
    },
    description: 'The ID of the project update',
  },

  // Create/Update fields
  {
    displayName: 'Body',
    name: 'body',
    type: 'string' as const,
    typeOptions: {
      rows: 6,
    },
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['projectUpdates'],
        operation: ['createProjectUpdate'],
      },
    },
    description: 'The content of the project update (Markdown supported)',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection' as const,
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['projectUpdates'],
        operation: ['createProjectUpdate'],
      },
    },
    options: [
      {
        displayName: 'Health',
        name: 'health',
        type: 'options' as const,
        options: HEALTH_OPTIONS,
        default: 'onTrack',
        description: 'The health status of the project',
      },
    ],
  },

  // Update fields for updating
  {
    displayName: 'Update Fields',
    name: 'updateFields',
    type: 'collection' as const,
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['projectUpdates'],
        operation: ['updateProjectUpdate'],
      },
    },
    options: [
      {
        displayName: 'Body',
        name: 'body',
        type: 'string' as const,
        typeOptions: {
          rows: 6,
        },
        default: '',
        description: 'The content of the project update',
      },
      {
        displayName: 'Health',
        name: 'health',
        type: 'options' as const,
        options: HEALTH_OPTIONS,
        default: 'onTrack',
        description: 'The health status of the project',
      },
    ],
  },

  // Pagination
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean' as const,
    default: false,
    displayOptions: {
      show: {
        resource: ['projectUpdates'],
        operation: ['listProjectUpdates'],
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
        resource: ['projectUpdates'],
        operation: ['listProjectUpdates'],
        returnAll: [false],
      },
    },
    description: 'Max number of results to return',
  },
];

export async function executeProjectUpdatesOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject> {
  let result: IDataObject = {};

  switch (operation) {
    case 'listProjectUpdates':
      result = await listProjectUpdates.call(this, i);
      break;
    case 'createProjectUpdate':
      result = await createProjectUpdate.call(this, i);
      break;
    case 'updateProjectUpdate':
      result = await updateProjectUpdate.call(this, i);
      break;
    case 'deleteProjectUpdate':
      result = await deleteProjectUpdate.call(this, i);
      break;
  }

  return result;
}

async function listProjectUpdates(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const projectId = this.getNodeParameter('projectId', i) as string;
  const returnAll = this.getNodeParameter('returnAll', i) as boolean;
  const limit = this.getNodeParameter('limit', i, 50) as number;

  const query = `
    query ProjectUpdates($projectId: String!, $first: Int, $after: String) {
      project(id: $projectId) {
        projectUpdates(first: $first, after: $after) {
          nodes {
            ${PROJECT_UPDATE_FIELDS}
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    }
  `;

  const updates = await linearGraphQLPaginatedRequest.call(
    this,
    query,
    { projectId },
    'project.projectUpdates',
    returnAll,
    limit,
  );

  return { projectUpdates: updates };
}

async function createProjectUpdate(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const projectId = this.getNodeParameter('projectId', i) as string;
  const body = this.getNodeParameter('body', i) as string;
  const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

  const input = cleanObject({
    projectId,
    body,
    ...additionalFields,
  });

  const mutation = `
    mutation ProjectUpdateCreate($input: ProjectUpdateCreateInput!) {
      projectUpdateCreate(input: $input) {
        success
        projectUpdate {
          ${PROJECT_UPDATE_FIELDS}
        }
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, mutation, { input });
  return ((response as IDataObject).projectUpdateCreate as IDataObject).projectUpdate as IDataObject;
}

async function updateProjectUpdate(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const updateId = this.getNodeParameter('updateId', i) as string;
  const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;

  const input = cleanObject(updateFields);

  const mutation = `
    mutation ProjectUpdateUpdate($id: String!, $input: ProjectUpdateUpdateInput!) {
      projectUpdateUpdate(id: $id, input: $input) {
        success
        projectUpdate {
          ${PROJECT_UPDATE_FIELDS}
        }
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, mutation, { id: updateId, input });
  return ((response as IDataObject).projectUpdateUpdate as IDataObject).projectUpdate as IDataObject;
}

async function deleteProjectUpdate(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const updateId = this.getNodeParameter('updateId', i) as string;

  const mutation = `
    mutation ProjectUpdateDelete($id: String!) {
      projectUpdateDelete(id: $id) {
        success
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, mutation, { id: updateId });
  return { success: ((response as IDataObject).projectUpdateDelete as IDataObject).success };
}
