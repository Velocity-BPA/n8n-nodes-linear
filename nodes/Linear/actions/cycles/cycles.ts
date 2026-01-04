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
import { CYCLE_FIELDS } from '../../constants/constants';

export const cyclesOperations: INodePropertyOptions[] = [
  { name: 'Add Issue to Cycle', value: 'addIssueToCycle' },
  { name: 'Archive Cycle', value: 'archiveCycle' },
  { name: 'Create Cycle', value: 'createCycle' },
  { name: 'Get Current Cycle', value: 'getCurrentCycle' },
  { name: 'Get Cycle', value: 'getCycle' },
  { name: 'List Cycles', value: 'listCycles' },
  { name: 'Remove Issue from Cycle', value: 'removeIssueFromCycle' },
  { name: 'Update Cycle', value: 'updateCycle' },
];

export const cyclesFields = [
  // Create Cycle
  {
    displayName: 'Team',
    name: 'teamId',
    type: 'options' as const,
    typeOptions: {
      loadOptionsMethod: 'getTeams',
    },
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['cycles'],
        operation: ['createCycle', 'getCurrentCycle', 'listCycles'],
      },
    },
    description: 'The team for the cycle',
  },
  {
    displayName: 'Start Date',
    name: 'startsAt',
    type: 'dateTime' as const,
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['cycles'],
        operation: ['createCycle'],
      },
    },
    description: 'The start date of the cycle',
  },
  {
    displayName: 'End Date',
    name: 'endsAt',
    type: 'dateTime' as const,
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['cycles'],
        operation: ['createCycle'],
      },
    },
    description: 'The end date of the cycle',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection' as const,
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['cycles'],
        operation: ['createCycle'],
      },
    },
    options: [
      {
        displayName: 'Description',
        name: 'description',
        type: 'string' as const,
        typeOptions: {
          rows: 2,
        },
        default: '',
        description: 'The description of the cycle',
      },
      {
        displayName: 'Name',
        name: 'name',
        type: 'string' as const,
        default: '',
        description: 'The name of the cycle',
      },
    ],
  },

  // Cycle ID for get/update/archive
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
        resource: ['cycles'],
        operation: ['getCycle', 'updateCycle', 'archiveCycle', 'addIssueToCycle', 'removeIssueFromCycle'],
      },
    },
    description: 'The cycle to operate on',
  },

  // Update Cycle
  {
    displayName: 'Update Fields',
    name: 'updateFields',
    type: 'collection' as const,
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['cycles'],
        operation: ['updateCycle'],
      },
    },
    options: [
      {
        displayName: 'Completed At',
        name: 'completedAt',
        type: 'dateTime' as const,
        default: '',
        description: 'Mark the cycle as completed at this time',
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string' as const,
        typeOptions: {
          rows: 2,
        },
        default: '',
        description: 'The description of the cycle',
      },
      {
        displayName: 'End Date',
        name: 'endsAt',
        type: 'dateTime' as const,
        default: '',
        description: 'The end date of the cycle',
      },
      {
        displayName: 'Name',
        name: 'name',
        type: 'string' as const,
        default: '',
        description: 'The name of the cycle',
      },
      {
        displayName: 'Start Date',
        name: 'startsAt',
        type: 'dateTime' as const,
        default: '',
        description: 'The start date of the cycle',
      },
    ],
  },

  // Issue for add/remove from cycle
  {
    displayName: 'Issue ID or Identifier',
    name: 'issueId',
    type: 'string' as const,
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['cycles'],
        operation: ['addIssueToCycle', 'removeIssueFromCycle'],
      },
    },
    description: 'The ID (UUID) or identifier (e.g., ENG-123) of the issue',
  },

  // Pagination for list
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean' as const,
    default: false,
    displayOptions: {
      show: {
        resource: ['cycles'],
        operation: ['listCycles'],
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
        resource: ['cycles'],
        operation: ['listCycles'],
        returnAll: [false],
      },
    },
    description: 'Max number of results to return',
  },
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection' as const,
    placeholder: 'Add Filter',
    default: {},
    displayOptions: {
      show: {
        resource: ['cycles'],
        operation: ['listCycles'],
      },
    },
    options: [
      {
        displayName: 'Include Archived',
        name: 'includeArchived',
        type: 'boolean' as const,
        default: false,
        description: 'Whether to include archived cycles',
      },
    ],
  },
];

export async function executeCyclesOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject> {
  let result: IDataObject = {};

  switch (operation) {
    case 'listCycles':
      result = await listCycles.call(this, i);
      break;
    case 'getCycle':
      result = await getCycle.call(this, i);
      break;
    case 'createCycle':
      result = await createCycle.call(this, i);
      break;
    case 'updateCycle':
      result = await updateCycle.call(this, i);
      break;
    case 'archiveCycle':
      result = await archiveCycle.call(this, i);
      break;
    case 'getCurrentCycle':
      result = await getCurrentCycle.call(this, i);
      break;
    case 'addIssueToCycle':
      result = await addIssueToCycle.call(this, i);
      break;
    case 'removeIssueFromCycle':
      result = await removeIssueFromCycle.call(this, i);
      break;
  }

  return result;
}

