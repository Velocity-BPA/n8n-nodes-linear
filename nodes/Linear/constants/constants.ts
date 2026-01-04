/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { INodePropertyOptions } from 'n8n-workflow';

export const LINEAR_API_URL = 'https://api.linear.app/graphql';

export const RESOURCE_OPTIONS: INodePropertyOptions[] = [
  { name: 'Attachments', value: 'attachments' },
  { name: 'Comments', value: 'comments' },
  { name: 'Cycles', value: 'cycles' },
  { name: 'Documents', value: 'documents' },
  { name: 'Favorites', value: 'favorites' },
  { name: 'Integrations', value: 'integrations' },
  { name: 'Issues', value: 'issues' },
  { name: 'Labels', value: 'labels' },
  { name: 'Notifications', value: 'notifications' },
  { name: 'Project Updates', value: 'projectUpdates' },
  { name: 'Projects', value: 'projects' },
  { name: 'Teams', value: 'teams' },
  { name: 'Users', value: 'users' },
  { name: 'Webhooks', value: 'webhooks' },
  { name: 'Workflow States', value: 'workflowStates' },
];

export const PRIORITY_OPTIONS: INodePropertyOptions[] = [
  { name: 'No Priority', value: 0 },
  { name: 'Urgent', value: 1 },
  { name: 'High', value: 2 },
  { name: 'Medium', value: 3 },
  { name: 'Low', value: 4 },
];

export const PROJECT_STATE_OPTIONS: INodePropertyOptions[] = [
  { name: 'Planned', value: 'planned' },
  { name: 'Backlog', value: 'backlog' },
  { name: 'Started', value: 'started' },
  { name: 'Paused', value: 'paused' },
  { name: 'Completed', value: 'completed' },
  { name: 'Canceled', value: 'canceled' },
];

export const WORKFLOW_STATE_TYPE_OPTIONS: INodePropertyOptions[] = [
  { name: 'Backlog', value: 'backlog' },
  { name: 'Unstarted', value: 'unstarted' },
  { name: 'Started', value: 'started' },
  { name: 'Completed', value: 'completed' },
  { name: 'Canceled', value: 'canceled' },
];

export const HEALTH_OPTIONS: INodePropertyOptions[] = [
  { name: 'On Track', value: 'onTrack' },
  { name: 'At Risk', value: 'atRisk' },
  { name: 'Off Track', value: 'offTrack' },
];

export const RELATION_TYPE_OPTIONS: INodePropertyOptions[] = [
  { name: 'Blocks', value: 'blocks' },
  { name: 'Blocked By', value: 'blocked' },
  { name: 'Related', value: 'related' },
  { name: 'Duplicate', value: 'duplicate' },
];

export const WEBHOOK_RESOURCE_OPTIONS: INodePropertyOptions[] = [
  { name: 'Issue', value: 'Issue' },
  { name: 'Issue Comment', value: 'IssueComment' },
  { name: 'Project', value: 'Project' },
  { name: 'Project Update', value: 'ProjectUpdate' },
  { name: 'Cycle', value: 'Cycle' },
  { name: 'Label', value: 'Label' },
  { name: 'Reaction', value: 'Reaction' },
];

export const TRIGGER_EVENT_OPTIONS: INodePropertyOptions[] = [
  { name: 'Issue Created', value: 'issueCreated' },
  { name: 'Issue Updated', value: 'issueUpdated' },
  { name: 'Issue Deleted', value: 'issueDeleted' },
  { name: 'Comment Created', value: 'issueCommentCreated' },
  { name: 'Comment Updated', value: 'issueCommentUpdated' },
  { name: 'Project Created', value: 'projectCreated' },
  { name: 'Project Updated', value: 'projectUpdated' },
  { name: 'Project Update Created', value: 'projectUpdateCreated' },
  { name: 'Cycle Created', value: 'cycleCreated' },
  { name: 'Cycle Updated', value: 'cycleUpdated' },
  { name: 'Label Created', value: 'labelCreated' },
  { name: 'Reaction Created', value: 'reactionCreated' },
];

