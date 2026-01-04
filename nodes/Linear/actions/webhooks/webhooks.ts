/**
 * Linear Webhooks Resource
 *
 * This file is part of n8n-nodes-linear, licensed under the Business Source License 1.1 (BSL 1.1).
 * Copyright (c) 2025 Velocity BPA. All rights reserved.
 */

import type { IExecuteFunctions, IDataObject, INodePropertyOptions } from 'n8n-workflow';
import { linearGraphQLRequest, linearGraphQLPaginatedRequest } from '../../transport/graphql';

export const webhooksOperations: INodePropertyOptions[] = [
	{ name: 'Create', value: 'createWebhook' },
	{ name: 'Delete', value: 'deleteWebhook' },
	{ name: 'Get', value: 'getWebhook' },
	{ name: 'List', value: 'listWebhooks' },
	{ name: 'Update', value: 'updateWebhook' },
];

export const webhooksFields = [
	// Webhook ID - for single webhook operations
	{
		displayName: 'Webhook ID',
		name: 'webhookId',
		type: 'string' as const,
		required: true,
		default: '',
		description: 'The ID of the webhook',
		displayOptions: {
			show: {
				resource: ['webhooks'],
				operation: ['getWebhook', 'updateWebhook', 'deleteWebhook'],
			},
		},
	},

	// URL - required for create
	{
		displayName: 'Webhook URL',
		name: 'url',
		type: 'string' as const,
		required: true,
		default: '',
		placeholder: 'https://example.com/webhook',
		description: 'The URL to send webhook events to',
		displayOptions: {
			show: {
				resource: ['webhooks'],
				operation: ['createWebhook'],
			},
		},
	},

	// Team Name or ID - optional for scoping
	{
		displayName: 'Team Name or ID',
		name: 'teamId',
		type: 'options' as const,
		typeOptions: {
			loadOptionsMethod: 'getTeams',
		},
		default: '',
		description: 'The team to scope the webhook to. Leave empty for organization-wide webhook. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		displayOptions: {
			show: {
				resource: ['webhooks'],
				operation: ['createWebhook'],
			},
		},
	},

	// Resource Types - for create
	{
		displayName: 'Resource Types',
		name: 'resourceTypes',
		type: 'multiOptions' as const,
		required: true,
		default: [],
		description: 'The types of resources to receive webhooks for',
		displayOptions: {
			show: {
				resource: ['webhooks'],
				operation: ['createWebhook'],
			},
		},
		options: [
			{ name: 'Attachment', value: 'Attachment' },
			{ name: 'Comment', value: 'Comment' },
			{ name: 'Cycle', value: 'Cycle' },
			{ name: 'Document', value: 'Document' },
			{ name: 'Issue', value: 'Issue' },
			{ name: 'Issue Label', value: 'IssueLabel' },
			{ name: 'Project', value: 'Project' },
			{ name: 'Project Update', value: 'ProjectUpdate' },
			{ name: 'Reaction', value: 'Reaction' },
		],
	},

	// Label - optional description
	{
		displayName: 'Label',
		name: 'label',
		type: 'string' as const,
		default: '',
		description: 'A label to identify this webhook',
		displayOptions: {
			show: {
				resource: ['webhooks'],
				operation: ['createWebhook'],
			},
		},
	},

	// Secret - optional shared secret
	{
		displayName: 'Secret',
		name: 'secret',
		type: 'string' as const,
		typeOptions: {
			password: true,
		},
		default: '',
		description: 'A shared secret to sign webhook payloads (recommended for security)',
		displayOptions: {
			show: {
				resource: ['webhooks'],
				operation: ['createWebhook'],
			},
		},
	},

	// Enabled flag
	{
		displayName: 'Enabled',
		name: 'enabled',
		type: 'boolean' as const,
		default: true,
		description: 'Whether the webhook is enabled',
		displayOptions: {
			show: {
				resource: ['webhooks'],
				operation: ['createWebhook'],
			},
		},
	},

	// Update options
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection' as const,
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['webhooks'],
				operation: ['updateWebhook'],
			},
		},
		options: [
			{
				displayName: 'URL',
				name: 'url',
				type: 'string' as const,
				default: '',
				description: 'The URL to send webhook events to',
			},
			{
				displayName: 'Label',
				name: 'label',
				type: 'string' as const,
				default: '',
				description: 'A label to identify this webhook',
			},
			{
				displayName: 'Secret',
				name: 'secret',
				type: 'string' as const,
				typeOptions: {
					password: true,
				},
				default: '',
				description: 'A shared secret to sign webhook payloads',
			},
			{
				displayName: 'Enabled',
				name: 'enabled',
				type: 'boolean' as const,
				default: true,
				description: 'Whether the webhook is enabled',
			},
			{
				displayName: 'Resource Types',
				name: 'resourceTypes',
				type: 'multiOptions' as const,
				default: [],
				description: 'The types of resources to receive webhooks for',
				options: [
					{ name: 'Attachment', value: 'Attachment' },
					{ name: 'Comment', value: 'Comment' },
					{ name: 'Cycle', value: 'Cycle' },
					{ name: 'Document', value: 'Document' },
					{ name: 'Issue', value: 'Issue' },
					{ name: 'Issue Label', value: 'IssueLabel' },
					{ name: 'Project', value: 'Project' },
					{ name: 'Project Update', value: 'ProjectUpdate' },
					{ name: 'Reaction', value: 'Reaction' },
				],
			},
		],
	},

	// Return All - for list operation
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean' as const,
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		displayOptions: {
			show: {
				resource: ['webhooks'],
				operation: ['listWebhooks'],
			},
		},
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number' as const,
		default: 50,
		description: 'Max number of results to return',
		typeOptions: {
			minValue: 1,
			maxValue: 250,
		},
		displayOptions: {
			show: {
				resource: ['webhooks'],
				operation: ['listWebhooks'],
				returnAll: [false],
			},
		},
	},
];

