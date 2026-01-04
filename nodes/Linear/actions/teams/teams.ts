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
import { TEAM_FIELDS, USER_FIELDS, LABEL_FIELDS, WORKFLOW_STATE_FIELDS } from '../../constants/constants';

export const teamsOperations: INodePropertyOptions[] = [
  { name: 'Add Team Member', value: 'addTeamMember' },
  { name: 'Create Team', value: 'createTeam' },
  { name: 'Delete Team', value: 'deleteTeam' },
  { name: 'Get Team', value: 'getTeam' },
  { name: 'Get Team Labels', value: 'getTeamLabels' },
  { name: 'Get Team Members', value: 'getTeamMembers' },
  { name: 'Get Team States', value: 'getTeamStates' },
  { name: 'Get Team Templates', value: 'getTeamTemplates' },
  { name: 'List Teams', value: 'listTeams' },
  { name: 'Remove Team Member', value: 'removeTeamMember' },
  { name: 'Update Team', value: 'updateTeam' },
];

export const teamsFields = [
  // Team ID for get/update/delete
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
        resource: ['teams'],
        operation: ['getTeam', 'updateTeam', 'deleteTeam', 'getTeamMembers', 'getTeamLabels', 'getTeamStates', 'getTeamTemplates', 'addTeamMember', 'removeTeamMember'],
      },
    },
    description: 'The team to operate on',
  },

  // Create Team
  {
    displayName: 'Name',
    name: 'name',
    type: 'string' as const,
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['teams'],
        operation: ['createTeam'],
      },
    },
    description: 'The name of the team',
  },
  {
    displayName: 'Key',
    name: 'key',
    type: 'string' as const,
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['teams'],
        operation: ['createTeam'],
      },
    },
    description: 'The unique key of the team (used in issue identifiers like ENG-123)',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection' as const,
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['teams'],
        operation: ['createTeam'],
      },
    },
    options: [
      {
        displayName: 'Color',
        name: 'color',
        type: 'string' as const,
        default: '',
        description: 'The team color',
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string' as const,
        typeOptions: {
          rows: 2,
        },
        default: '',
        description: 'The description of the team',
      },
      {
        displayName: 'Icon',
        name: 'icon',
        type: 'string' as const,
        default: '',
        description: 'The team icon',
      },
      {
        displayName: 'Private',
        name: 'private',
        type: 'boolean' as const,
        default: false,
        description: 'Whether the team is private',
      },
      {
        displayName: 'Timezone',
        name: 'timezone',
        type: 'string' as const,
        default: '',
        description: 'The team timezone',
      },
    ],
  },

  // Update Team
  {
    displayName: 'Update Fields',
    name: 'updateFields',
    type: 'collection' as const,
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['teams'],
        operation: ['updateTeam'],
      },
    },
    options: [
      {
        displayName: 'Color',
        name: 'color',
        type: 'string' as const,
        default: '',
        description: 'The team color',
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string' as const,
        typeOptions: {
          rows: 2,
        },
        default: '',
        description: 'The description of the team',
      },
      {
        displayName: 'Icon',
        name: 'icon',
        type: 'string' as const,
        default: '',
        description: 'The team icon',
      },
      {
        displayName: 'Name',
        name: 'name',
        type: 'string' as const,
        default: '',
        description: 'The name of the team',
      },
      {
        displayName: 'Private',
        name: 'private',
        type: 'boolean' as const,
        default: false,
        description: 'Whether the team is private',
      },
      {
        displayName: 'Timezone',
        name: 'timezone',
        type: 'string' as const,
        default: '',
        description: 'The team timezone',
      },
    ],
  },

  // User for add/remove member
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
        resource: ['teams'],
        operation: ['addTeamMember', 'removeTeamMember'],
      },
    },
    description: 'The user to add/remove',
  },

  // Pagination for list
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean' as const,
    default: false,
    displayOptions: {
      show: {
        resource: ['teams'],
        operation: ['listTeams', 'getTeamMembers', 'getTeamLabels', 'getTeamStates'],
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
        resource: ['teams'],
        operation: ['listTeams', 'getTeamMembers', 'getTeamLabels', 'getTeamStates'],
        returnAll: [false],
      },
    },
    description: 'Max number of results to return',
  },
];

export async function executeTeamsOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject> {
  let result: IDataObject = {};

  switch (operation) {
    case 'listTeams':
      result = await listTeams.call(this, i);
      break;
    case 'getTeam':
      result = await getTeam.call(this, i);
      break;
    case 'createTeam':
      result = await createTeam.call(this, i);
      break;
    case 'updateTeam':
      result = await updateTeam.call(this, i);
      break;
    case 'deleteTeam':
      result = await deleteTeam.call(this, i);
      break;
    case 'getTeamMembers':
      result = await getTeamMembers.call(this, i);
      break;
    case 'addTeamMember':
      result = await addTeamMember.call(this, i);
      break;
    case 'removeTeamMember':
      result = await removeTeamMember.call(this, i);
      break;
    case 'getTeamLabels':
      result = await getTeamLabels.call(this, i);
      break;
    case 'getTeamStates':
      result = await getTeamStates.call(this, i);
      break;
    case 'getTeamTemplates':
      result = await getTeamTemplates.call(this, i);
      break;
  }

  return result;
}

