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
import { WORKFLOW_STATE_FIELDS } from '../../constants/constants';

export const workflowStatesOperations: INodePropertyOptions[] = [
  { name: 'Archive Workflow State', value: 'archiveWorkflowState' },
  { name: 'Create Workflow State', value: 'createWorkflowState' },
  { name: 'Get Workflow State', value: 'getWorkflowState' },
  { name: 'List Workflow States', value: 'listWorkflowStates' },
  { name: 'Update Workflow State', value: 'updateWorkflowState' },
];

export const workflowStatesFields = [
  // State ID for get/update/archive
  {
    displayName: 'State ID',
    name: 'stateId',
    type: 'string' as const,
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['workflowStates'],
        operation: ['getWorkflowState', 'updateWorkflowState', 'archiveWorkflowState'],
      },
    },
    description: 'The ID of the workflow state',
  },

  // Team for create and list
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
        resource: ['workflowStates'],
        operation: ['createWorkflowState', 'listWorkflowStates'],
      },
    },
    description: 'The team for the workflow state',
  },

  // Create Workflow State
  {
    displayName: 'Name',
    name: 'name',
    type: 'string' as const,
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['workflowStates'],
        operation: ['createWorkflowState'],
      },
    },
    description: 'The name of the workflow state',
  },
  {
    displayName: 'Type',
    name: 'type',
    type: 'options' as const,
    options: [
      { name: 'Backlog', value: 'backlog' },
      { name: 'Canceled', value: 'canceled' },
      { name: 'Completed', value: 'completed' },
      { name: 'Started', value: 'started' },
      { name: 'Triage', value: 'triage' },
      { name: 'Unstarted', value: 'unstarted' },
    ],
    default: 'unstarted',
    required: true,
    displayOptions: {
      show: {
        resource: ['workflowStates'],
        operation: ['createWorkflowState'],
      },
    },
    description: 'The type of the workflow state',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection' as const,
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['workflowStates'],
        operation: ['createWorkflowState'],
      },
    },
    options: [
      {
        displayName: 'Color',
        name: 'color',
        type: 'color' as const,
        default: '#6366f1',
        description: 'The color of the workflow state',
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string' as const,
        default: '',
        description: 'The description of the workflow state',
      },
      {
        displayName: 'Position',
        name: 'position',
        type: 'number' as const,
        default: 0,
        description: 'The position of the workflow state in the list',
      },
    ],
  },

  // Update Workflow State
  {
    displayName: 'Update Fields',
    name: 'updateFields',
    type: 'collection' as const,
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['workflowStates'],
        operation: ['updateWorkflowState'],
      },
    },
    options: [
      {
        displayName: 'Color',
        name: 'color',
        type: 'color' as const,
        default: '#6366f1',
        description: 'The color of the workflow state',
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string' as const,
        default: '',
        description: 'The description of the workflow state',
      },
      {
        displayName: 'Name',
        name: 'name',
        type: 'string' as const,
        default: '',
        description: 'The name of the workflow state',
      },
      {
        displayName: 'Position',
        name: 'position',
        type: 'number' as const,
        default: 0,
        description: 'The position of the workflow state in the list',
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
        resource: ['workflowStates'],
        operation: ['listWorkflowStates'],
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
        resource: ['workflowStates'],
        operation: ['listWorkflowStates'],
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
        resource: ['workflowStates'],
        operation: ['listWorkflowStates'],
      },
    },
    options: [
      {
        displayName: 'Include Archived',
        name: 'includeArchived',
        type: 'boolean' as const,
        default: false,
        description: 'Whether to include archived states',
      },
      {
        displayName: 'Type',
        name: 'type',
        type: 'options' as const,
        options: [
          { name: 'All', value: '' },
          { name: 'Backlog', value: 'backlog' },
          { name: 'Canceled', value: 'canceled' },
          { name: 'Completed', value: 'completed' },
          { name: 'Started', value: 'started' },
          { name: 'Triage', value: 'triage' },
          { name: 'Unstarted', value: 'unstarted' },
        ],
        default: '',
        description: 'Filter by state type',
      },
    ],
  },
];

