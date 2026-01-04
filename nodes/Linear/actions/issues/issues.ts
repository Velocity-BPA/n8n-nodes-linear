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
  buildGraphQLFilter,
  cleanObject,
} from '../../transport/graphql';
import {
  ISSUE_FIELDS,
  PRIORITY_OPTIONS,
  RELATION_TYPE_OPTIONS,
} from '../../constants/constants';

// Operation definitions
export const issuesOperations: INodePropertyOptions[] = [
  { name: 'Add Issue Label', value: 'addIssueLabel' },
  { name: 'Add Issue Relation', value: 'addIssueRelation' },
  { name: 'Add Issue Subscriber', value: 'addIssueSubscriber' },
  { name: 'Archive Issue', value: 'archiveIssue' },
  { name: 'Assign Issue', value: 'assignIssue' },
  { name: 'Create Issue', value: 'createIssue' },
  { name: 'Delete Issue', value: 'deleteIssue' },
  { name: 'Get Issue', value: 'getIssue' },
  { name: 'List Issues', value: 'listIssues' },
  { name: 'Move Issue to Project', value: 'moveIssueToProject' },
  { name: 'Move Issue to Team', value: 'moveIssueToTeam' },
  { name: 'Remove Issue Label', value: 'removeIssueLabel' },
  { name: 'Remove Issue Relation', value: 'removeIssueRelation' },
  { name: 'Remove Issue Subscriber', value: 'removeIssueSubscriber' },
  { name: 'Set Issue Parent', value: 'setIssueParent' },
  { name: 'Set Issue Priority', value: 'setIssuePriority' },
  { name: 'Set Issue State', value: 'setIssueState' },
  { name: 'Unarchive Issue', value: 'unarchiveIssue' },
  { name: 'Unassign Issue', value: 'unassignIssue' },
  { name: 'Update Issue', value: 'updateIssue' },
];

