/**
 * Linear Node
 *
 * This file is part of n8n-nodes-linear, licensed under the Business Source License 1.1 (BSL 1.1).
 * Copyright (c) 2025 Velocity BPA. All rights reserved.
 */

import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	ILoadOptionsFunctions,
	INodePropertyOptions,
	IDataObject,
} from 'n8n-workflow';

import { linearGraphQLRequest } from './transport/graphql';

// Import operations and fields from all resources
import { issuesOperations, issuesFields, executeIssuesOperation } from './actions/issues/issues';
import { commentsOperations, commentsFields, executeCommentsOperation } from './actions/comments/comments';
import { projectsOperations, projectsFields, executeProjectsOperation } from './actions/projects/projects';
import { projectUpdatesOperations, projectUpdatesFields, executeProjectUpdatesOperation } from './actions/projectUpdates/projectUpdates';
import { cyclesOperations, cyclesFields, executeCyclesOperation } from './actions/cycles/cycles';
import { teamsOperations, teamsFields, executeTeamsOperation } from './actions/teams/teams';
import { usersOperations, usersFields, executeUsersOperation } from './actions/users/users';
import { labelsOperations, labelsFields, executeLabelsOperation } from './actions/labels/labels';
import { workflowStatesOperations, workflowStatesFields, executeWorkflowStatesOperation } from './actions/workflowStates/workflowStates';
import { integrationsOperations, integrationsFields, executeIntegrationsOperation } from './actions/integrations/integrations';
import { documentsOperations, documentsFields, executeDocumentsOperation } from './actions/documents/documents';
import { attachmentsOperations, attachmentsFields, executeAttachmentsOperation } from './actions/attachments/attachments';
import { favoritesOperations, favoritesFields, executeFavoritesOperation } from './actions/favorites/favorites';
import { notificationsOperations, notificationsFields, executeNotificationsOperation } from './actions/notifications/notifications';
import { webhooksOperations, webhooksFields, executeWebhooksOperation } from './actions/webhooks/webhooks';

// Helper to create operation property for a resource
function createOperationProperty(resource: string, options: INodePropertyOptions[]) {
	return {
		displayName: 'Operation',
		name: 'operation',
		type: 'options' as const,
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: [resource],
			},
		},
		options: options.map(op => ({
			...op,
			action: `${op.name.toLowerCase()} ${resource.replace(/([A-Z])/g, ' $1').trim().toLowerCase()}`,
		})),
		default: options[0]?.value || '',
	};
}

