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
import { USER_FIELDS, ISSUE_FIELDS } from '../../constants/constants';

export const usersOperations: INodePropertyOptions[] = [
  { name: 'Get Current User', value: 'getCurrentUser' },
  { name: 'Get User', value: 'getUser' },
  { name: 'Get User Assigned Issues', value: 'getUserAssignedIssues' },
  { name: 'List Users', value: 'listUsers' },
  { name: 'Suspend User', value: 'suspendUser' },
  { name: 'Unsuspend User', value: 'unsuspendUser' },
  { name: 'Update User', value: 'updateUser' },
];

export const usersFields = [
  // User ID for get/update/suspend operations
  {
    displayName: 'User',
    name: 'userId',
    type: 'options' as const,
    typeOptions: {
      loadOptionsMethod: 'getUsers',
    },
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['users'],
        operation: ['getUser', 'updateUser', 'suspendUser', 'unsuspendUser', 'getUserAssignedIssues'],
      },
    },
    description: 'The user to operate on',
  },

  // Update User
  {
    displayName: 'Update Fields',
    name: 'updateFields',
    type: 'collection' as const,
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['users'],
        operation: ['updateUser'],
      },
    },
    options: [
      {
        displayName: 'Active',
        name: 'active',
        type: 'boolean' as const,
        default: true,
        description: 'Whether the user is active',
      },
      {
        displayName: 'Admin',
        name: 'admin',
        type: 'boolean' as const,
        default: false,
        description: 'Whether the user is an admin',
      },
      {
        displayName: 'Avatar URL',
        name: 'avatarUrl',
        type: 'string' as const,
        default: '',
        description: 'The URL of the user avatar',
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string' as const,
        typeOptions: {
          rows: 2,
        },
        default: '',
        description: 'A description about the user',
      },
      {
        displayName: 'Display Name',
        name: 'displayName',
        type: 'string' as const,
        default: '',
        description: 'The display name of the user',
      },
      {
        displayName: 'Name',
        name: 'name',
        type: 'string' as const,
        default: '',
        description: 'The name of the user',
      },
      {
        displayName: 'Timezone',
        name: 'timezone',
        type: 'string' as const,
        default: '',
        description: 'The timezone of the user',
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
        resource: ['users'],
        operation: ['listUsers', 'getUserAssignedIssues'],
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
        resource: ['users'],
        operation: ['listUsers', 'getUserAssignedIssues'],
        returnAll: [false],
      },
    },
    description: 'Max number of results to return',
  },

  // Filters for list
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection' as const,
    placeholder: 'Add Filter',
    default: {},
    displayOptions: {
      show: {
        resource: ['users'],
        operation: ['listUsers'],
      },
    },
    options: [
      {
        displayName: 'Active Only',
        name: 'activeOnly',
        type: 'boolean' as const,
        default: true,
        description: 'Whether to show only active users',
      },
      {
        displayName: 'Include Archived',
        name: 'includeArchived',
        type: 'boolean' as const,
        default: false,
        description: 'Whether to include archived users',
      },
    ],
  },
];

export async function executeUsersOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject> {
  let result: IDataObject = {};

  switch (operation) {
    case 'listUsers':
      result = await listUsers.call(this, i);
      break;
    case 'getUser':
      result = await getUser.call(this, i);
      break;
    case 'getCurrentUser':
      result = await getCurrentUser.call(this);
      break;
    case 'updateUser':
      result = await updateUser.call(this, i);
      break;
    case 'suspendUser':
      result = await suspendUser.call(this, i);
      break;
    case 'unsuspendUser':
      result = await unsuspendUser.call(this, i);
      break;
    case 'getUserAssignedIssues':
      result = await getUserAssignedIssues.call(this, i);
      break;
  }

  return result;
}

async function listUsers(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const returnAll = this.getNodeParameter('returnAll', i) as boolean;
  const limit = this.getNodeParameter('limit', i, 50) as number;
  const filters = this.getNodeParameter('filters', i, {}) as IDataObject;

  const query = `
    query Users($first: Int, $after: String, $includeArchived: Boolean) {
      users(first: $first, after: $after, includeArchived: $includeArchived) {
        nodes {
          ${USER_FIELDS}
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;

  let users = await linearGraphQLPaginatedRequest.call(
    this,
    query,
    { includeArchived: filters.includeArchived === true },
    'users',
    returnAll,
    limit,
  ) as IDataObject[];

  // Filter active users if requested
  if (filters.activeOnly === true) {
    users = users.filter((user) => user.active === true);
  }

  return { users };
}

async function getUser(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const userId = this.getNodeParameter('userId', i) as string;

  const query = `
    query User($id: String!) {
      user(id: $id) {
        ${USER_FIELDS}
        description
        statusLabel
        statusEmoji
        statusUntilAt
        organization {
          id
          name
        }
        teams {
          nodes {
            id
            name
            key
          }
        }
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, query, { id: userId });
  return (response as IDataObject).user as IDataObject;
}

async function getCurrentUser(this: IExecuteFunctions): Promise<IDataObject> {
  const query = `
    query Viewer {
      viewer {
        ${USER_FIELDS}
        description
        statusLabel
        statusEmoji
        statusUntilAt
        organization {
          id
          name
          urlKey
        }
        teams {
          nodes {
            id
            name
            key
          }
        }
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, query, {});
  return (response as IDataObject).viewer as IDataObject;
}

async function updateUser(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const userId = this.getNodeParameter('userId', i) as string;
  const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;

  const input = cleanObject(updateFields);

  const mutation = `
    mutation UserUpdate($id: String!, $input: UserUpdateInput!) {
      userUpdate(id: $id, input: $input) {
        success
        user {
          ${USER_FIELDS}
        }
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, mutation, { id: userId, input });
  return ((response as IDataObject).userUpdate as IDataObject).user as IDataObject;
}

async function suspendUser(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const userId = this.getNodeParameter('userId', i) as string;

  const mutation = `
    mutation UserSuspend($id: String!) {
      userSuspend(id: $id) {
        success
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, mutation, { id: userId });
  return { success: ((response as IDataObject).userSuspend as IDataObject).success };
}

async function unsuspendUser(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const userId = this.getNodeParameter('userId', i) as string;

  const mutation = `
    mutation UserUnsuspend($id: String!) {
      userUnsuspend(id: $id) {
        success
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, mutation, { id: userId });
  return { success: ((response as IDataObject).userUnsuspend as IDataObject).success };
}

async function getUserAssignedIssues(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const userId = this.getNodeParameter('userId', i) as string;
  const returnAll = this.getNodeParameter('returnAll', i) as boolean;
  const limit = this.getNodeParameter('limit', i, 50) as number;

  const query = `
    query UserAssignedIssues($id: String!, $first: Int, $after: String) {
      user(id: $id) {
        assignedIssues(first: $first, after: $after) {
          nodes {
            ${ISSUE_FIELDS}
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    }
  `;

  const issues = await linearGraphQLPaginatedRequest.call(
    this,
    query,
    { id: userId },
    'user.assignedIssues',
    returnAll,
    limit,
  );

  return { issues };
}