export async function executeWorkflowStatesOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject> {
  let result: IDataObject = {};

  switch (operation) {
    case 'listWorkflowStates':
      result = await listWorkflowStates.call(this, i);
      break;
    case 'getWorkflowState':
      result = await getWorkflowState.call(this, i);
      break;
    case 'createWorkflowState':
      result = await createWorkflowState.call(this, i);
      break;
    case 'updateWorkflowState':
      result = await updateWorkflowState.call(this, i);
      break;
    case 'archiveWorkflowState':
      result = await archiveWorkflowState.call(this, i);
      break;
  }

  return result;
}

async function listWorkflowStates(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const teamId = this.getNodeParameter('teamId', i) as string;
  const returnAll = this.getNodeParameter('returnAll', i) as boolean;
  const limit = this.getNodeParameter('limit', i, 50) as number;
  const filters = this.getNodeParameter('filters', i, {}) as IDataObject;

  const query = `
    query TeamStates($id: String!, $first: Int, $after: String, $includeArchived: Boolean) {
      team(id: $id) {
        states(first: $first, after: $after, includeArchived: $includeArchived) {
          nodes {
            ${WORKFLOW_STATE_FIELDS}
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    }
  `;

  let states = await linearGraphQLPaginatedRequest.call(
    this,
    query,
    { id: teamId, includeArchived: filters.includeArchived === true },
    'team.states',
    returnAll,
    limit,
  ) as IDataObject[];

  // Filter by type if specified
  if (filters.type) {
    states = states.filter((state) => state.type === filters.type);
  }

  return { states };
}

async function getWorkflowState(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const stateId = this.getNodeParameter('stateId', i) as string;

  const query = `
    query WorkflowState($id: String!) {
      workflowState(id: $id) {
        ${WORKFLOW_STATE_FIELDS}
        team {
          id
          name
          key
        }
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

  const response = await linearGraphQLRequest.call(this, query, { id: stateId });
  return (response as IDataObject).workflowState as IDataObject;
}

async function createWorkflowState(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const teamId = this.getNodeParameter('teamId', i) as string;
  const name = this.getNodeParameter('name', i) as string;
  const type = this.getNodeParameter('type', i) as string;
  const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

  const input = cleanObject({
    teamId,
    name,
    type,
    ...additionalFields,
  });

  const mutation = `
    mutation WorkflowStateCreate($input: WorkflowStateCreateInput!) {
      workflowStateCreate(input: $input) {
        success
        workflowState {
          ${WORKFLOW_STATE_FIELDS}
        }
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, mutation, { input });
  return ((response as IDataObject).workflowStateCreate as IDataObject).workflowState as IDataObject;
}

async function updateWorkflowState(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const stateId = this.getNodeParameter('stateId', i) as string;
  const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;

  const input = cleanObject(updateFields);

  const mutation = `
    mutation WorkflowStateUpdate($id: String!, $input: WorkflowStateUpdateInput!) {
      workflowStateUpdate(id: $id, input: $input) {
        success
        workflowState {
          ${WORKFLOW_STATE_FIELDS}
        }
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, mutation, { id: stateId, input });
  return ((response as IDataObject).workflowStateUpdate as IDataObject).workflowState as IDataObject;
}

async function archiveWorkflowState(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const stateId = this.getNodeParameter('stateId', i) as string;

  const mutation = `
    mutation WorkflowStateArchive($id: String!) {
      workflowStateArchive(id: $id) {
        success
        entity {
          ${WORKFLOW_STATE_FIELDS}
        }
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, mutation, { id: stateId });
  return ((response as IDataObject).workflowStateArchive as IDataObject).entity as IDataObject;
}
