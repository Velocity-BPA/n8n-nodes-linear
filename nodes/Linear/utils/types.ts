/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IDataObject } from 'n8n-workflow';

// Base types
export interface LinearGraphQLResponse<T = IDataObject> {
  data?: T;
  errors?: LinearGraphQLError[];
}

export interface LinearGraphQLError {
  message: string;
  locations?: Array<{ line: number; column: number }>;
  path?: string[];
  extensions?: {
    code?: string;
    userPresentableMessage?: string;
  };
}

export interface LinearPageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
  endCursor?: string;
}

export interface LinearConnection<T> {
  nodes: T[];
  pageInfo: LinearPageInfo;
}

// Entity types
export interface LinearUser {
  id: string;
  name: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  active: boolean;
  admin: boolean;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
}

export interface LinearTeam {
  id: string;
  name: string;
  key: string;
  description?: string;
  icon?: string;
  color?: string;
  private: boolean;
  timezone: string;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
}

export interface LinearIssue {
  id: string;
  identifier: string;
  title: string;
  description?: string;
  descriptionData?: string;
  priority: number;
  priorityLabel: string;
  estimate?: number;
  sortOrder: number;
  startedAt?: string;
  completedAt?: string;
  canceledAt?: string;
  autoClosedAt?: string;
  autoArchivedAt?: string;
  dueDate?: string;
  trashed?: boolean;
  snoozedUntilAt?: string;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
  number: number;
  url: string;
  branchName: string;
  customerTicketCount: number;
  state?: LinearWorkflowState;
  team?: LinearTeam;
  creator?: LinearUser;
  assignee?: LinearUser;
  project?: LinearProject;
  cycle?: LinearCycle;
  parent?: LinearIssue;
  labels?: LinearConnection<LinearLabel>;
  children?: LinearConnection<LinearIssue>;
  comments?: LinearConnection<LinearComment>;
  attachments?: LinearConnection<LinearAttachment>;
  subscribers?: LinearConnection<LinearUser>;
  relations?: LinearConnection<LinearIssueRelation>;
}

export interface LinearProject {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  state: string;
  progress: number;
  scope: number;
  slackNewIssue: boolean;
  slackIssueComments: boolean;
  slackIssueStatuses: boolean;
  startDate?: string;
  targetDate?: string;
  startedAt?: string;
  completedAt?: string;
  canceledAt?: string;
  sortOrder: number;
  issueCountHistory: number[];
  completedIssueCountHistory: number[];
  scopeHistory: number[];
  completedScopeHistory: number[];
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
  url: string;
  teams?: LinearConnection<LinearTeam>;
  members?: LinearConnection<LinearUser>;
  issues?: LinearConnection<LinearIssue>;
  projectUpdates?: LinearConnection<LinearProjectUpdate>;
  projectMilestones?: LinearConnection<LinearProjectMilestone>;
  lead?: LinearUser;
}

export interface LinearProjectUpdate {
  id: string;
  body: string;
  health: string;
  createdAt: string;
  updatedAt: string;
  editedAt?: string;
  user?: LinearUser;
  project?: LinearProject;
}

export interface LinearProjectMilestone {
  id: string;
  name: string;
  description?: string;
  targetDate?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
  project?: LinearProject;
}

export interface LinearCycle {
  id: string;
  number: number;
  name?: string;
  description?: string;
  startsAt: string;
  endsAt: string;
  completedAt?: string;
  autoArchivedAt?: string;
  progress: number;
  scope: number;
  issueCountHistory: number[];
  completedIssueCountHistory: number[];
  scopeHistory: number[];
  completedScopeHistory: number[];
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
  team?: LinearTeam;
  issues?: LinearConnection<LinearIssue>;
}

export interface LinearComment {
  id: string;
  body: string;
  bodyData: string;
  createdAt: string;
  updatedAt: string;
  editedAt?: string;
  archivedAt?: string;
  url: string;
  user?: LinearUser;
  issue?: LinearIssue;
  parent?: LinearComment;
  children?: LinearConnection<LinearComment>;
  reactions?: LinearConnection<LinearReaction>;
}

export interface LinearReaction {
  id: string;
  emoji: string;
  createdAt: string;
  user?: LinearUser;
  comment?: LinearComment;
}

export interface LinearLabel {
  id: string;
  name: string;
  description?: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
  team?: LinearTeam;
  parent?: LinearLabel;
  children?: LinearConnection<LinearLabel>;
  issues?: LinearConnection<LinearIssue>;
}

export interface LinearWorkflowState {
  id: string;
  name: string;
  color: string;
  description?: string;
  position: number;
  type: 'backlog' | 'unstarted' | 'started' | 'completed' | 'canceled';
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
  team?: LinearTeam;
  issues?: LinearConnection<LinearIssue>;
}

