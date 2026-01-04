# n8n-nodes-linear

> [Velocity BPA Licensing Notice]
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for Linear, the modern issue tracking and project management tool. This node provides full access to Linear's GraphQL API with 15 resources and 100+ operations for complete workflow automation.

![n8n](https://img.shields.io/badge/n8n-community--node-orange)
![Linear](https://img.shields.io/badge/Linear-API-5E6AD2)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)

## Features

- **15 Resources** - Complete coverage of Linear's API including Issues, Projects, Cycles, Teams, Users, and more
- **100+ Operations** - Full CRUD operations plus specialized actions for each resource
- **GraphQL Integration** - Native GraphQL implementation for optimal performance
- **Webhook Triggers** - Real-time event notifications for issues, projects, comments, and more
- **OAuth2 & API Key** - Support for both authentication methods
- **Cursor Pagination** - Efficient handling of large datasets
- **Webhook Signatures** - Secure webhook verification with HMAC SHA256

## Installation

### Community Nodes (Recommended)

1. Go to **Settings** > **Community Nodes**
2. Select **Install**
3. Enter `n8n-nodes-linear` in **Enter npm package name**
4. Agree to the risks and select **Install**

### Manual Installation

```bash
# Navigate to your n8n installation directory
cd ~/.n8n

# Install the package
npm install n8n-nodes-linear
```

### Development Installation

```bash
# Clone the repository
git clone https://github.com/Velocity-BPA/n8n-nodes-linear.git
cd n8n-nodes-linear

# Install dependencies
npm install

# Build the project
npm run build

# Link to n8n
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-linear

# Restart n8n
```

## Credentials Setup

### API Key Authentication

1. Log in to your Linear workspace
2. Go to **Settings** > **API** > **Personal API keys**
3. Click **Create key** and give it a name
4. Copy the generated API key
5. In n8n, create a new **Linear API** credential and paste the key

### OAuth2 Authentication

1. Go to **Settings** > **API** > **OAuth applications** in Linear
2. Create a new OAuth application
3. Set the callback URL to your n8n OAuth callback URL
4. Copy the Client ID and Client Secret
5. In n8n, create a new **Linear OAuth2 API** credential with the details

## Resources & Operations

### Issues (20 operations)
- **List Issues** - Query issues with filters
- **Get Issue** - Get issue by ID or identifier (e.g., ENG-123)
- **Create Issue** - Create a new issue
- **Update Issue** - Update issue fields
- **Delete Issue** - Permanently delete an issue
- **Archive/Unarchive** - Archive or restore issues
- **Add/Remove Labels** - Manage issue labels
- **Add/Remove Subscribers** - Manage issue watchers
- **Set Priority** - Change issue priority
- **Set State** - Change workflow state
- **Assign/Unassign** - Manage issue assignee
- **Move to Project** - Move issue to a different project
- **Move to Team** - Transfer issue to another team
- **Set Parent** - Create sub-issue relationship
- **Add/Remove Relations** - Manage issue relationships

### Comments (7 operations)
- **List Comments** - Get comments for an issue
- **Get Comment** - Get a specific comment
- **Create Comment** - Add a comment to an issue
- **Update Comment** - Edit a comment
- **Delete Comment** - Remove a comment
- **Create Reaction** - Add emoji reaction
- **Delete Reaction** - Remove emoji reaction

### Projects (10 operations)
- **List Projects** - Query all projects
- **Get Project** - Get project details
- **Create Project** - Create a new project
- **Update Project** - Update project settings
- **Delete Project** - Remove a project
- **Archive Project** - Archive a project
- **Add/Remove Members** - Manage project team
- **List Milestones** - Get project milestones
- **Create Milestone** - Add a project milestone

### Project Updates (4 operations)
- **List Updates** - Get project status updates
- **Create Update** - Post a project update
- **Update Update** - Edit a project update
- **Delete Update** - Remove a project update

### Cycles (8 operations)
- **List Cycles** - Query cycles/sprints
- **Get Cycle** - Get cycle details
- **Create Cycle** - Create a new cycle
- **Update Cycle** - Update cycle dates/details
- **Archive Cycle** - Archive a cycle
- **Get Current Cycle** - Get active cycle for a team
- **Add/Remove Issue** - Manage cycle issues

### Teams (11 operations)
- **List Teams** - Get all teams
- **Get Team** - Get team details
- **Create Team** - Create a new team
- **Update Team** - Update team settings
- **Delete Team** - Remove a team
- **Get Members** - List team members
- **Add/Remove Members** - Manage team membership
- **Get Labels** - List team-specific labels
- **Get States** - Get workflow states
- **Get Templates** - Get issue templates

### Users (7 operations)
- **List Users** - Get all users
- **Get User** - Get user details
- **Get Current User** - Get authenticated user
- **Update User** - Update user settings
- **Suspend/Unsuspend User** - Manage user access
- **Get Assigned Issues** - List user's issues

### Labels (6 operations)
- **List Labels** - Get all labels
- **Get Label** - Get label details
- **Create Label** - Create a new label
- **Update Label** - Update label properties
- **Delete Label** - Remove a label
- **Archive Label** - Archive a label

### Workflow States (5 operations)
- **List States** - Get all workflow states
- **Get State** - Get state details
- **Create State** - Create a new state
- **Update State** - Update state properties
- **Archive State** - Archive a state

### Integrations (4 operations)
- **List Integrations** - Get configured integrations
- **Get Integration** - Get integration details
- **Delete Integration** - Remove an integration
- **List Templates** - Get available templates

### Documents (5 operations)
- **List Documents** - Get all documents
- **Get Document** - Get document content
- **Create Document** - Create a new document
- **Update Document** - Update document content
- **Delete Document** - Remove a document

### Attachments (5 operations)
- **List Attachments** - Get issue attachments
- **Get Attachment** - Get attachment details
- **Create Attachment** - Add attachment link
- **Update Attachment** - Update attachment
- **Delete Attachment** - Remove attachment

### Favorites (3 operations)
- **List Favorites** - Get user's favorites
- **Create Favorite** - Add to favorites
- **Delete Favorite** - Remove from favorites

### Notifications (7 operations)
- **List Notifications** - Get all notifications
- **Mark as Read** - Mark notification read
- **Mark All as Read** - Bulk mark as read
- **Archive/Unarchive** - Manage notification archive
- **Snooze/Unsnooze** - Snooze notifications

### Webhooks (5 operations)
- **List Webhooks** - Get configured webhooks
- **Get Webhook** - Get webhook details
- **Create Webhook** - Create a new webhook
- **Update Webhook** - Update webhook config
- **Delete Webhook** - Remove a webhook

## Trigger Node

The **Linear Trigger** node listens for webhook events from Linear:

### Supported Events
- **Issue Events** - Created, Updated, Removed
- **Comment Events** - Created, Updated, Removed
- **Project Events** - Created, Updated, Removed
- **Project Update Events** - Created, Updated, Removed
- **Cycle Events** - Created, Updated, Removed
- **Label Events** - Created, Removed
- **Reaction Events** - Created, Removed
- **Attachment Events** - Created, Updated, Removed
- **Document Events** - Created, Updated, Removed

### Configuration
1. Add the Linear Trigger node to your workflow
2. Select the event type to listen for
3. Optionally scope to a specific team
4. Add a webhook secret for signature verification
5. Activate the workflow

## Usage Examples

### Create Issue with Labels

```json
{
  "resource": "issues",
  "operation": "createIssue",
  "teamId": "team-uuid",
  "title": "Bug: Login button not working",
  "additionalFields": {
    "description": "Users report the login button is unresponsive",
    "priority": 2,
    "labelIds": ["label-uuid-1", "label-uuid-2"]
  }
}
```

### Search Issues by State

```json
{
  "resource": "issues",
  "operation": "listIssues",
  "returnAll": false,
  "limit": 20,
  "filters": {
    "state": "In Progress",
    "team": "team-uuid"
  }
}
```

### Move Issue Through Workflow

```json
{
  "resource": "issues",
  "operation": "setIssueState",
  "issueId": "ENG-123",
  "stateId": "done-state-uuid"
}
```

### Add Comment with Mention

```json
{
  "resource": "comments",
  "operation": "createComment",
  "issueId": "ENG-123",
  "body": "Hey @user, can you review this?"
}
```

## Linear Concepts

| Concept | Description |
|---------|-------------|
| **Identifier** | Human-readable issue ID (e.g., ENG-123) |
| **UUID** | Internal ID for all resources |
| **State** | Workflow state (Backlog, Todo, In Progress, Done, Canceled) |
| **Priority** | 0=No priority, 1=Urgent, 2=High, 3=Medium, 4=Low |
| **Cycle** | Sprint or iteration for time-boxed work |
| **Project** | Collection of related issues with a goal |
| **Team** | Organizational unit with its own workflow |
| **Triage** | Issues requiring initial review |

## API Rate Limits

- **API Key**: 1,500 requests/hour
- **OAuth**: 500 requests/hour
- **Complexity**: 250,000 points/hour

The node automatically handles pagination and respects rate limits.

## Error Handling

The node provides detailed error messages for:
- Authentication failures
- Rate limit exceeded
- Resource not found
- Validation errors
- GraphQL query errors

Enable **Continue On Fail** to process errors gracefully in workflows.

## Security Best Practices

1. Use OAuth2 for production deployments
2. Enable webhook signature verification
3. Use environment variables for credentials
4. Limit API key permissions when possible
5. Regularly rotate API keys

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Fix lint issues
npm run lint:fix

# Format code
npm run format
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service,
or paid automation offering requires a commercial license.

For licensing inquiries:
**licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

Please ensure all tests pass and linting is clean before submitting.

## Support

- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-linear/issues)
- **Documentation**: [Linear API Docs](https://developers.linear.app/docs)
- **n8n Community**: [n8n Community Forum](https://community.n8n.io)

## Acknowledgments

- [Linear](https://linear.app) for their excellent API and documentation
- [n8n](https://n8n.io) for the workflow automation platform
- The n8n community for feedback and contributions
