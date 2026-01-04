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
import { LABEL_FIELDS } from '../../constants/constants';

export const labelsOperations: INodePropertyOptions[] = [
  { name: 'Archive Label', value: 'archiveLabel' },
  { name: 'Create Label', value: 'createLabel' },
  { name: 'Delete Label', value: 'deleteLabel' },
  { name: 'Get Label', value: 'getLabel' },
  { name: 'List Labels', value: 'listLabels' },
  { name: 'Update Label', value: 'updateLabel' },
];

export const labelsFields = [
  // Label ID for get/update/delete/archive
  {
    displayName: 'Label ID',
    name: 'labelId',
    type: 'string' as const,
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['labels'],
        operation: ['getLabel', 'updateLabel', 'deleteLabel', 'archiveLabel'],
      },
    },
    description: 'The ID of the label',
  },

  // Create Label
  {
    displayName: 'Team',
    name: 'teamId',
    type: 'options' as const,
    typeOptions: {
      loadOptionsMethod: 'getTeams',
    },
    default: '',
    displayOptions: {
      show: {
        resource: ['labels'],
        operation: ['createLabel', 'listLabels'],
      },
    },
    description: 'The team for the label (leave empty for organization-wide label)',
  },
  {
    displayName: 'Name',
    name: 'name',
    type: 'string' as const,
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['labels'],
        operation: ['createLabel'],
      },
    },
    description: 'The name of the label',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection' as const,
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['labels'],
        operation: ['createLabel'],
      },
    },
    options: [
      {
        displayName: 'Color',
        name: 'color',
        type: 'color' as const,
        default: '#6366f1',
        description: 'The color of the label',
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string' as const,
        default: '',
        description: 'The description of the label',
      },
      {
        displayName: 'Parent Label ID',
        name: 'parentId',
        type: 'string' as const,
        default: '',
        description: 'The ID of the parent label (for nested labels)',
      },
    ],
  },

  // Update Label
  {
    displayName: 'Update Fields',
    name: 'updateFields',
    type: 'collection' as const,
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['labels'],
        operation: ['updateLabel'],
      },
    },
    options: [
      {
        displayName: 'Color',
        name: 'color',
        type: 'color' as const,
        default: '#6366f1',
        description: 'The color of the label',
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string' as const,
        default: '',
        description: 'The description of the label',
      },
      {
        displayName: 'Name',
        name: 'name',
        type: 'string' as const,
        default: '',
        description: 'The name of the label',
      },
      {
        displayName: 'Parent Label ID',
        name: 'parentId',
        type: 'string' as const,
        default: '',
        description: 'The ID of the parent label',
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
        resource: ['labels'],
        operation: ['listLabels'],
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
        resource: ['labels'],
        operation: ['listLabels'],
        returnAll: [false],
      },
    },
    description: 'Max number of results to return',
  },

  // Filters
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection' as const,
    placeholder: 'Add Filter',
    default: {},
    displayOptions: {
      show: {
        resource: ['labels'],
        operation: ['listLabels'],
      },
    },
    options: [
      {
        displayName: 'Include Archived',
        name: 'includeArchived',
        type: 'boolean' as const,
        default: false,
        description: 'Whether to include archived labels',
      },
    ],
  },
];

export async function executeLabelsOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject> {
  let result: IDataObject = {};

  switch (operation) {
    case 'listLabels':
      result = await listLabels.call(this, i);
      break;
    case 'getLabel':
      result = await getLabel.call(this, i);
      break;
    case 'createLabel':
      result = await createLabel.call(this, i);
      break;
    case 'updateLabel':
      result = await updateLabel.call(this, i);
      break;
    case 'deleteLabel':
      result = await deleteLabel.call(this, i);
      break;
    case 'archiveLabel':
      result = await archiveLabel.call(this, i);
      break;
  }

  return result;
}

async function listLabels(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const teamId = this.getNodeParameter('teamId', i, '') as string;
  const returnAll = this.getNodeParameter('returnAll', i) as boolean;
  const limit = this.getNodeParameter('limit', i, 50) as number;
  const filters = this.getNodeParameter('filters', i, {}) as IDataObject;

  // If team specified, get team labels
  if (teamId) {
    const query = `
      query TeamLabels($id: String!, $first: Int, $after: String, $includeArchived: Boolean) {
        team(id: $id) {
          labels(first: $first, after: $after, includeArchived: $includeArchived) {
            nodes {
              ${LABEL_FIELDS}
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      }
    `;

    const labels = await linearGraphQLPaginatedRequest.call(
      this,
      query,
      { id: teamId, includeArchived: filters.includeArchived === true },
      'team.labels',
      returnAll,
      limit,
    );

    return { labels };
  }

  // Get all labels (organization-wide)
  const query = `
    query Labels($first: Int, $after: String, $includeArchived: Boolean) {
      issueLabels(first: $first, after: $after, includeArchived: $includeArchived) {
        nodes {
          ${LABEL_FIELDS}
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;

  const labels = await linearGraphQLPaginatedRequest.call(
    this,
    query,
    { includeArchived: filters.includeArchived === true },
    'issueLabels',
    returnAll,
    limit,
  );

  return { labels };
}

async function getLabel(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const labelId = this.getNodeParameter('labelId', i) as string;

  const query = `
    query IssueLabel($id: String!) {
      issueLabel(id: $id) {
        ${LABEL_FIELDS}
        issues {
          nodes {
            id
            identifier
            title
          }
        }
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, query, { id: labelId });
  return (response as IDataObject).issueLabel as IDataObject;
}

async function createLabel(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const name = this.getNodeParameter('name', i) as string;
  const teamId = this.getNodeParameter('teamId', i, '') as string;
  const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

  const input = cleanObject({
    name,
    ...(teamId && { teamId }),
    ...additionalFields,
  });

  const mutation = `
    mutation IssueLabelCreate($input: IssueLabelCreateInput!) {
      issueLabelCreate(input: $input) {
        success
        issueLabel {
          ${LABEL_FIELDS}
        }
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, mutation, { input });
  return ((response as IDataObject).issueLabelCreate as IDataObject).issueLabel as IDataObject;
}

async function updateLabel(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const labelId = this.getNodeParameter('labelId', i) as string;
  const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;

  const input = cleanObject(updateFields);

  const mutation = `
    mutation IssueLabelUpdate($id: String!, $input: IssueLabelUpdateInput!) {
      issueLabelUpdate(id: $id, input: $input) {
        success
        issueLabel {
          ${LABEL_FIELDS}
        }
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, mutation, { id: labelId, input });
  return ((response as IDataObject).issueLabelUpdate as IDataObject).issueLabel as IDataObject;
}

async function deleteLabel(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const labelId = this.getNodeParameter('labelId', i) as string;

  const mutation = `
    mutation IssueLabelDelete($id: String!) {
      issueLabelDelete(id: $id) {
        success
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, mutation, { id: labelId });
  return { success: ((response as IDataObject).issueLabelDelete as IDataObject).success };
}

async function archiveLabel(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const labelId = this.getNodeParameter('labelId', i) as string;

  const mutation = `
    mutation IssueLabelArchive($id: String!) {
      issueLabelArchive(id: $id) {
        success
        entity {
          ${LABEL_FIELDS}
        }
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, mutation, { id: labelId });
  return ((response as IDataObject).issueLabelArchive as IDataObject).entity as IDataObject;
}