const WEBHOOK_FIELDS = `
	id
	url
	label
	enabled
	createdAt
	updatedAt
	resourceTypes
	allPublicTeams
	team {
		id
		name
		key
	}
	creator {
		id
		name
		email
	}
`;

export async function executeWebhooksOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	switch (operation) {
		case 'listWebhooks': {
			const returnAll = this.getNodeParameter('returnAll', i) as boolean;
			const limit = this.getNodeParameter('limit', i, 50) as number;

			const query = `
				query($first: Int, $after: String) {
					webhooks(first: $first, after: $after) {
						nodes {
							${WEBHOOK_FIELDS}
						}
						pageInfo {
							hasNextPage
							endCursor
						}
					}
				}
			`;

			if (returnAll) {
				return await linearGraphQLPaginatedRequest.call(this, query, {}, 'webhooks', returnAll, limit) as IDataObject[];
			}

			const response = await linearGraphQLRequest.call(this, query, { first: limit }) as IDataObject;
			const webhooksData = response.webhooks as IDataObject | undefined;
			return (webhooksData?.nodes as IDataObject[]) || [];
		}

		case 'getWebhook': {
			const webhookId = this.getNodeParameter('webhookId', i) as string;

			const query = `
				query($id: String!) {
					webhook(id: $id) {
						${WEBHOOK_FIELDS}
					}
				}
			`;

			const response = await linearGraphQLRequest.call(this, query, { id: webhookId }) as IDataObject;
			return (response.webhook as IDataObject) || {};
		}

		case 'createWebhook': {
			const url = this.getNodeParameter('url', i) as string;
			const teamId = this.getNodeParameter('teamId', i, '') as string;
			const resourceTypes = this.getNodeParameter('resourceTypes', i) as string[];
			const label = this.getNodeParameter('label', i, '') as string;
			const secret = this.getNodeParameter('secret', i, '') as string;
			const enabled = this.getNodeParameter('enabled', i) as boolean;

			const input: IDataObject = {
				url,
				resourceTypes,
				enabled,
			};

			if (teamId) {
				input.teamId = teamId;
			} else {
				input.allPublicTeams = true;
			}

			if (label) {
				input.label = label;
			}

			if (secret) {
				input.secret = secret;
			}

			const mutation = `
				mutation($input: WebhookCreateInput!) {
					webhookCreate(input: $input) {
						success
						webhook {
							${WEBHOOK_FIELDS}
						}
					}
				}
			`;

			const response = await linearGraphQLRequest.call(this, mutation, { input }) as IDataObject;
			const createResult = response.webhookCreate as IDataObject | undefined;
			return (createResult?.webhook as IDataObject) || { success: createResult?.success };
		}

		case 'updateWebhook': {
			const webhookId = this.getNodeParameter('webhookId', i) as string;
			const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

			const input: IDataObject = {};

			if (updateFields.url) {
				input.url = updateFields.url;
			}

			if (updateFields.label !== undefined) {
				input.label = updateFields.label;
			}

			if (updateFields.secret) {
				input.secret = updateFields.secret;
			}

			if (updateFields.enabled !== undefined) {
				input.enabled = updateFields.enabled;
			}

			if (updateFields.resourceTypes && (updateFields.resourceTypes as string[]).length > 0) {
				input.resourceTypes = updateFields.resourceTypes;
			}

			const mutation = `
				mutation($id: String!, $input: WebhookUpdateInput!) {
					webhookUpdate(id: $id, input: $input) {
						success
						webhook {
							${WEBHOOK_FIELDS}
						}
					}
				}
			`;

			const response = await linearGraphQLRequest.call(this, mutation, { id: webhookId, input }) as IDataObject;
			const updateResult = response.webhookUpdate as IDataObject | undefined;
			return (updateResult?.webhook as IDataObject) || { success: updateResult?.success };
		}

		case 'deleteWebhook': {
			const webhookId = this.getNodeParameter('webhookId', i) as string;

			const mutation = `
				mutation($id: String!) {
					webhookDelete(id: $id) {
						success
					}
				}
			`;

			const response = await linearGraphQLRequest.call(this, mutation, { id: webhookId }) as IDataObject;
			const deleteResult = response.webhookDelete as IDataObject | undefined;
			return { success: deleteResult?.success || false, id: webhookId };
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}