// GraphQL fragments for consistent field selection
export const ISSUE_FIELDS = `
  id
  identifier
  title
  description
  priority
  priorityLabel
  estimate
  sortOrder
  number
  url
  branchName
  dueDate
  createdAt
  updatedAt
  archivedAt
  startedAt
  completedAt
  canceledAt
  trashed
  state {
    id
    name
    color
    type
  }
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
  assignee {
    id
    name
    email
  }
  project {
    id
    name
  }
  cycle {
    id
    number
    name
  }
  parent {
    id
    identifier
    title
  }
  labels {
    nodes {
      id
      name
      color
    }
  }
`;

export const COMMENT_FIELDS = `
  id
  body
  createdAt
  updatedAt
  editedAt
  url
  user {
    id
    name
    email
  }
  issue {
    id
    identifier
    title
  }
  parent {
    id
  }
`;

export const PROJECT_FIELDS = `
  id
  name
  description
  icon
  color
  state
  progress
  scope
  startDate
  targetDate
  startedAt
  completedAt
  canceledAt
  sortOrder
  createdAt
  updatedAt
  archivedAt
  url
  lead {
    id
    name
    email
  }
  teams {
    nodes {
      id
      name
      key
    }
  }
`;

export const PROJECT_UPDATE_FIELDS = `
  id
  body
  health
  createdAt
  updatedAt
  editedAt
  user {
    id
    name
    email
  }
  project {
    id
    name
  }
`;

export const PROJECT_MILESTONE_FIELDS = `
  id
  name
  description
  targetDate
  sortOrder
  createdAt
  updatedAt
  archivedAt
  project {
    id
    name
  }
`;

export const CYCLE_FIELDS = `
  id
  number
  name
  description
  startsAt
  endsAt
  completedAt
  progress
  scope
  createdAt
  updatedAt
  archivedAt
  team {
    id
    name
    key
  }
`;

export const TEAM_FIELDS = `
  id
  name
  key
  description
  icon
  color
  private
  timezone
  createdAt
  updatedAt
  archivedAt
`;

export const USER_FIELDS = `
  id
  name
  displayName
  email
  avatarUrl
  active
  admin
  createdAt
  updatedAt
  archivedAt
`;

export const LABEL_FIELDS = `
  id
  name
  description
  color
  createdAt
  updatedAt
  archivedAt
  team {
    id
    name
    key
  }
  parent {
    id
    name
  }
`;

export const WORKFLOW_STATE_FIELDS = `
  id
  name
  color
  description
  position
  type
  createdAt
  updatedAt
  archivedAt
  team {
    id
    name
    key
  }
`;

export const DOCUMENT_FIELDS = `
  id
  title
  content
  icon
  color
  slugId
  sortOrder
  createdAt
  updatedAt
  archivedAt
  creator {
    id
    name
    email
  }
  project {
    id
    name
  }
`;

export const ATTACHMENT_FIELDS = `
  id
  title
  subtitle
  url
  sourceType
  createdAt
  updatedAt
  archivedAt
  issue {
    id
    identifier
    title
  }
  creator {
    id
    name
  }
`;

export const FAVORITE_FIELDS = `
  id
  type
  sortOrder
  createdAt
  updatedAt
  folderName
  owner {
    id
    name
  }
  issue {
    id
    identifier
    title
  }
  project {
    id
    name
  }
  cycle {
    id
    number
    name
  }
  label {
    id
    name
  }
  document {
    id
    title
  }
`;

export const NOTIFICATION_FIELDS = `
  id
  type
  readAt
  emailedAt
  snoozedUntilAt
  createdAt
  updatedAt
  archivedAt
  actor {
    id
    name
  }
  issue {
    id
    identifier
    title
  }
  comment {
    id
    body
  }
  team {
    id
    name
  }
  project {
    id
    name
  }
`;

export const WEBHOOK_FIELDS = `
  id
  label
  url
  enabled
  createdAt
  updatedAt
  archivedAt
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
  }
`;

export const INTEGRATION_FIELDS = `
  id
  service
  createdAt
  updatedAt
  archivedAt
  team {
    id
    name
    key
  }
  creator {
    id
    name
  }
`;

export const REACTION_FIELDS = `
  id
  emoji
  createdAt
  user {
    id
    name
  }
`;

export const ISSUE_RELATION_FIELDS = `
  id
  type
  createdAt
  updatedAt
  issue {
    id
    identifier
    title
  }
  relatedIssue {
    id
    identifier
    title
  }
`;