export const issuesFields = [
  // Create Issue
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
        resource: ['issues'],
        operation: ['createIssue'],
      },
    },
    description: 'The team to create the issue in',
  },
  {
    displayName: 'Title',
    name: 'title',
    type: 'string' as const,
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['issues'],
        operation: ['createIssue'],
      },
    },
    description: 'The title of the issue',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection' as const,
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['issues'],
        operation: ['createIssue'],
      },
    },
    options: [
      {
        displayName: 'Assignee',
        name: 'assigneeId',
        type: 'options' as const,
        typeOptions: {
          loadOptionsMethod: 'getUsers',
        },
        default: '',
        description: 'The user to assign the issue to',
      },
      {
        displayName: 'Cycle',
        name: 'cycleId',
        type: 'options' as const,
        typeOptions: {
          loadOptionsMethod: 'getCycles',
        },
        default: '',
        description: 'The cycle to add the issue to',
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string' as const,
        typeOptions: {
          rows: 4,
        },
        default: '',
        description: 'The description of the issue (Markdown supported)',
      },
      {
        displayName: 'Due Date',
        name: 'dueDate',
        type: 'dateTime' as const,
        default: '',
        description: 'The due date of the issue',
      },
      {
        displayName: 'Estimate',
        name: 'estimate',
        type: 'number' as const,
        default: 0,
        description: 'The estimate points of the issue',
      },
      {
        displayName: 'Labels',
        name: 'labelIds',
        type: 'multiOptions' as const,
        typeOptions: {
          loadOptionsMethod: 'getLabels',
        },
        default: [],
        description: 'Labels to add to the issue',
      },
      {
        displayName: 'Parent Issue',
        name: 'parentId',
        type: 'string' as const,
        default: '',
        description: 'The ID or identifier of the parent issue',
      },
      {
        displayName: 'Priority',
        name: 'priority',
        type: 'options' as const,
        options: PRIORITY_OPTIONS,
        default: 0,
        description: 'The priority of the issue',
      },
      {
        displayName: 'Project',
        name: 'projectId',
        type: 'options' as const,
        typeOptions: {
          loadOptionsMethod: 'getProjects',
        },
        default: '',
        description: 'The project to add the issue to',
      },
      {
        displayName: 'State',
        name: 'stateId',
        type: 'options' as const,
        typeOptions: {
          loadOptionsMethod: 'getWorkflowStates',
        },
        default: '',
        description: 'The workflow state of the issue',
      },
      {
        displayName: 'Subscribers',
        name: 'subscriberIds',
        type: 'multiOptions' as const,
        typeOptions: {
          loadOptionsMethod: 'getUsers',
        },
        default: [],
        description: 'Users to subscribe to the issue',
      },
    ],
  },

  // Get Issue
  {
    displayName: 'Issue ID or Identifier',
    name: 'issueId',
    type: 'string' as const,
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['issues'],
        operation: [
          'getIssue',
          'updateIssue',
          'deleteIssue',
          'archiveIssue',
          'unarchiveIssue',
          'addIssueLabel',
          'removeIssueLabel',
          'addIssueSubscriber',
          'removeIssueSubscriber',
          'setIssuePriority',
          'setIssueState',
          'assignIssue',
          'unassignIssue',
          'moveIssueToProject',
          'moveIssueToTeam',
          'setIssueParent',
          'addIssueRelation',
          'removeIssueRelation',
        ],
      },
    },
    description: 'The ID (UUID) or identifier (e.g., ENG-123) of the issue',
  },

  // Update Issue
  {
    displayName: 'Update Fields',
    name: 'updateFields',
    type: 'collection' as const,
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['issues'],
        operation: ['updateIssue'],
      },
    },
    options: [
      {
        displayName: 'Assignee',
        name: 'assigneeId',
        type: 'options' as const,
        typeOptions: {
          loadOptionsMethod: 'getUsers',
        },
        default: '',
        description: 'The user to assign the issue to',
      },
      {
        displayName: 'Cycle',
        name: 'cycleId',
        type: 'options' as const,
        typeOptions: {
          loadOptionsMethod: 'getCycles',
        },
        default: '',
        description: 'The cycle to add the issue to',
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string' as const,
        typeOptions: {
          rows: 4,
        },
        default: '',
        description: 'The description of the issue',
      },
      {
        displayName: 'Due Date',
        name: 'dueDate',
        type: 'dateTime' as const,
        default: '',
        description: 'The due date of the issue',
      },
      {
        displayName: 'Estimate',
        name: 'estimate',
        type: 'number' as const,
        default: 0,
        description: 'The estimate points of the issue',
      },
      {
        displayName: 'Labels',
        name: 'labelIds',
        type: 'multiOptions' as const,
        typeOptions: {
          loadOptionsMethod: 'getLabels',
        },
        default: [],
        description: 'Labels for the issue (replaces existing)',
      },
      {
        displayName: 'Parent Issue',
        name: 'parentId',
        type: 'string' as const,
        default: '',
        description: 'The ID or identifier of the parent issue',
      },
      {
        displayName: 'Priority',
        name: 'priority',
        type: 'options' as const,
        options: PRIORITY_OPTIONS,
        default: 0,
        description: 'The priority of the issue',
      },
      {
        displayName: 'Project',
        name: 'projectId',
        type: 'options' as const,
        typeOptions: {
          loadOptionsMethod: 'getProjects',
        },
        default: '',
        description: 'The project for the issue',
      },
      {
        displayName: 'State',
        name: 'stateId',
        type: 'options' as const,
        typeOptions: {
          loadOptionsMethod: 'getWorkflowStates',
        },
        default: '',
        description: 'The workflow state of the issue',
      },
      {
        displayName: 'Team',
        name: 'teamId',
        type: 'options' as const,
        typeOptions: {
          loadOptionsMethod: 'getTeams',
        },
        default: '',
        description: 'Move issue to a different team',
      },
      {
        displayName: 'Title',
        name: 'title',
        type: 'string' as const,
        default: '',
        description: 'The title of the issue',
      },
    ],
  },

  // List Issues
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean' as const,
    default: false,
    displayOptions: {
      show: {
        resource: ['issues'],
        operation: ['listIssues'],
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
        resource: ['issues'],
        operation: ['listIssues'],
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
        resource: ['issues'],
        operation: ['listIssues'],
      },
    },
    options: [
      {
        displayName: 'Assignee',
        name: 'assigneeId',
        type: 'options' as const,
        typeOptions: {
          loadOptionsMethod: 'getUsers',
        },
        default: '',
        description: 'Filter by assignee',
      },
      {
        displayName: 'Created After',
        name: 'createdAfter',
        type: 'dateTime' as const,
        default: '',
        description: 'Filter issues created after this date',
      },
      {
        displayName: 'Created Before',
        name: 'createdBefore',
        type: 'dateTime' as const,
        default: '',
        description: 'Filter issues created before this date',
      },
      {
        displayName: 'Cycle',
        name: 'cycleId',
        type: 'options' as const,
        typeOptions: {
          loadOptionsMethod: 'getCycles',
        },
        default: '',
        description: 'Filter by cycle',
      },
      {
        displayName: 'Include Archived',
        name: 'includeArchived',
        type: 'boolean' as const,
        default: false,
        description: 'Whether to include archived issues',
      },
      {
        displayName: 'Labels',
        name: 'labelIds',
        type: 'multiOptions' as const,
        typeOptions: {
          loadOptionsMethod: 'getLabels',
        },
        default: [],
        description: 'Filter by labels',
      },
      {
        displayName: 'Priority',
        name: 'priority',
        type: 'options' as const,
        options: PRIORITY_OPTIONS,
        default: '',
        description: 'Filter by priority',
      },
      {
        displayName: 'Project',
        name: 'projectId',
        type: 'options' as const,
        typeOptions: {
          loadOptionsMethod: 'getProjects',
        },
        default: '',
        description: 'Filter by project',
      },
      {
        displayName: 'Search Query',
        name: 'searchQuery',
        type: 'string' as const,
        default: '',
        description: 'Search in issue title and description',
      },
      {
        displayName: 'State',
        name: 'stateId',
        type: 'options' as const,
        typeOptions: {
          loadOptionsMethod: 'getWorkflowStates',
        },
        default: '',
        description: 'Filter by workflow state',
      },
      {
        displayName: 'Team',
        name: 'teamId',
        type: 'options' as const,
        typeOptions: {
          loadOptionsMethod: 'getTeams',
        },
        default: '',
        description: 'Filter by team',
      },
      {
        displayName: 'Title Contains',
        name: 'titleContains',
        type: 'string' as const,
        default: '',
        description: 'Filter issues with titles containing this text',
      },
    ],
  },

  // Add/Remove Label
  {
    displayName: 'Label',
    name: 'labelId',
    type: 'options' as const,
    typeOptions: {
      loadOptionsMethod: 'getLabels',
    },
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['issues'],
        operation: ['addIssueLabel', 'removeIssueLabel'],
      },
    },
    description: 'The label to add or remove',
  },

  // Add/Remove Subscriber
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
        resource: ['issues'],
        operation: ['addIssueSubscriber', 'removeIssueSubscriber', 'assignIssue'],
      },
    },
    description: 'The user to add/remove as subscriber or assign',
  },

  // Set Priority
  {
    displayName: 'Priority',
    name: 'priority',
    type: 'options' as const,
    options: PRIORITY_OPTIONS,
    default: 0,
    required: true,
    displayOptions: {
      show: {
        resource: ['issues'],
        operation: ['setIssuePriority'],
      },
    },
    description: 'The priority to set',
  },

  // Set State
  {
    displayName: 'State',
    name: 'stateId',
    type: 'options' as const,
    typeOptions: {
      loadOptionsMethod: 'getWorkflowStates',
    },
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['issues'],
        operation: ['setIssueState'],
      },
    },
    description: 'The workflow state to set',
  },

  // Move to Project
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
        resource: ['issues'],
        operation: ['moveIssueToProject'],
      },
    },
    description: 'The project to move the issue to',
  },

  // Move to Team
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
        resource: ['issues'],
        operation: ['moveIssueToTeam'],
      },
    },
    description: 'The team to move the issue to',
  },

  // Set Parent
  {
    displayName: 'Parent Issue',
    name: 'parentId',
    type: 'string' as const,
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['issues'],
        operation: ['setIssueParent'],
      },
    },
    description: 'The ID or identifier of the parent issue',
  },

  // Add/Remove Relation
  {
    displayName: 'Related Issue',
    name: 'relatedIssueId',
    type: 'string' as const,
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['issues'],
        operation: ['addIssueRelation', 'removeIssueRelation'],
      },
    },
    description: 'The ID or identifier of the related issue',
  },
  {
    displayName: 'Relation Type',
    name: 'relationType',
    type: 'options' as const,
    options: RELATION_TYPE_OPTIONS,
    default: 'related',
    required: true,
    displayOptions: {
      show: {
        resource: ['issues'],
        operation: ['addIssueRelation'],
      },
    },
    description: 'The type of relation',
  },
];