async function listTeams(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const returnAll = this.getNodeParameter('returnAll', i) as boolean;
  const limit = this.getNodeParameter('limit', i, 50) as number;

  const query = `
    query Teams($first: Int, $after: String) {
      teams(first: $first, after: $after) {
        nodes {
          ${TEAM_FIELDS}
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;

  const teams = await linearGraphQLPaginatedRequest.call(
    this,
    query,
    {},
    'teams',
    returnAll,
    limit,
  );

  return { teams };
}

async function getTeam(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const teamId = this.getNodeParameter('teamId', i) as string;

  const query = `
    query Team($id: String!) {
      team(id: $id) {
        ${TEAM_FIELDS}
        issueCount
        activeCycle {
          id
          number
          name
        }
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, query, { id: teamId });
  return (response as IDataObject).team as IDataObject;
}

async function createTeam(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const name = this.getNodeParameter('name', i) as string;
  const key = this.getNodeParameter('key', i) as string;
  const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

  const input = cleanObject({
    name,
    key,
    ...additionalFields,
  });

  const mutation = `
    mutation TeamCreate($input: TeamCreateInput!) {
      teamCreate(input: $input) {
        success
        team {
          ${TEAM_FIELDS}
        }
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, mutation, { input });
  return ((response as IDataObject).teamCreate as IDataObject).team as IDataObject;
}

async function updateTeam(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const teamId = this.getNodeParameter('teamId', i) as string;
  const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;

  const input = cleanObject(updateFields);

  const mutation = `
    mutation TeamUpdate($id: String!, $input: TeamUpdateInput!) {
      teamUpdate(id: $id, input: $input) {
        success
        team {
          ${TEAM_FIELDS}
        }
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, mutation, { id: teamId, input });
  return ((response as IDataObject).teamUpdate as IDataObject).team as IDataObject;
}

async function deleteTeam(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const teamId = this.getNodeParameter('teamId', i) as string;

  const mutation = `
    mutation TeamDelete($id: String!) {
      teamDelete(id: $id) {
        success
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, mutation, { id: teamId });
  return { success: ((response as IDataObject).teamDelete as IDataObject).success };
}

async function getTeamMembers(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const teamId = this.getNodeParameter('teamId', i) as string;
  const returnAll = this.getNodeParameter('returnAll', i) as boolean;
  const limit = this.getNodeParameter('limit', i, 50) as number;

  const query = `
    query TeamMembers($id: String!, $first: Int, $after: String) {
      team(id: $id) {
        members(first: $first, after: $after) {
          nodes {
            ${USER_FIELDS}
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    }
  `;

  const members = await linearGraphQLPaginatedRequest.call(
    this,
    query,
    { id: teamId },
    'team.members',
    returnAll,
    limit,
  );

  return { members };
}

async function addTeamMember(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const teamId = this.getNodeParameter('teamId', i) as string;
  const userId = this.getNodeParameter('userId', i) as string;

  const mutation = `
    mutation TeamMembershipCreate($input: TeamMembershipCreateInput!) {
      teamMembershipCreate(input: $input) {
        success
        teamMembership {
          id
          user {
            ${USER_FIELDS}
          }
          team {
            id
            name
          }
        }
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, mutation, { 
    input: { teamId, userId } 
  });
  return ((response as IDataObject).teamMembershipCreate as IDataObject).teamMembership as IDataObject;
}

async function removeTeamMember(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const teamId = this.getNodeParameter('teamId', i) as string;
  const userId = this.getNodeParameter('userId', i) as string;

  // First find the membership
  const findQuery = `
    query FindMembership($teamId: String!, $userId: String!) {
      teamMemberships(filter: { team: { id: { eq: $teamId } }, user: { id: { eq: $userId } } }) {
        nodes {
          id
        }
      }
    }
  `;

  const findResponse = await linearGraphQLRequest.call(this, findQuery, { teamId, userId });
  const memberships = ((findResponse as IDataObject).teamMemberships as IDataObject).nodes as IDataObject[];
  
  if (!memberships || memberships.length === 0) {
    return { success: false, message: 'Membership not found' };
  }

  const membershipId = memberships[0].id as string;

  const mutation = `
    mutation TeamMembershipDelete($id: String!) {
      teamMembershipDelete(id: $id) {
        success
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, mutation, { id: membershipId });
  return { success: ((response as IDataObject).teamMembershipDelete as IDataObject).success };
}

async function getTeamLabels(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const teamId = this.getNodeParameter('teamId', i) as string;
  const returnAll = this.getNodeParameter('returnAll', i) as boolean;
  const limit = this.getNodeParameter('limit', i, 50) as number;

  const query = `
    query TeamLabels($id: String!, $first: Int, $after: String) {
      team(id: $id) {
        labels(first: $first, after: $after) {
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
    { id: teamId },
    'team.labels',
    returnAll,
    limit,
  );

  return { labels };
}

async function getTeamStates(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const teamId = this.getNodeParameter('teamId', i) as string;
  const returnAll = this.getNodeParameter('returnAll', i) as boolean;
  const limit = this.getNodeParameter('limit', i, 50) as number;

  const query = `
    query TeamStates($id: String!, $first: Int, $after: String) {
      team(id: $id) {
        states(first: $first, after: $after) {
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

  const states = await linearGraphQLPaginatedRequest.call(
    this,
    query,
    { id: teamId },
    'team.states',
    returnAll,
    limit,
  );

  return { states };
}

async function getTeamTemplates(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const teamId = this.getNodeParameter('teamId', i) as string;

  const query = `
    query TeamTemplates($id: String!) {
      team(id: $id) {
        templates {
          nodes {
            id
            name
            description
            type
            createdAt
            updatedAt
          }
        }
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, query, { id: teamId });
  const team = (response as IDataObject).team as IDataObject;
  return { templates: ((team?.templates as IDataObject)?.nodes as IDataObject[]) || [] };
}
