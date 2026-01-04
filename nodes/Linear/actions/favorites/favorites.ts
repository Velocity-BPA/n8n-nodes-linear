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

const FAVORITE_FIELDS = `
  id
  type
  sortOrder
  folderName
  createdAt
  updatedAt
  parent {
    id
    type
    folderName
  }
  issue {
    id
    identifier
    title
  }
  project {
    id
    name
  }
  cycle {
    id
    number
    name
  }
  label {
    id
    name
  }
  user {
    id
    name
    email
  }
`;

export const favoritesOperations: INodePropertyOptions[] = [
  { name: 'Create Favorite', value: 'createFavorite' },
  { name: 'Delete Favorite', value: 'deleteFavorite' },
  { name: 'List Favorites', value: 'listFavorites' },
];

export const favoritesFields = [
  // Favorite ID for delete
  {
    displayName: 'Favorite ID',
    name: 'favoriteId',
    type: 'string' as const,
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['favorites'],
        operation: ['deleteFavorite'],
      },
    },
    description: 'The ID of the favorite to delete',
  },

  // Create Favorite
  {
    displayName: 'Favorite Type',
    name: 'favoriteType',
    type: 'options' as const,
    options: [
      { name: 'Cycle', value: 'cycle' },
      { name: 'Issue', value: 'issue' },
      { name: 'Label', value: 'label' },
      { name: 'Project', value: 'project' },
      { name: 'User', value: 'user' },
    ],
    default: 'issue',
    required: true,
    displayOptions: {
      show: {
        resource: ['favorites'],
        operation: ['createFavorite'],
      },
    },
    description: 'The type of item to favorite',
  },

  // Issue favorite
  {
    displayName: 'Issue ID or Identifier',
    name: 'issueId',
    type: 'string' as const,
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['favorites'],
        operation: ['createFavorite'],
        favoriteType: ['issue'],
      },
    },
    description: 'The ID (UUID) or identifier (e.g., ENG-123) of the issue to favorite',
  },

  // Project favorite
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
        resource: ['favorites'],
        operation: ['createFavorite'],
        favoriteType: ['project'],
      },
    },
    description: 'The project to favorite',
  },

  // Cycle favorite
  {
    displayName: 'Cycle',
    name: 'cycleId',
    type: 'options' as const,
    typeOptions: {
      loadOptionsMethod: 'getCycles',
    },
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['favorites'],
        operation: ['createFavorite'],
        favoriteType: ['cycle'],
      },
    },
    description: 'The cycle to favorite',
  },

  // Label favorite
  {
    displayName: 'Label ID',
    name: 'labelId',
    type: 'string' as const,
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['favorites'],
        operation: ['createFavorite'],
        favoriteType: ['label'],
      },
    },
    description: 'The ID of the label to favorite',
  },

  // User favorite
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
        resource: ['favorites'],
        operation: ['createFavorite'],
        favoriteType: ['user'],
      },
    },
    description: 'The user to favorite',
  },

  // Additional fields
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection' as const,
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['favorites'],
        operation: ['createFavorite'],
      },
    },
    options: [
      {
        displayName: 'Folder Name',
        name: 'folderName',
        type: 'string' as const,
        default: '',
        description: 'The name of the folder to place the favorite in',
      },
      {
        displayName: 'Parent Favorite ID',
        name: 'parentId',
        type: 'string' as const,
        default: '',
        description: 'The ID of the parent favorite (for nesting)',
      },
      {
        displayName: 'Sort Order',
        name: 'sortOrder',
        type: 'number' as const,
        default: 0,
        description: 'The sort order of the favorite',
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
        resource: ['favorites'],
        operation: ['listFavorites'],
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
        resource: ['favorites'],
        operation: ['listFavorites'],
        returnAll: [false],
      },
    },
    description: 'Max number of results to return',
  },
];

export async function executeFavoritesOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject> {
  let result: IDataObject = {};

  switch (operation) {
    case 'listFavorites':
      result = await listFavorites.call(this, i);
      break;
    case 'createFavorite':
      result = await createFavorite.call(this, i);
      break;
    case 'deleteFavorite':
      result = await deleteFavorite.call(this, i);
      break;
  }

  return result;
}

async function listFavorites(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const returnAll = this.getNodeParameter('returnAll', i) as boolean;
  const limit = this.getNodeParameter('limit', i, 50) as number;

  const query = `
    query Favorites($first: Int, $after: String) {
      favorites(first: $first, after: $after) {
        nodes {
          ${FAVORITE_FIELDS}
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;

  const favorites = await linearGraphQLPaginatedRequest.call(
    this,
    query,
    {},
    'favorites',
    returnAll,
    limit,
  );

  return { favorites };
}

async function createFavorite(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const favoriteType = this.getNodeParameter('favoriteType', i) as string;
  const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

  const input: IDataObject = cleanObject(additionalFields);

  // Set the appropriate ID based on type
  switch (favoriteType) {
    case 'issue':
      input.issueId = this.getNodeParameter('issueId', i) as string;
      break;
    case 'project':
      input.projectId = this.getNodeParameter('projectId', i) as string;
      break;
    case 'cycle':
      input.cycleId = this.getNodeParameter('cycleId', i) as string;
      break;
    case 'label':
      input.labelId = this.getNodeParameter('labelId', i) as string;
      break;
    case 'user':
      input.userId = this.getNodeParameter('userId', i) as string;
      break;
  }

  const mutation = `
    mutation FavoriteCreate($input: FavoriteCreateInput!) {
      favoriteCreate(input: $input) {
        success
        favorite {
          ${FAVORITE_FIELDS}
        }
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, mutation, { input });
  return ((response as IDataObject).favoriteCreate as IDataObject).favorite as IDataObject;
}

async function deleteFavorite(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const favoriteId = this.getNodeParameter('favoriteId', i) as string;

  const mutation = `
    mutation FavoriteDelete($id: String!) {
      favoriteDelete(id: $id) {
        success
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, mutation, { id: favoriteId });
  return { success: ((response as IDataObject).favoriteDelete as IDataObject).success };
}