// Execute functions
export async function executeIssuesOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject> {
  let result: IDataObject = {};

  switch (operation) {
    case 'listIssues':
      result = await listIssues.call(this, i);
      break;
    case 'getIssue':
      result = await getIssue.call(this, i);
      break;
    case 'createIssue':
      result = await createIssue.call(this, i);
      break;
    case 'updateIssue':
      result = await updateIssue.call(this, i);
      break;
    case 'deleteIssue':
      result = await deleteIssue.call(this, i);
      break;
    case 'archiveIssue':
      result = await archiveIssue.call(this, i);
      break;
    case 'unarchiveIssue':
      result = await unarchiveIssue.call(this, i);
      break;
    case 'addIssueLabel':
      result = await addIssueLabel.call(this, i);
      break;
    case 'removeIssueLabel':
      result = await removeIssueLabel.call(this, i);
      break;
    case 'addIssueSubscriber':
      result = await addIssueSubscriber.call(this, i);
      break;
    case 'removeIssueSubscriber':
      result = await removeIssueSubscriber.call(this, i);
      break;
    case 'setIssuePriority':
      result = await setIssuePriority.call(this, i);
      break;
    case 'setIssueState':
      result = await setIssueState.call(this, i);
      break;
    case 'assignIssue':
      result = await assignIssue.call(this, i);
      break;
    case 'unassignIssue':
      result = await unassignIssue.call(this, i);
      break;
    case 'moveIssueToProject':
      result = await moveIssueToProject.call(this, i);
      break;
    case 'moveIssueToTeam':
      result = await moveIssueToTeam.call(this, i);
      break;
    case 'setIssueParent':
      result = await setIssueParent.call(this, i);
      break;
    case 'addIssueRelation':
      result = await addIssueRelation.call(this, i);
      break;
    case 'removeIssueRelation':
      result = await removeIssueRelation.call(this, i);
      break;
  }

  return result;
}