async function listCycles(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const teamId = this.getNodeParameter('teamId', i) as string;
  const returnAll = this.getNodeParameter('returnAll', i) as boolean;
  const limit = this.getNodeParameter('limit', i, 50) as number;
  const filters = this.getNodeParameter('filters', i, {}) as IDataObject;

  const query = `
    query Cycles($teamId: String!, $first: Int, $after: String, $includeArchived: Boolean) {
      team(id: $teamId) {
        cycles(first: $first, after: $after, includeArchived: $includeArchived) {
          nodes {
            ${CYCLE_FIELDS}
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    }
  `;

  const cycles = await linearGraphQLPaginatedRequest.call(
    this,
    query,
    { teamId, includeArchived: filters.includeArchived === true },
    'team.cycles',
    returnAll,
    limit,
  );

  return { cycles };
}

async function getCycle(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const cycleId = this.getNodeParameter('cycleId', i) as string;

  const query = `
    query Cycle($id: String!) {
      cycle(id: $id) {
        ${CYCLE_FIELDS}
        issues {
          nodes {
            id
            identifier
            title
            state {
              name
            }
          }
        }
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, query, { id: cycleId });
  return (response as IDataObject).cycle as IDataObject;
}

async function createCycle(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const teamId = this.getNodeParameter('teamId', i) as string;
  const startsAt = this.getNodeParameter('startsAt', i) as string;
  const endsAt = this.getNodeParameter('endsAt', i) as string;
  const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

  const input = cleanObject({
    teamId,
    startsAt,
    endsAt,
    ...additionalFields,
  });

  const mutation = `
    mutation CycleCreate($input: CycleCreateInput!) {
      cycleCreate(input: $input) {
        success
        cycle {
          ${CYCLE_FIELDS}
        }
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, mutation, { input });
  return ((response as IDataObject).cycleCreate as IDataObject).cycle as IDataObject;
}

async function updateCycle(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const cycleId = this.getNodeParameter('cycleId', i) as string;
  const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;

  const input = cleanObject(updateFields);

  const mutation = `
    mutation CycleUpdate($id: String!, $input: CycleUpdateInput!) {
      cycleUpdate(id: $id, input: $input) {
        success
        cycle {
          ${CYCLE_FIELDS}
        }
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, mutation, { id: cycleId, input });
  return ((response as IDataObject).cycleUpdate as IDataObject).cycle as IDataObject;
}

async function archiveCycle(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const cycleId = this.getNodeParameter('cycleId', i) as string;

  const mutation = `
    mutation CycleArchive($id: String!) {
      cycleArchive(id: $id) {
        success
        entity {
          ${CYCLE_FIELDS}
        }
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, mutation, { id: cycleId });
  return ((response as IDataObject).cycleArchive as IDataObject).entity as IDataObject;
}

async function getCurrentCycle(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const teamId = this.getNodeParameter('teamId', i) as string;

  const query = `
    query CurrentCycle($teamId: String!) {
      team(id: $teamId) {
        activeCycle {
          ${CYCLE_FIELDS}
          issues {
            nodes {
              id
              identifier
              title
              state {
                name
              }
            }
          }
        }
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, query, { id: teamId });
  const team = (response as IDataObject).team as IDataObject;
  return team?.activeCycle as IDataObject || { message: 'No active cycle found' };
}

async function addIssueToCycle(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const cycleId = this.getNodeParameter('cycleId', i) as string;
  const issueId = this.getNodeParameter('issueId', i) as string;

  const mutation = `
    mutation IssueUpdate($id: String!, $input: IssueUpdateInput!) {
      issueUpdate(id: $id, input: $input) {
        success
        issue {
          id
          identifier
          title
          cycle {
            id
            number
            name
          }
        }
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, mutation, { 
    id: issueId, 
    input: { cycleId } 
  });
  return ((response as IDataObject).issueUpdate as IDataObject).issue as IDataObject;
}

async function removeIssueFromCycle(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const issueId = this.getNodeParameter('issueId', i) as string;

  const mutation = `
    mutation IssueUpdate($id: String!, $input: IssueUpdateInput!) {
      issueUpdate(id: $id, input: $input) {
        success
        issue {
          id
          identifier
          title
          cycle {
            id
            number
            name
          }
        }
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, mutation, { 
    id: issueId, 
    input: { cycleId: null } 
  });
  return ((response as IDataObject).issueUpdate as IDataObject).issue as IDataObject;
}
