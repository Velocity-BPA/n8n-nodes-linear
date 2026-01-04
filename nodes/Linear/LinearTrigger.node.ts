/**
 * Linear Trigger Node
 *
 * This file is part of n8n-nodes-linear, licensed under the Business Source License 1.1 (BSL 1.1).
 * Copyright (c) 2025 Velocity BPA. All rights reserved.
 */

import type {
	IWebhookFunctions,
	IHookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
	ILoadOptionsFunctions,
	INodePropertyOptions,
	IDataObject,
} from 'n8n-workflow';

import { linearGraphQLRequest, verifyWebhookSignature } from './transport/graphql';

export class LinearTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Linear Trigger',
		name: 'linearTrigger',
		icon: 'file:linear.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["event"]}}',
		description: 'Starts the workflow when Linear events occur',
		defaults: {
			name: 'Linear Trigger',
		},
		inputs: [],
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
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
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
				displayName: 'Event',
				name: 'event',
				type: 'options',
				required: true,
				default: 'issueCreated',
				options: [
					{
						name: 'Attachment Created',
						value: 'attachmentCreated',
						description: 'Triggered when a new attachment is added',
					},
					{
						name: 'Attachment Removed',
						value: 'attachmentRemoved',
						description: 'Triggered when an attachment is removed',
					},
					{
						name: 'Attachment Updated',
						value: 'attachmentUpdated',
						description: 'Triggered when an attachment is updated',
					},
					{
						name: 'Comment Created',
						value: 'commentCreated',
						description: 'Triggered when a new comment is added to an issue',
					},
					{
						name: 'Comment Removed',
						value: 'commentRemoved',
						description: 'Triggered when a comment is deleted',
					},
					{
						name: 'Comment Updated',
						value: 'commentUpdated',
						description: 'Triggered when a comment is updated',
					},
					{
						name: 'Cycle Created',
						value: 'cycleCreated',
						description: 'Triggered when a new cycle is created',
					},
					{
						name: 'Cycle Removed',
						value: 'cycleRemoved',
						description: 'Triggered when a cycle is deleted',
					},
					{
						name: 'Cycle Updated',
						value: 'cycleUpdated',
						description: 'Triggered when a cycle is updated',
					},
					{
						name: 'Document Created',
						value: 'documentCreated',
						description: 'Triggered when a new document is created',
					},
					{
						name: 'Document Removed',
						value: 'documentRemoved',
						description: 'Triggered when a document is deleted',
					},
					{
						name: 'Document Updated',
						value: 'documentUpdated',
						description: 'Triggered when a document is updated',
					},
					{
						name: 'Issue Created',
						value: 'issueCreated',
						description: 'Triggered when a new issue is created',
					},
					{
						name: 'Issue Label Added',
						value: 'issueLabelCreated',
						description: 'Triggered when a label is added to an issue',
					},
					{
						name: 'Issue Label Removed',
						value: 'issueLabelRemoved',
						description: 'Triggered when a label is removed from an issue',
					},
					{
						name: 'Issue Removed',
						value: 'issueRemoved',
						description: 'Triggered when an issue is deleted',
					},
					{
						name: 'Issue Updated',
						value: 'issueUpdated',
						description: 'Triggered when an issue is updated',
					},
					{
						name: 'Project Created',
						value: 'projectCreated',
						description: 'Triggered when a new project is created',
					},
					{
						name: 'Project Removed',
						value: 'projectRemoved',
						description: 'Triggered when a project is deleted',
					},
					{
						name: 'Project Update Created',
						value: 'projectUpdateCreated',
						description: 'Triggered when a project update is posted',
					},
					{
						name: 'Project Update Removed',
						value: 'projectUpdateRemoved',
						description: 'Triggered when a project update is deleted',
					},
					{
						name: 'Project Update Updated',
						value: 'projectUpdateUpdated',
						description: 'Triggered when a project update is updated',
					},
					{
						name: 'Project Updated',
						value: 'projectUpdated',
						description: 'Triggered when a project is updated',
					},
					{
						name: 'Reaction Created',
						value: 'reactionCreated',
						description: 'Triggered when a reaction is added',
					},
					{
						name: 'Reaction Removed',
						value: 'reactionRemoved',
						description: 'Triggered when a reaction is removed',
					},
				],
			},
			{
				displayName: 'Team Name or ID',
				name: 'teamId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getTeams',
				},
				default: '',
				description: 'Filter events to a specific team. Leave empty for all teams. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'Webhook Secret',
				name: 'webhookSecret',
				type: 'string',
				typeOptions: {
					password: true,
				},
				default: '',
				description: 'A shared secret for webhook signature verification (recommended)',
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Verify Signature',
						name: 'verifySignature',
						type: 'boolean',
						default: true,
						description: 'Whether to verify the webhook signature (requires webhook secret)',
					},
					{
						displayName: 'Webhook Label',
						name: 'webhookLabel',
						type: 'string',
						default: '',
						description: 'A label to identify this webhook in Linear',
					},
				],
			},
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

				return [
					{ name: 'All Teams', value: '' },
					...teams.map((team: IDataObject) => ({
						name: `${team.name} (${team.key})`,
						value: team.id as string,
					})),
				];
			},
		},
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');
				const webhookData = this.getWorkflowStaticData('node');

				// Check if we have a stored webhook ID
				if (webhookData.webhookId) {
					try {
						const query = `
							query($id: String!) {
								webhook(id: $id) {
									id
									url
									enabled
								}
							}
						`;

						const response = await linearGraphQLRequest.call(this, query, {
							id: webhookData.webhookId as string,
						}) as IDataObject;

						const webhookCheck = response.webhook as IDataObject | undefined;
						if (webhookCheck && webhookCheck.url === webhookUrl) {
							return true;
						}
					} catch {
						// Webhook doesn't exist, will recreate
					}
				}

				// Check if webhook exists by URL
				const listQuery = `
					query {
						webhooks {
							nodes {
								id
								url
								enabled
							}
						}
					}
				`;

				const listResponse = await linearGraphQLRequest.call(this, listQuery, {}) as IDataObject;
				const webhooksData = listResponse.webhooks as IDataObject | undefined;
				const webhooks = (webhooksData?.nodes as IDataObject[]) || [];

				const existingWebhook = webhooks.find((w: IDataObject) => w.url === webhookUrl);
				if (existingWebhook) {
					webhookData.webhookId = existingWebhook.id;
					return true;
				}

				return false;
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');
				const webhookData = this.getWorkflowStaticData('node');
				const event = this.getNodeParameter('event') as string;
				const teamId = this.getNodeParameter('teamId') as string;
				const webhookSecret = this.getNodeParameter('webhookSecret') as string;
				const options = this.getNodeParameter('options') as IDataObject;

				// Map event to resource types
				const eventToResourceType: Record<string, string> = {
					issueCreated: 'Issue',
					issueUpdated: 'Issue',
					issueRemoved: 'Issue',
					commentCreated: 'Comment',
					commentUpdated: 'Comment',
					commentRemoved: 'Comment',
					projectCreated: 'Project',
					projectUpdated: 'Project',
					projectRemoved: 'Project',
					projectUpdateCreated: 'ProjectUpdate',
					projectUpdateUpdated: 'ProjectUpdate',
					projectUpdateRemoved: 'ProjectUpdate',
					cycleCreated: 'Cycle',
					cycleUpdated: 'Cycle',
					cycleRemoved: 'Cycle',
					issueLabelCreated: 'IssueLabel',
					issueLabelRemoved: 'IssueLabel',
					reactionCreated: 'Reaction',
					reactionRemoved: 'Reaction',
					attachmentCreated: 'Attachment',
					attachmentUpdated: 'Attachment',
					attachmentRemoved: 'Attachment',
					documentCreated: 'Document',
					documentUpdated: 'Document',
					documentRemoved: 'Document',
				};

				const resourceType = eventToResourceType[event];
				if (!resourceType) {
					throw new Error(`Unknown event type: ${event}`);
				}

				const input: IDataObject = {
					url: webhookUrl,
					resourceTypes: [resourceType],
					enabled: true,
				};

				if (teamId) {
					input.teamId = teamId;
				} else {
					input.allPublicTeams = true;
				}

				if (webhookSecret) {
					input.secret = webhookSecret;
				}

				if (options.webhookLabel) {
					input.label = options.webhookLabel;
				}

				const mutation = `
					mutation($input: WebhookCreateInput!) {
						webhookCreate(input: $input) {
							success
							webhook {
								id
								url
								enabled
							}
						}
					}
				`;

				const response = await linearGraphQLRequest.call(this, mutation, { input }) as IDataObject;
				const createResult = response.webhookCreate as IDataObject | undefined;

				if (!createResult?.success) {
					throw new Error('Failed to create webhook in Linear');
				}

				const webhookResult = createResult.webhook as IDataObject;
				webhookData.webhookId = webhookResult.id;
				return true;
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');

				if (!webhookData.webhookId) {
					return true;
				}

				try {
					const mutation = `
						mutation($id: String!) {
							webhookDelete(id: $id) {
								success
							}
						}
					`;

					await linearGraphQLRequest.call(this, mutation, {
						id: webhookData.webhookId as string,
					});
				} catch {
					// Ignore errors when deleting - webhook might already be gone
				}

				delete webhookData.webhookId;
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const req = this.getRequestObject();
		const body = this.getBodyData() as IDataObject;
		const event = this.getNodeParameter('event') as string;
		const webhookSecret = this.getNodeParameter('webhookSecret') as string;
		const options = this.getNodeParameter('options') as IDataObject;

		// Verify webhook signature if secret is configured
		if (webhookSecret && options.verifySignature !== false) {
			const signature = req.headers['linear-signature'] as string;
			const rawBody = (req as unknown as { rawBody?: Buffer }).rawBody?.toString() || JSON.stringify(body);

			if (!signature || !verifyWebhookSignature(rawBody, signature, webhookSecret)) {
				return {
					webhookResponse: 'Invalid signature',
				};
			}
		}

		// Handle webhook verification ping
		if (body.type === 'UrlVerification') {
			return {
				webhookResponse: JSON.stringify({ success: true }),
			};
		}

		// Map Linear webhook action to our event names
		const action = body.action as string;
		const type = body.type as string;

		const webhookEventMap: Record<string, string> = {
			'Issue:create': 'issueCreated',
			'Issue:update': 'issueUpdated',
			'Issue:remove': 'issueRemoved',
			'Comment:create': 'commentCreated',
			'Comment:update': 'commentUpdated',
			'Comment:remove': 'commentRemoved',
			'Project:create': 'projectCreated',
			'Project:update': 'projectUpdated',
			'Project:remove': 'projectRemoved',
			'ProjectUpdate:create': 'projectUpdateCreated',
			'ProjectUpdate:update': 'projectUpdateUpdated',
			'ProjectUpdate:remove': 'projectUpdateRemoved',
			'Cycle:create': 'cycleCreated',
			'Cycle:update': 'cycleUpdated',
			'Cycle:remove': 'cycleRemoved',
			'IssueLabel:create': 'issueLabelCreated',
			'IssueLabel:remove': 'issueLabelRemoved',
			'Reaction:create': 'reactionCreated',
			'Reaction:remove': 'reactionRemoved',
			'Attachment:create': 'attachmentCreated',
			'Attachment:update': 'attachmentUpdated',
			'Attachment:remove': 'attachmentRemoved',
			'Document:create': 'documentCreated',
			'Document:update': 'documentUpdated',
			'Document:remove': 'documentRemoved',
		};

		const webhookEvent = webhookEventMap[`${type}:${action}`];

		// Check if this event matches our configured event
		if (webhookEvent !== event) {
			return {
				noWebhookResponse: true,
			};
		}

		// Extract the data
		const data = body.data as IDataObject;

		return {
			workflowData: [
				this.helpers.returnJsonArray([
					{
						event: webhookEvent,
						type,
						action,
						data,
						createdAt: body.createdAt,
						organizationId: body.organizationId,
						webhookId: body.webhookId,
						webhookTimestamp: body.webhookTimestamp,
						url: body.url,
					},
				]),
			],
		};
	}
}