export interface LinearDocument {
  id: string;
  title: string;
  content?: string;
  contentData?: string;
  icon?: string;
  color?: string;
  slugId: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
  creator?: LinearUser;
  updatedBy?: LinearUser;
  project?: LinearProject;
}

export interface LinearAttachment {
  id: string;
  title: string;
  subtitle?: string;
  url: string;
  metadata?: IDataObject;
  source?: IDataObject;
  sourceType?: string;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
  issue?: LinearIssue;
  creator?: LinearUser;
}

export interface LinearFavorite {
  id: string;
  type: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  folderName?: string;
  owner?: LinearUser;
  issue?: LinearIssue;
  project?: LinearProject;
  cycle?: LinearCycle;
  label?: LinearLabel;
  user?: LinearUser;
  document?: LinearDocument;
}

export interface LinearNotification {
  id: string;
  type: string;
  readAt?: string;
  emailedAt?: string;
  snoozedUntilAt?: string;
  unsnoozedAt?: string;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
  actor?: LinearUser;
  user?: LinearUser;
  issue?: LinearIssue;
  comment?: LinearComment;
  team?: LinearTeam;
  project?: LinearProject;
}

export interface LinearWebhook {
  id: string;
  label?: string;
  url: string;
  enabled: boolean;
  secret?: string;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
  team?: LinearTeam;
  creator?: LinearUser;
  resourceTypes: string[];
  allPublicTeams: boolean;
}

export interface LinearIntegration {
  id: string;
  service: string;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
  team?: LinearTeam;
  creator?: LinearUser;
}

export interface LinearIssueRelation {
  id: string;
  type: 'blocks' | 'blocked' | 'related' | 'duplicate';
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
  issue?: LinearIssue;
  relatedIssue?: LinearIssue;
}

// Webhook payload types
export interface LinearWebhookPayload {
  action: 'create' | 'update' | 'remove';
  type: string;
  createdAt: string;
  data: IDataObject;
  url?: string;
  organizationId: string;
  webhookId: string;
  webhookTimestamp: number;
}

// Operation input types
export interface CreateIssueInput {
  teamId: string;
  title: string;
  description?: string;
  priority?: number;
  estimate?: number;
  assigneeId?: string;
  stateId?: string;
  projectId?: string;
  cycleId?: string;
  parentId?: string;
  labelIds?: string[];
  dueDate?: string;
  subscriberIds?: string[];
}

export interface UpdateIssueInput {
  id: string;
  title?: string;
  description?: string;
  priority?: number;
  estimate?: number;
  assigneeId?: string | null;
  stateId?: string;
  projectId?: string | null;
  cycleId?: string | null;
  parentId?: string | null;
  labelIds?: string[];
  dueDate?: string | null;
  teamId?: string;
  subscriberIds?: string[];
}

export interface CreateCommentInput {
  issueId: string;
  body: string;
  parentId?: string;
}

export interface UpdateCommentInput {
  id: string;
  body: string;
}

export interface CreateProjectInput {
  teamIds: string[];
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  state?: string;
  leadId?: string;
  memberIds?: string[];
  startDate?: string;
  targetDate?: string;
}

export interface UpdateProjectInput {
  id: string;
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
  state?: string;
  leadId?: string | null;
  memberIds?: string[];
  startDate?: string | null;
  targetDate?: string | null;
}

export interface CreateCycleInput {
  teamId: string;
  name?: string;
  description?: string;
  startsAt: string;
  endsAt: string;
}

export interface UpdateCycleInput {
  id: string;
  name?: string;
  description?: string;
  startsAt?: string;
  endsAt?: string;
  completedAt?: string;
}

export interface CreateTeamInput {
  name: string;
  key: string;
  description?: string;
  icon?: string;
  color?: string;
  timezone?: string;
  private?: boolean;
}

export interface UpdateTeamInput {
  id: string;
  name?: string;
  key?: string;
  description?: string;
  icon?: string;
  color?: string;
  timezone?: string;
  private?: boolean;
}

export interface CreateLabelInput {
  teamId?: string;
  name: string;
  description?: string;
  color?: string;
  parentId?: string;
}

export interface UpdateLabelInput {
  id: string;
  name?: string;
  description?: string;
  color?: string;
  parentId?: string | null;
}

export interface CreateWorkflowStateInput {
  teamId: string;
  name: string;
  type: 'backlog' | 'unstarted' | 'started' | 'completed' | 'canceled';
  color?: string;
  description?: string;
  position?: number;
}

