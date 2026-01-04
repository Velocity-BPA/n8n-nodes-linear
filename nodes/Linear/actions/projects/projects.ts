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
import {
  PROJECT_FIELDS,
  PROJECT_MILESTONE_FIELDS,
  PROJECT_STATE_OPTIONS,
} from '../../constants/constants';

export const projectsOperations: INodePropertyOptions[] = [
  { name: 'Add Project Member', value: 'addProjectMember' },
  { name: 'Archive Project', value: 'archiveProject' },
  { name: 'Create Project', value: 'createProject' },
  { name: 'Create Project Milestone', value: 'createProjectMilestone' },
  { name: 'Delete Project', value: 'deleteProject' },
  { name: 'Get Project', value: 'getProject' },
  { name: 'List Project Milestones', value: 'listProjectMilestones' },
  { name: 'List Projects', value: 'listProjects' },
  { name: 'Remove Project Member', value: 'removeProjectMember' },
  { name: 'Update Project', value: 'updateProject' },
];

export const projectsFields = [
  // Create Project
  {
    displayName: 'Teams',
    name: 'teamIds',
    type: 'multiOptions' as const,
    typeOptions: {
      loadOptionsMethod: 'getTeams',
    },
    default: [],
    required: true,
    displayOptions: {
      show: {
        resource: ['projects'],
        operation: ['createProject'],
      },
    },
    description: 'The teams the project belongs to',
  },
  {
    displayName: 'Name',
    name: 'name',
    type: 'string' as const,
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['projects'],
        operation: ['createProject'],
      },
    },
    description: 'The name of the project',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection' as const,
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['projects'],
        operation: ['createProject'],
      },
    },
    options: [
      {
        displayName: 'Color',
        name: 'color',
        type: 'color' as const,
        default: '#0066FF',
        description: 'The color of the project',
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string' as const,
        typeOptions: {
          rows: 4,
        },
        default: '',
        description: 'The description of the project',
      },
      {
        displayName: 'Icon',
        name: 'icon',
        type: 'string' as const,
        default: '',
        description: 'The icon of the project (emoji or icon name)',
      },
      {
        displayName: 'Lead',
        name: 'leadId',
        type: 'options' as const,
        typeOptions: {
          loadOptionsMethod: 'getUsers',
        },
        default: '',
        description: 'The project lead',
      },
      {
        displayName: 'Members',
        name: 'memberIds',
        type: 'multiOptions' as const,
        typeOptions: {
          loadOptionsMethod: 'getUsers',
        },
        default: [],
        description: 'Project members',
      },
      {
        displayName: 'Start Date',
        name: 'startDate',
        type: 'dateTime' as const,
        default: '',
        description: 'The start date of the project',
      },
      {
        displayName: 'State',
        name: 'state',
        type: 'options' as const,
        options: PROJECT_STATE_OPTIONS,
        default: 'planned',
        description: 'The state of the project',
      },
      {
        displayName: 'Target Date',
        name: 'targetDate',
        type: 'dateTime' as const,
        default: '',
        description: 'The target completion date',
      },
    ],
  },

  // Project ID for get/update/delete
  {
    displayName: 'Project ID',
    name: 'projectId',
    type: 'options' as const,
    typeOptions: {
      loadOptionsMethod: 'getProjects',
    },
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['projects'],
        operation: [
          'getProject',
          'updateProject',
          'deleteProject',
          'archiveProject',
          'addProjectMember',
          'removeProjectMember',
          'listProjectMilestones',
          'createProjectMilestone',
        ],
      },
    },
    description: 'The project to operate on',
  },

  // Update Project
  {
    displayName: 'Update Fields',
    name: 'updateFields',
    type: 'collection' as const,
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['projects'],
        operation: ['updateProject'],
      },
    },
    options: [
      {
        displayName: 'Color',
        name: 'color',
        type: 'color' as const,
        default: '#0066FF',
        description: 'The color of the project',
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string' as const,
        typeOptions: {
          rows: 4,
        },
        default: '',
        description: 'The description of the project',
      },
      {
        displayName: 'Icon',
        name: 'icon',
        type: 'string' as const,
        default: '',
        description: 'The icon of the project',
      },
      {
        displayName: 'Lead',
        name: 'leadId',
        type: 'options' as const,
        typeOptions: {
          loadOptionsMethod: 'getUsers',
        },
        default: '',
        description: 'The project lead',
      },
      {
        displayName: 'Name',
        name: 'name',
        type: 'string' as const,
        default: '',
        description: 'The name of the project',
      },
      {
        displayName: 'Start Date',
        name: 'startDate',
        type: 'dateTime' as const,
        default: '',
        description: 'The start date of the project',
      },
      {
        displayName: 'State',
        name: 'state',
        type: 'options' as const,
        options: PROJECT_STATE_OPTIONS,
        default: 'planned',
        description: 'The state of the project',
      },
      {
        displayName: 'Target Date',
        name: 'targetDate',
        type: 'dateTime' as const,
        default: '',
        description: 'The target completion date',
      },
    ],
  },

  // List Projects
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean' as const,
    default: false,
    displayOptions: {
      show: {
        resource: ['projects'],
        operation: ['listProjects', 'listProjectMilestones'],
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
        resource: ['projects'],
        operation: ['listProjects', 'listProjectMilestones'],
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
        resource: ['projects'],
        operation: ['listProjects'],
      },
    },
    options: [
      {
        displayName: 'Include Archived',
        name: 'includeArchived',
        type: 'boolean' as const,
        default: false,
        description: 'Whether to include archived projects',
      },
      {
        displayName: 'State',
        name: 'state',
        type: 'options' as const,
        options: PROJECT_STATE_OPTIONS,
        default: '',
        description: 'Filter by project state',
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
    ],
  },

  // Add/Remove Member
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
        resource: ['projects'],
        operation: ['addProjectMember', 'removeProjectMember'],
      },
    },
    description: 'The user to add or remove',
  },

  // Create Milestone
  {
    displayName: 'Milestone Name',
    name: 'milestoneName',
    type: 'string' as const,
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['projects'],
        operation: ['createProjectMilestone'],
      },
    },
    description: 'The name of the milestone',
  },
  {
    displayName: 'Milestone Fields',
    name: 'milestoneFields',
    type: 'collection' as const,
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['projects'],
        operation: ['createProjectMilestone'],
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
        description: 'The description of the milestone',
      },
      {
        displayName: 'Target Date',
        name: 'targetDate',
        type: 'dateTime' as const,
        default: '',
        description: 'The target date for the milestone',
      },
    ],
  },
];

