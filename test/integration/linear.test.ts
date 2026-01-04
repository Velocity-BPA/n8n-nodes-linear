/**
 * Integration tests for Linear Node
 *
 * This file is part of n8n-nodes-linear, licensed under the Business Source License 1.1 (BSL 1.1).
 * Copyright (c) 2025 Velocity BPA. All rights reserved.
 *
 * Note: These tests require a valid Linear API key to run against the actual API.
 * Set the LINEAR_API_KEY environment variable to run these tests.
 */

// Skip integration tests if no API key is provided
const API_KEY = process.env.LINEAR_API_KEY;
const describeIntegration = API_KEY ? describe : describe.skip;

describeIntegration('Linear API Integration Tests', () => {
	const baseUrl = 'https://api.linear.app/graphql';

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	async function makeGraphQLRequest(query: string, variables: Record<string, unknown> = {}): Promise<any> {
		const response = await fetch(baseUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': API_KEY!,
			},
			body: JSON.stringify({ query, variables }),
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json() as { data?: unknown; errors?: Array<{ message?: string }> };
		if (data.errors) {
			throw new Error(data.errors[0]?.message || 'GraphQL error');
		}

		return data.data;
	}

	describe('Teams', () => {
		it('should list teams', async () => {
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

			const data = await makeGraphQLRequest(query);
			expect(data.teams).toBeDefined();
			expect(data.teams.nodes).toBeInstanceOf(Array);
		});
	});

	describe('Users', () => {
		it('should get current user (viewer)', async () => {
			const query = `
				query {
					viewer {
						id
						name
						email
					}
				}
			`;

			const data = await makeGraphQLRequest(query);
			expect(data.viewer).toBeDefined();
			expect(data.viewer.id).toBeDefined();
			expect(data.viewer.email).toBeDefined();
		});

		it('should list users', async () => {
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

			const data = await makeGraphQLRequest(query);
			expect(data.users).toBeDefined();
			expect(data.users.nodes).toBeInstanceOf(Array);
		});
	});

	describe('Issues', () => {
		it('should list issues', async () => {
			const query = `
				query {
					issues(first: 10) {
						nodes {
							id
							identifier
							title
							state {
								name
							}
						}
						pageInfo {
							hasNextPage
							endCursor
						}
					}
				}
			`;

			const data = await makeGraphQLRequest(query);
			expect(data.issues).toBeDefined();
			expect(data.issues.nodes).toBeInstanceOf(Array);
			expect(data.issues.pageInfo).toBeDefined();
		});

		it('should filter issues by team', async () => {
			// First get a team
			const teamsQuery = `
				query {
					teams(first: 1) {
						nodes {
							id
							key
						}
					}
				}
			`;

			const teamsData = await makeGraphQLRequest(teamsQuery);
			if (teamsData.teams.nodes.length === 0) {
				console.log('No teams found, skipping team filter test');
				return;
			}

			const teamId = teamsData.teams.nodes[0].id;

			const query = `
				query($teamId: ID) {
					issues(first: 10, filter: { team: { id: { eq: $teamId } } }) {
						nodes {
							id
							identifier
							team {
								id
							}
						}
					}
				}
			`;

			const data = await makeGraphQLRequest(query, { teamId });
			expect(data.issues).toBeDefined();
			expect(data.issues.nodes).toBeInstanceOf(Array);

			// All returned issues should be from the specified team
			for (const issue of data.issues.nodes) {
				expect(issue.team.id).toBe(teamId);
			}
		});
	});

	describe('Projects', () => {
		it('should list projects', async () => {
			const query = `
				query {
					projects(first: 10) {
						nodes {
							id
							name
							state
						}
					}
				}
			`;

			const data = await makeGraphQLRequest(query);
			expect(data.projects).toBeDefined();
			expect(data.projects.nodes).toBeInstanceOf(Array);
		});
	});

	describe('Cycles', () => {
		it('should list cycles', async () => {
			const query = `
				query {
					cycles(first: 10) {
						nodes {
							id
							name
							number
							startsAt
							endsAt
						}
					}
				}
			`;

			const data = await makeGraphQLRequest(query);
			expect(data.cycles).toBeDefined();
			expect(data.cycles.nodes).toBeInstanceOf(Array);
		});
	});

	describe('Labels', () => {
		it('should list issue labels', async () => {
			const query = `
				query {
					issueLabels(first: 10) {
						nodes {
							id
							name
							color
						}
					}
				}
			`;

			const data = await makeGraphQLRequest(query);
			expect(data.issueLabels).toBeDefined();
			expect(data.issueLabels.nodes).toBeInstanceOf(Array);
		});
	});

	describe('Workflow States', () => {
		it('should list workflow states', async () => {
			const query = `
				query {
					workflowStates(first: 50) {
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

			const data = await makeGraphQLRequest(query);
			expect(data.workflowStates).toBeDefined();
			expect(data.workflowStates.nodes).toBeInstanceOf(Array);
		});
	});

	describe('Notifications', () => {
		it('should list notifications', async () => {
			const query = `
				query {
					notifications(first: 10) {
						nodes {
							id
							type
							readAt
						}
					}
				}
			`;

			const data = await makeGraphQLRequest(query);
			expect(data.notifications).toBeDefined();
			expect(data.notifications.nodes).toBeInstanceOf(Array);
		});
	});

	describe('Organization', () => {
		it('should get organization info', async () => {
			const query = `
				query {
					organization {
						id
						name
						urlKey
					}
				}
			`;

			const data = await makeGraphQLRequest(query);
			expect(data.organization).toBeDefined();
			expect(data.organization.id).toBeDefined();
			expect(data.organization.name).toBeDefined();
		});
	});
});

// Test for node structure
describe('Linear Node Structure', () => {
	it('should export Linear node class', () => {
		const { Linear } = require('../../nodes/Linear/Linear.node');
		expect(Linear).toBeDefined();
		expect(typeof Linear).toBe('function');
	});

	it('should export LinearTrigger node class', () => {
		const { LinearTrigger } = require('../../nodes/Linear/LinearTrigger.node');
		expect(LinearTrigger).toBeDefined();
		expect(typeof LinearTrigger).toBe('function');
	});

	it('should have proper node description', () => {
		const { Linear } = require('../../nodes/Linear/Linear.node');
		const node = new Linear();

		expect(node.description).toBeDefined();
		expect(node.description.displayName).toBe('Linear');
		expect(node.description.name).toBe('linear');
		expect(node.description.properties).toBeInstanceOf(Array);
	});

	it('should have proper trigger node description', () => {
		const { LinearTrigger } = require('../../nodes/Linear/LinearTrigger.node');
		const node = new LinearTrigger();

		expect(node.description).toBeDefined();
		expect(node.description.displayName).toBe('Linear Trigger');
		expect(node.description.name).toBe('linearTrigger');
		expect(node.description.webhooks).toBeDefined();
	});

	it('should have all 15 resources defined', () => {
		const { Linear } = require('../../nodes/Linear/Linear.node');
		const node = new Linear();

		const resourceProperty = node.description.properties.find(
			(p: { name: string }) => p.name === 'resource'
		);

		expect(resourceProperty).toBeDefined();
		expect(resourceProperty.options.length).toBe(15);

		const resourceValues = resourceProperty.options.map((o: { value: string }) => o.value);
		expect(resourceValues).toContain('issues');
		expect(resourceValues).toContain('comments');
		expect(resourceValues).toContain('projects');
		expect(resourceValues).toContain('projectUpdates');
		expect(resourceValues).toContain('cycles');
		expect(resourceValues).toContain('teams');
		expect(resourceValues).toContain('users');
		expect(resourceValues).toContain('labels');
		expect(resourceValues).toContain('workflowStates');
		expect(resourceValues).toContain('integrations');
		expect(resourceValues).toContain('documents');
		expect(resourceValues).toContain('attachments');
		expect(resourceValues).toContain('favorites');
		expect(resourceValues).toContain('notifications');
		expect(resourceValues).toContain('webhooks');
	});
});