export interface UpdateWorkflowStateInput {
  id: string;
  name?: string;
  color?: string;
  description?: string;
  position?: number;
}

export interface CreateDocumentInput {
  projectId?: string;
  title: string;
  content?: string;
  icon?: string;
  color?: string;
}

export interface UpdateDocumentInput {
  id: string;
  title?: string;
  content?: string;
  icon?: string;
  color?: string;
  projectId?: string | null;
}

export interface CreateAttachmentInput {
  issueId: string;
  title: string;
  subtitle?: string;
  url: string;
  metadata?: IDataObject;
  iconUrl?: string;
}

export interface UpdateAttachmentInput {
  id: string;
  title?: string;
  subtitle?: string;
  url?: string;
  metadata?: IDataObject;
  iconUrl?: string;
}

export interface CreateWebhookInput {
  teamId?: string;
  url: string;
  label?: string;
  resourceTypes: string[];
  enabled?: boolean;
  allPublicTeams?: boolean;
  secret?: string;
}

export interface UpdateWebhookInput {
  id: string;
  url?: string;
  label?: string;
  resourceTypes?: string[];
  enabled?: boolean;
}

export interface CreateProjectUpdateInput {
  projectId: string;
  body: string;
  health?: 'onTrack' | 'atRisk' | 'offTrack';
}

export interface UpdateProjectUpdateInput {
  id: string;
  body?: string;
  health?: 'onTrack' | 'atRisk' | 'offTrack';
}

export interface CreateProjectMilestoneInput {
  projectId: string;
  name: string;
  description?: string;
  targetDate?: string;
  sortOrder?: number;
}

// Pagination types
export interface PaginationParams {
  first?: number;
  after?: string;
  last?: number;
  before?: string;
}

// Filter types
export interface IssueFilter {
  id?: { eq?: string; in?: string[] };
  title?: { contains?: string; containsIgnoreCase?: string };
  priority?: { eq?: number; in?: number[]; gte?: number; lte?: number };
  state?: { id?: { eq?: string; in?: string[] }; name?: { eq?: string } };
  team?: { id?: { eq?: string; in?: string[] } };
  assignee?: { id?: { eq?: string; in?: string[] }; isMe?: { eq?: boolean } };
  project?: { id?: { eq?: string; in?: string[] } };
  cycle?: { id?: { eq?: string; in?: string[] } };
  labels?: { id?: { in?: string[] }; name?: { in?: string[] } };
  createdAt?: { gt?: string; lt?: string; gte?: string; lte?: string };
  updatedAt?: { gt?: string; lt?: string; gte?: string; lte?: string };
  completedAt?: { gt?: string; lt?: string; gte?: string; lte?: string; null?: boolean };
  canceledAt?: { null?: boolean };
  dueDate?: { gt?: string; lt?: string; gte?: string; lte?: string; null?: boolean };
  searchableContent?: { contains?: string };
  hasBlockedByRelations?: { eq?: boolean };
  hasBlockingRelations?: { eq?: boolean };
  hasRelatedRelations?: { eq?: boolean };
  hasDuplicateRelations?: { eq?: boolean };
  parent?: { id?: { eq?: string }; null?: boolean };
}

// Resources enum
export type LinearResource =
  | 'issues'
  | 'comments'
  | 'projects'
  | 'projectUpdates'
  | 'cycles'
  | 'teams'
  | 'users'
  | 'labels'
  | 'workflowStates'
  | 'integrations'
  | 'documents'
  | 'attachments'
  | 'favorites'
  | 'notifications'
  | 'webhooks';

// Priority constants
export const PRIORITY_VALUES = {
  NO_PRIORITY: 0,
  URGENT: 1,
  HIGH: 2,
  MEDIUM: 3,
  LOW: 4,
} as const;

export const PRIORITY_LABELS: Record<number, string> = {
  0: 'No Priority',
  1: 'Urgent',
  2: 'High',
  3: 'Medium',
  4: 'Low',
};

// Workflow state types
export const WORKFLOW_STATE_TYPES = [
  'backlog',
  'unstarted',
  'started',
  'completed',
  'canceled',
] as const;

// Project states
export const PROJECT_STATES = [
  'planned',
  'backlog',
  'started',
  'paused',
  'completed',
  'canceled',
] as const;

// Health states
export const HEALTH_STATES = ['onTrack', 'atRisk', 'offTrack'] as const;

// Webhook resource types
export const WEBHOOK_RESOURCE_TYPES = [
  'Issue',
  'IssueComment',
  'Project',
  'ProjectUpdate',
  'Cycle',
  'Label',
  'Reaction',
] as const;

// Relation types
export const RELATION_TYPES = ['blocks', 'blocked', 'related', 'duplicate'] as const;