export async function executeProjectsOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject> {
  let result: IDataObject = {};

  switch (operation) {
    case 'listProjects':
      result = await listProjects.call(this, i);
      break;
    case 'getProject':
      result = await getProject.call(this, i);
      break;
    case 'createProject':
      result = await createProject.call(this, i);
      break;
    case 'updateProject':
      result = await updateProject.call(this, i);
      break;
    case 'deleteProject':
      result = await deleteProject.call(this, i);
      break;
    case 'archiveProject':
      result = await archiveProject.call(this, i);
      break;
    case 'addProjectMember':
      result = await addProjectMember.call(this, i);
      break;
    case 'removeProjectMember':
      result = await removeProjectMember.call(this, i);
      break;
    case 'listProjectMilestones':
      result = await listProjectMilestones.call(this, i);
      break;
    case 'createProjectMilestone':
      result = await createProjectMilestone.call(this, i);
      break;
  }

  return result;
}

async function listProjects(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const returnAll = this.getNodeParameter('returnAll', i) as boolean;
  const limit = this.getNodeParameter('limit', i, 50) as number;
  const filters = this.getNodeParameter('filters', i, {}) as IDataObject;

  const query = `
    query Projects($first: Int, $after: String, $includeArchived: Boolean) {
      projects(first: $first, after: $after, includeArchived: $includeArchived) {
        nodes {
          ${PROJECT_FIELDS}
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;

  const projects = await linearGraphQLPaginatedRequest.call(
    this,
    query,
    { includeArchived: filters.includeArchived === true },
    'projects',
    returnAll,
    limit,
  );

  return { projects };
}

async function getProject(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const projectId = this.getNodeParameter('projectId', i) as string;

  const query = `
    query Project($id: String!) {
      project(id: $id) {
        ${PROJECT_FIELDS}
        members {
          nodes {
            id
            name
            email
          }
        }
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, query, { id: projectId });
  return (response as IDataObject).project as IDataObject;
}

async function createProject(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const teamIds = this.getNodeParameter('teamIds', i) as string[];
  const name = this.getNodeParameter('name', i) as string;
  const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

  const input = cleanObject({
    teamIds,
    name,
    ...additionalFields,
  });

  const mutation = `
    mutation ProjectCreate($input: ProjectCreateInput!) {
      projectCreate(input: $input) {
        success
        project {
          ${PROJECT_FIELDS}
        }
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, mutation, { input });
  return ((response as IDataObject).projectCreate as IDataObject).project as IDataObject;
}

async function updateProject(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const projectId = this.getNodeParameter('projectId', i) as string;
  const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;

  const input = cleanObject(updateFields);

  const mutation = `
    mutation ProjectUpdate($id: String!, $input: ProjectUpdateInput!) {
      projectUpdate(id: $id, input: $input) {
        success
        project {
          ${PROJECT_FIELDS}
        }
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, mutation, { id: projectId, input });
  return ((response as IDataObject).projectUpdate as IDataObject).project as IDataObject;
}

async function deleteProject(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const projectId = this.getNodeParameter('projectId', i) as string;

  const mutation = `
    mutation ProjectDelete($id: String!) {
      projectDelete(id: $id) {
        success
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, mutation, { id: projectId });
  return { success: ((response as IDataObject).projectDelete as IDataObject).success };
}

async function archiveProject(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const projectId = this.getNodeParameter('projectId', i) as string;

  const mutation = `
    mutation ProjectArchive($id: String!) {
      projectArchive(id: $id) {
        success
        entity {
          ${PROJECT_FIELDS}
        }
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, mutation, { id: projectId });
  return ((response as IDataObject).projectArchive as IDataObject).entity as IDataObject;
}

async function addProjectMember(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const projectId = this.getNodeParameter('projectId', i) as string;
  const userId = this.getNodeParameter('userId', i) as string;

  // Get current members and add new one
  const query = `
    query Project($id: String!) {
      project(id: $id) {
        members {
          nodes {
            id
          }
        }
      }
    }
  `;

  const queryResponse = await linearGraphQLRequest.call(this, query, { id: projectId });
  const currentMembers = (((queryResponse as IDataObject).project as IDataObject).members as IDataObject).nodes as IDataObject[];
  const memberIds = [...currentMembers.map((m: IDataObject) => m.id as string), userId];

  const mutation = `
    mutation ProjectUpdate($id: String!, $input: ProjectUpdateInput!) {
      projectUpdate(id: $id, input: $input) {
        success
        project {
          ${PROJECT_FIELDS}
          members {
            nodes {
              id
              name
              email
            }
          }
        }
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, mutation, { 
    id: projectId, 
    input: { memberIds } 
  });
  return ((response as IDataObject).projectUpdate as IDataObject).project as IDataObject;
}

async function removeProjectMember(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const projectId = this.getNodeParameter('projectId', i) as string;
  const userId = this.getNodeParameter('userId', i) as string;

  // Get current members and remove the one
  const query = `
    query Project($id: String!) {
      project(id: $id) {
        members {
          nodes {
            id
          }
        }
      }
    }
  `;

  const queryResponse = await linearGraphQLRequest.call(this, query, { id: projectId });
  const currentMembers = (((queryResponse as IDataObject).project as IDataObject).members as IDataObject).nodes as IDataObject[];
  const memberIds = currentMembers
    .map((m: IDataObject) => m.id as string)
    .filter((id: string) => id !== userId);

  const mutation = `
    mutation ProjectUpdate($id: String!, $input: ProjectUpdateInput!) {
      projectUpdate(id: $id, input: $input) {
        success
        project {
          ${PROJECT_FIELDS}
          members {
            nodes {
              id
              name
              email
            }
          }
        }
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, mutation, { 
    id: projectId, 
    input: { memberIds } 
  });
  return ((response as IDataObject).projectUpdate as IDataObject).project as IDataObject;
}

async function listProjectMilestones(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const projectId = this.getNodeParameter('projectId', i) as string;
  const returnAll = this.getNodeParameter('returnAll', i) as boolean;
  const limit = this.getNodeParameter('limit', i, 50) as number;

  const query = `
    query ProjectMilestones($projectId: String!, $first: Int, $after: String) {
      project(id: $projectId) {
        projectMilestones(first: $first, after: $after) {
          nodes {
            ${PROJECT_MILESTONE_FIELDS}
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    }
  `;

  const milestones = await linearGraphQLPaginatedRequest.call(
    this,
    query,
    { projectId },
    'project.projectMilestones',
    returnAll,
    limit,
  );

  return { milestones };
}

async function createProjectMilestone(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const projectId = this.getNodeParameter('projectId', i) as string;
  const name = this.getNodeParameter('milestoneName', i) as string;
  const milestoneFields = this.getNodeParameter('milestoneFields', i, {}) as IDataObject;

  const input = cleanObject({
    projectId,
    name,
    ...milestoneFields,
  });

  const mutation = `
    mutation ProjectMilestoneCreate($input: ProjectMilestoneCreateInput!) {
      projectMilestoneCreate(input: $input) {
        success
        projectMilestone {
          ${PROJECT_MILESTONE_FIELDS}
        }
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, mutation, { input });
  return ((response as IDataObject).projectMilestoneCreate as IDataObject).projectMilestone as IDataObject;
}