export class Linear implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Linear',
		name: 'linear',
		icon: 'file:linear.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with the Linear API for issue tracking and project management',
		defaults: {
			name: 'Linear',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'linearApi',
				required: true,
				displayOptions: {
					show: {
						authentication: ['apiKey'],
					},
				},
			},
			{
				name: 'linearOAuth2Api',
				required: true,
				displayOptions: {
					show: {
						authentication: ['oAuth2'],
					},
				},
			},
		],
		properties: [
			{
				displayName: 'Authentication',
				name: 'authentication',
				type: 'options',
				options: [
					{
						name: 'API Key',
						value: 'apiKey',
					},
					{
						name: 'OAuth2',
						value: 'oAuth2',
					},
				],
				default: 'apiKey',
			},
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Attachment', value: 'attachments' },
					{ name: 'Comment', value: 'comments' },
					{ name: 'Cycle', value: 'cycles' },
					{ name: 'Document', value: 'documents' },
					{ name: 'Favorite', value: 'favorites' },
					{ name: 'Integration', value: 'integrations' },
					{ name: 'Issue', value: 'issues' },
					{ name: 'Label', value: 'labels' },
					{ name: 'Notification', value: 'notifications' },
					{ name: 'Project', value: 'projects' },
					{ name: 'Project Update', value: 'projectUpdates' },
					{ name: 'Team', value: 'teams' },
					{ name: 'User', value: 'users' },
					{ name: 'Webhook', value: 'webhooks' },
					{ name: 'Workflow State', value: 'workflowStates' },
				],
				default: 'issues',
			},
			// Operations for each resource
			createOperationProperty('issues', issuesOperations),
			createOperationProperty('comments', commentsOperations),
			createOperationProperty('projects', projectsOperations),
			createOperationProperty('projectUpdates', projectUpdatesOperations),
			createOperationProperty('cycles', cyclesOperations),
			createOperationProperty('teams', teamsOperations),
			createOperationProperty('users', usersOperations),
			createOperationProperty('labels', labelsOperations),
			createOperationProperty('workflowStates', workflowStatesOperations),
			createOperationProperty('integrations', integrationsOperations),
			createOperationProperty('documents', documentsOperations),
			createOperationProperty('attachments', attachmentsOperations),
			createOperationProperty('favorites', favoritesOperations),
			createOperationProperty('notifications', notificationsOperations),
			createOperationProperty('webhooks', webhooksOperations),
			// Fields for each resource
			...issuesFields,
			...commentsFields,
			...projectsFields,
			...projectUpdatesFields,
			...cyclesFields,
			...teamsFields,
			...usersFields,
			...labelsFields,
			...workflowStatesFields,
			...integrationsFields,
			...documentsFields,
			...attachmentsFields,
			...favoritesFields,
			...notificationsFields,
			...webhooksFields,
		],
	};

	methods = {
		loadOptions: {
			async getTeams(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const query = `
					query {
						teams {
							nodes {
								id
								name
								key
							}
						}
					}
				`;

				const response = await linearGraphQLRequest.call(this, query, {}) as IDataObject;
				const teamsData = response.teams as IDataObject | undefined;
				const teams = (teamsData?.nodes as IDataObject[]) || [];

				return teams.map((team: IDataObject) => ({
					name: `${team.name} (${team.key})`,
					value: team.id as string,
				}));
			},

			async getUsers(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const query = `
					query {
						users {
							nodes {
								id
								name
								email
								active
							}
						}
					}
				`;

				const response = await linearGraphQLRequest.call(this, query, {}) as IDataObject;
				const usersData = response.users as IDataObject | undefined;
				const users = (usersData?.nodes as IDataObject[]) || [];

				return users
					.filter((user: IDataObject) => user.active)
					.map((user: IDataObject) => ({
						name: `${user.name} (${user.email})`,
						value: user.id as string,
					}));
			},

			async getProjects(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const query = `
					query {
						projects {
							nodes {
								id
								name
								state
							}
						}
					}
				`;

				const response = await linearGraphQLRequest.call(this, query, {}) as IDataObject;
				const projectsData = response.projects as IDataObject | undefined;
				const projects = (projectsData?.nodes as IDataObject[]) || [];

				return projects.map((project: IDataObject) => ({
					name: `${project.name} (${project.state})`,
					value: project.id as string,
				}));
			},

			async getCycles(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const query = `
					query {
						cycles {
							nodes {
								id
								name
								number
								startsAt
								endsAt
								team {
									key
								}
							}
						}
					}
				`;

				const response = await linearGraphQLRequest.call(this, query, {}) as IDataObject;
				const cyclesData = response.cycles as IDataObject | undefined;
				const cycles = (cyclesData?.nodes as IDataObject[]) || [];

				return cycles.map((cycle: IDataObject) => {
					const team = cycle.team as IDataObject;
					const name = cycle.name || `Cycle ${cycle.number}`;
					return {
						name: `${team?.key || 'Unknown'} - ${name}`,
						value: cycle.id as string,
					};
				});
			},

			async getLabels(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const query = `
					query {
						issueLabels {
							nodes {
								id
								name
								color
								team {
									key
								}
							}
						}
					}
				`;

				const response = await linearGraphQLRequest.call(this, query, {}) as IDataObject;
				const issueLabelsData = response.issueLabels as IDataObject | undefined;
				const labels = (issueLabelsData?.nodes as IDataObject[]) || [];

				return labels.map((label: IDataObject) => {
					const team = label.team as IDataObject;
					const prefix = team?.key ? `${team.key} - ` : '';
					return {
						name: `${prefix}${label.name}`,
						value: label.id as string,
					};
				});
			},

			async getWorkflowStates(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const query = `
					query {
						workflowStates {
							nodes {
								id
								name
								type
								team {
									key
								}
							}
						}
					}
				`;

				const response = await linearGraphQLRequest.call(this, query, {}) as IDataObject;
				const workflowStatesData = response.workflowStates as IDataObject | undefined;
				const states = (workflowStatesData?.nodes as IDataObject[]) || [];

				return states.map((state: IDataObject) => {
					const team = state.team as IDataObject;
					return {
						name: `${team?.key || 'Unknown'} - ${state.name} (${state.type})`,
						value: state.id as string,
					};
				});
			},

			async getIssues(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const query = `
					query {
						issues(first: 100) {
							nodes {
								id
								identifier
								title
							}
						}
					}
				`;

				const response = await linearGraphQLRequest.call(this, query, {}) as IDataObject;
				const issuesData = response.issues as IDataObject | undefined;
				const issues = (issuesData?.nodes as IDataObject[]) || [];

				return issues.map((issue: IDataObject) => ({
					name: `${issue.identifier}: ${issue.title}`,
					value: issue.id as string,
				}));
			},

			async getTeamWorkflowStates(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const teamId = this.getCurrentNodeParameter('teamId') as string;

				if (!teamId) {
					return this.getNodeParameter('getWorkflowStates') as Promise<INodePropertyOptions[]>;
				}

				const query = `
					query($teamId: String!) {
						team(id: $teamId) {
							states {
								nodes {
									id
									name
									type
								}
							}
						}
					}
				`;

				const response = await linearGraphQLRequest.call(this, query, { teamId }) as IDataObject;
				const teamData = response.team as IDataObject | undefined;
				const statesData = teamData?.states as IDataObject | undefined;
				const states = (statesData?.nodes as IDataObject[]) || [];

				return states.map((state: IDataObject) => ({
					name: `${state.name} (${state.type})`,
					value: state.id as string,
				}));
			},

			async getTeamLabels(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const teamId = this.getCurrentNodeParameter('teamId') as string;

				if (!teamId) {
					return this.getNodeParameter('getLabels') as Promise<INodePropertyOptions[]>;
				}

				const query = `
					query($teamId: String!) {
						team(id: $teamId) {
							labels {
								nodes {
									id
									name
									color
								}
							}
						}
					}
				`;

				const response = await linearGraphQLRequest.call(this, query, { teamId }) as IDataObject;
				const teamData = response.team as IDataObject | undefined;
				const labelsData = teamData?.labels as IDataObject | undefined;
				const labels = (labelsData?.nodes as IDataObject[]) || [];

				return labels.map((label: IDataObject) => ({
					name: label.name as string,
					value: label.id as string,
				}));
			},

			async getTeamCycles(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const teamId = this.getCurrentNodeParameter('teamId') as string;

				if (!teamId) {
					return this.getNodeParameter('getCycles') as Promise<INodePropertyOptions[]>;
				}

				const query = `
					query($teamId: String!) {
						team(id: $teamId) {
							cycles {
								nodes {
									id
									name
									number
									startsAt
									endsAt
								}
							}
						}
					}
				`;

				const response = await linearGraphQLRequest.call(this, query, { teamId }) as IDataObject;
				const teamData = response.team as IDataObject | undefined;
				const cyclesData = teamData?.cycles as IDataObject | undefined;
				const cycles = (cyclesData?.nodes as IDataObject[]) || [];

				return cycles.map((cycle: IDataObject) => {
					const name = String(cycle.name || `Cycle ${cycle.number}`);
					return {
						name,
						value: cycle.id as string,
					};
				});
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let result: IDataObject | IDataObject[];

				switch (resource) {
					case 'issues':
						result = await executeIssuesOperation.call(this, operation, i);
						break;
					case 'comments':
						result = await executeCommentsOperation.call(this, operation, i);
						break;
					case 'projects':
						result = await executeProjectsOperation.call(this, operation, i);
						break;
					case 'projectUpdates':
						result = await executeProjectUpdatesOperation.call(this, operation, i);
						break;
					case 'cycles':
						result = await executeCyclesOperation.call(this, operation, i);
						break;
					case 'teams':
						result = await executeTeamsOperation.call(this, operation, i);
						break;
					case 'users':
						result = await executeUsersOperation.call(this, operation, i);
						break;
					case 'labels':
						result = await executeLabelsOperation.call(this, operation, i);
						break;
					case 'workflowStates':
						result = await executeWorkflowStatesOperation.call(this, operation, i);
						break;
					case 'integrations':
						result = await executeIntegrationsOperation.call(this, operation, i);
						break;
					case 'documents':
						result = await executeDocumentsOperation.call(this, operation, i);
						break;
					case 'attachments':
						result = await executeAttachmentsOperation.call(this, operation, i);
						break;
					case 'favorites':
						result = await executeFavoritesOperation.call(this, operation, i);
						break;
					case 'notifications':
						result = await executeNotificationsOperation.call(this, operation, i);
						break;
					case 'webhooks':
						result = await executeWebhooksOperation.call(this, operation, i);
						break;
					default:
						throw new Error(`Unknown resource: ${resource}`);
				}

				if (Array.isArray(result)) {
					returnData.push(...result.map((item) => ({ json: item })));
				} else {
					returnData.push({ json: result });
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error instanceof Error ? error.message : String(error),
						},
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