async function listIssues(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const returnAll = this.getNodeParameter('returnAll', i) as boolean;
  const limit = this.getNodeParameter('limit', i, 50) as number;
  const filters = this.getNodeParameter('filters', i, {}) as IDataObject;

  const filter = buildGraphQLFilter(filters);
  const includeArchived = filters.includeArchived === true;

  const query = `
    query Issues($first: Int, $after: String, $filter: IssueFilter, $includeArchived: Boolean) {
      issues(first: $first, after: $after, filter: $filter, includeArchived: $includeArchived) {
        nodes {
          ${ISSUE_FIELDS}
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;

  const issues = await linearGraphQLPaginatedRequest.call(
    this,
    query,
    { filter: Object.keys(filter).length > 0 ? filter : undefined, includeArchived },
    'issues',
    returnAll,
    limit,
  );

  return { issues };
}

async function getIssue(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const issueId = this.getNodeParameter('issueId', i) as string;

  // Try to get by identifier first, then by ID
  const query = `
    query Issue($id: String!) {
      issue(id: $id) {
        ${ISSUE_FIELDS}
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, query, { id: issueId });
  return (response as IDataObject).issue as IDataObject;
}

async function createIssue(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const teamId = this.getNodeParameter('teamId', i) as string;
  const title = this.getNodeParameter('title', i) as string;
  const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

  const input = cleanObject({
    teamId,
    title,
    ...additionalFields,
  });

  const mutation = `
    mutation IssueCreate($input: IssueCreateInput!) {
      issueCreate(input: $input) {
        success
        issue {
          ${ISSUE_FIELDS}
        }
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, mutation, { input });
  return ((response as IDataObject).issueCreate as IDataObject).issue as IDataObject;
}

async function updateIssue(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const issueId = this.getNodeParameter('issueId', i) as string;
  const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;

  const input = cleanObject(updateFields);

  const mutation = `
    mutation IssueUpdate($id: String!, $input: IssueUpdateInput!) {
      issueUpdate(id: $id, input: $input) {
        success
        issue {
          ${ISSUE_FIELDS}
        }
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, mutation, { id: issueId, input });
  return ((response as IDataObject).issueUpdate as IDataObject).issue as IDataObject;
}

async function deleteIssue(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const issueId = this.getNodeParameter('issueId', i) as string;

  const mutation = `
    mutation IssueDelete($id: String!) {
      issueDelete(id: $id) {
        success
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, mutation, { id: issueId });
  return { success: ((response as IDataObject).issueDelete as IDataObject).success };
}

async function archiveIssue(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const issueId = this.getNodeParameter('issueId', i) as string;

  const mutation = `
    mutation IssueArchive($id: String!) {
      issueArchive(id: $id) {
        success
        entity {
          ${ISSUE_FIELDS}
        }
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, mutation, { id: issueId });
  return ((response as IDataObject).issueArchive as IDataObject).entity as IDataObject;
}

async function unarchiveIssue(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const issueId = this.getNodeParameter('issueId', i) as string;

  const mutation = `
    mutation IssueUnarchive($id: String!) {
      issueUnarchive(id: $id) {
        success
        entity {
          ${ISSUE_FIELDS}
        }
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, mutation, { id: issueId });
  return ((response as IDataObject).issueUnarchive as IDataObject).entity as IDataObject;
}

async function addIssueLabel(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const issueId = this.getNodeParameter('issueId', i) as string;
  const labelId = this.getNodeParameter('labelId', i) as string;

  const mutation = `
    mutation IssueAddLabel($id: String!, $labelId: String!) {
      issueAddLabel(id: $id, labelId: $labelId) {
        success
        issue {
          ${ISSUE_FIELDS}
        }
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, mutation, { id: issueId, labelId });
  return ((response as IDataObject).issueAddLabel as IDataObject).issue as IDataObject;
}

async function removeIssueLabel(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const issueId = this.getNodeParameter('issueId', i) as string;
  const labelId = this.getNodeParameter('labelId', i) as string;

  const mutation = `
    mutation IssueRemoveLabel($id: String!, $labelId: String!) {
      issueRemoveLabel(id: $id, labelId: $labelId) {
        success
        issue {
          ${ISSUE_FIELDS}
        }
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, mutation, { id: issueId, labelId });
  return ((response as IDataObject).issueRemoveLabel as IDataObject).issue as IDataObject;
}

async function addIssueSubscriber(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const issueId = this.getNodeParameter('issueId', i) as string;
  const userId = this.getNodeParameter('userId', i) as string;

  const mutation = `
    mutation IssueSubscribe($id: String!, $userId: String!) {
      issueSubscribe(id: $id, userId: $userId) {
        success
        issue {
          ${ISSUE_FIELDS}
        }
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, mutation, { id: issueId, userId });
  return ((response as IDataObject).issueSubscribe as IDataObject).issue as IDataObject;
}

async function removeIssueSubscriber(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const issueId = this.getNodeParameter('issueId', i) as string;
  const userId = this.getNodeParameter('userId', i) as string;

  const mutation = `
    mutation IssueUnsubscribe($id: String!, $userId: String!) {
      issueUnsubscribe(id: $id, userId: $userId) {
        success
        issue {
          ${ISSUE_FIELDS}
        }
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, mutation, { id: issueId, userId });
  return ((response as IDataObject).issueUnsubscribe as IDataObject).issue as IDataObject;
}

async function setIssuePriority(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const issueId = this.getNodeParameter('issueId', i) as string;
  const priority = this.getNodeParameter('priority', i) as number;

  const mutation = `
    mutation IssueUpdate($id: String!, $input: IssueUpdateInput!) {
      issueUpdate(id: $id, input: $input) {
        success
        issue {
          ${ISSUE_FIELDS}
        }
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, mutation, { 
    id: issueId, 
    input: { priority } 
  });
  return ((response as IDataObject).issueUpdate as IDataObject).issue as IDataObject;
}

async function setIssueState(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const issueId = this.getNodeParameter('issueId', i) as string;
  const stateId = this.getNodeParameter('stateId', i) as string;

  const mutation = `
    mutation IssueUpdate($id: String!, $input: IssueUpdateInput!) {
      issueUpdate(id: $id, input: $input) {
        success
        issue {
          ${ISSUE_FIELDS}
        }
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, mutation, { 
    id: issueId, 
    input: { stateId } 
  });
  return ((response as IDataObject).issueUpdate as IDataObject).issue as IDataObject;
}

async function assignIssue(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const issueId = this.getNodeParameter('issueId', i) as string;
  const userId = this.getNodeParameter('userId', i) as string;

  const mutation = `
    mutation IssueUpdate($id: String!, $input: IssueUpdateInput!) {
      issueUpdate(id: $id, input: $input) {
        success
        issue {
          ${ISSUE_FIELDS}
        }
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, mutation, { 
    id: issueId, 
    input: { assigneeId: userId } 
  });
  return ((response as IDataObject).issueUpdate as IDataObject).issue as IDataObject;
}

async function unassignIssue(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const issueId = this.getNodeParameter('issueId', i) as string;

  const mutation = `
    mutation IssueUpdate($id: String!, $input: IssueUpdateInput!) {
      issueUpdate(id: $id, input: $input) {
        success
        issue {
          ${ISSUE_FIELDS}
        }
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, mutation, { 
    id: issueId, 
    input: { assigneeId: null } 
  });
  return ((response as IDataObject).issueUpdate as IDataObject).issue as IDataObject;
}

async function moveIssueToProject(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const issueId = this.getNodeParameter('issueId', i) as string;
  const projectId = this.getNodeParameter('projectId', i) as string;

  const mutation = `
    mutation IssueUpdate($id: String!, $input: IssueUpdateInput!) {
      issueUpdate(id: $id, input: $input) {
        success
        issue {
          ${ISSUE_FIELDS}
        }
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, mutation, { 
    id: issueId, 
    input: { projectId } 
  });
  return ((response as IDataObject).issueUpdate as IDataObject).issue as IDataObject;
}

async function moveIssueToTeam(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const issueId = this.getNodeParameter('issueId', i) as string;
  const teamId = this.getNodeParameter('teamId', i) as string;

  const mutation = `
    mutation IssueUpdate($id: String!, $input: IssueUpdateInput!) {
      issueUpdate(id: $id, input: $input) {
        success
        issue {
          ${ISSUE_FIELDS}
        }
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, mutation, { 
    id: issueId, 
    input: { teamId } 
  });
  return ((response as IDataObject).issueUpdate as IDataObject).issue as IDataObject;
}

async function setIssueParent(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const issueId = this.getNodeParameter('issueId', i) as string;
  const parentId = this.getNodeParameter('parentId', i) as string;

  const mutation = `
    mutation IssueUpdate($id: String!, $input: IssueUpdateInput!) {
      issueUpdate(id: $id, input: $input) {
        success
        issue {
          ${ISSUE_FIELDS}
        }
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, mutation, { 
    id: issueId, 
    input: { parentId } 
  });
  return ((response as IDataObject).issueUpdate as IDataObject).issue as IDataObject;
}

async function addIssueRelation(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const issueId = this.getNodeParameter('issueId', i) as string;
  const relatedIssueId = this.getNodeParameter('relatedIssueId', i) as string;
  const relationType = this.getNodeParameter('relationType', i) as string;

  const mutation = `
    mutation IssueRelationCreate($input: IssueRelationCreateInput!) {
      issueRelationCreate(input: $input) {
        success
        issueRelation {
          id
          type
          issue {
            id
            identifier
          }
          relatedIssue {
            id
            identifier
          }
        }
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, mutation, { 
    input: { 
      issueId, 
      relatedIssueId, 
      type: relationType 
    } 
  });
  return ((response as IDataObject).issueRelationCreate as IDataObject).issueRelation as IDataObject;
}

async function removeIssueRelation(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const issueId = this.getNodeParameter('issueId', i) as string;
  const relatedIssueId = this.getNodeParameter('relatedIssueId', i) as string;

  // First find the relation
  const query = `
    query IssueRelations($id: String!) {
      issue(id: $id) {
        relations {
          nodes {
            id
            relatedIssue {
              id
            }
          }
        }
      }
    }
  `;

  const queryResponse = await linearGraphQLRequest.call(this, query, { id: issueId });
  const relations = ((queryResponse as IDataObject).issue as IDataObject).relations as IDataObject;
  const nodes = (relations as IDataObject).nodes as IDataObject[];
  
  const relation = nodes.find(
    (r: IDataObject) => ((r as IDataObject).relatedIssue as IDataObject).id === relatedIssueId
  );

  if (!relation) {
    return { success: false, message: 'Relation not found' };
  }

  const mutation = `
    mutation IssueRelationDelete($id: String!) {
      issueRelationDelete(id: $id) {
        success
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, mutation, { id: relation.id });
  return { success: ((response as IDataObject).issueRelationDelete as IDataObject).success };
}
