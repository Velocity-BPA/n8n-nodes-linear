/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import * as crypto from 'crypto';
import {
  IExecuteFunctions,
  IHookFunctions,
  ILoadOptionsFunctions,
  IWebhookFunctions,
  IDataObject,
  NodeApiError,
} from 'n8n-workflow';
import { LINEAR_API_URL } from '../constants/constants';
import { LinearGraphQLResponse, LinearGraphQLError } from '../utils/types';

/**
 * Runtime licensing notice - logged once per node load
 */
let hasLoggedLicenseNotice = false;

function logLicensingNotice(): void {
  if (!hasLoggedLicenseNotice) {
    // eslint-disable-next-line no-console
    console.warn(`
[Velocity BPA Licensing Notice]

This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).

Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.

For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.
`);
    hasLoggedLicenseNotice = true;
  }
}

/**
 * Execute a GraphQL query or mutation against the Linear API
 */
export async function linearGraphQLRequest<T = IDataObject>(
  this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions | IWebhookFunctions,
  query: string,
  variables: IDataObject = {},
): Promise<T> {
  logLicensingNotice();

  const credentials = await this.getCredentials('linearApi').catch(async () => {
    return await this.getCredentials('linearOAuth2Api');
  });

  const options = {
    method: 'POST' as const,
    url: LINEAR_API_URL,
    headers: {
      'Content-Type': 'application/json',
      Authorization: credentials.apiKey
        ? String(credentials.apiKey)
        : `Bearer ${credentials.accessToken}`,
    },
    body: {
      query,
      variables,
    },
    json: true,
  };

  try {
    const response = (await this.helpers.request(options)) as LinearGraphQLResponse<T>;

    if (response.errors && response.errors.length > 0) {
      throw new LinearApiError(response.errors, this);
    }

    if (!response.data) {
      throw new NodeApiError(this.getNode(), {
        message: 'No data returned from Linear API',
      });
    }

    return response.data;
  } catch (error: unknown) {
    if (error instanceof NodeApiError) {
      throw error;
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new NodeApiError(this.getNode(), {
      message: `Linear API request failed: ${errorMessage}`,
    });
  }
}

/**
 * Execute a paginated GraphQL query
 */
export async function linearGraphQLPaginatedRequest<T = IDataObject>(
  this: IExecuteFunctions | ILoadOptionsFunctions,
  query: string,
  variables: IDataObject = {},
  dataPath: string,
  returnAll: boolean = false,
  limit: number = 50,
): Promise<T[]> {
  const results: T[] = [];
  let cursor: string | undefined;
  let hasNextPage = true;
  const pageSize = returnAll ? 50 : Math.min(limit, 50);

  while (hasNextPage) {
    const paginatedVariables = {
      ...variables,
      first: pageSize,
      after: cursor,
    };

    const response = await linearGraphQLRequest.call(this, query, paginatedVariables) as IDataObject;

    const data = getNestedValue(response, dataPath) as {
      nodes?: T[];
      pageInfo?: { hasNextPage: boolean; endCursor?: string };
    };

    if (data?.nodes) {
      results.push(...data.nodes);
    }

    hasNextPage = data?.pageInfo?.hasNextPage ?? false;
    cursor = data?.pageInfo?.endCursor;

    if (!returnAll && results.length >= limit) {
      return results.slice(0, limit);
    }
  }

  return results;
}

/**
 * Helper to get nested value from object using dot notation
 */
function getNestedValue(obj: IDataObject, path: string): unknown {
  return path.split('.').reduce((current: unknown, key: string) => {
    if (current && typeof current === 'object' && key in (current as Record<string, unknown>)) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

/**
 * Custom error class for Linear API errors
 */
class LinearApiError extends NodeApiError {
  constructor(
    errors: LinearGraphQLError[],
    context: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions | IWebhookFunctions,
  ) {
    const primaryError = errors[0];
    const message = primaryError.extensions?.userPresentableMessage || primaryError.message;
    const code = primaryError.extensions?.code || 'GRAPHQL_ERROR';

    super(context.getNode(), {
      message: `Linear API Error: ${message}`,
      description: errors.map((e) => e.message).join('; '),
    });

    this.name = 'LinearApiError';
    (this as unknown as Record<string, unknown>).code = code;
  }
}

/**
 * Build a GraphQL filter object from n8n parameters
 */
export function buildGraphQLFilter(params: IDataObject): IDataObject {
  const filter: IDataObject = {};

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') {
      continue;
    }

    switch (key) {
      case 'teamId':
        filter.team = { id: { eq: value } };
        break;
      case 'teamIds':
        filter.team = { id: { in: value } };
        break;
      case 'assigneeId':
        filter.assignee = { id: { eq: value } };
        break;
      case 'creatorId':
        filter.creator = { id: { eq: value } };
        break;
      case 'projectId':
        filter.project = { id: { eq: value } };
        break;
      case 'cycleId':
        filter.cycle = { id: { eq: value } };
        break;
      case 'stateId':
        filter.state = { id: { eq: value } };
        break;
      case 'labelIds':
        filter.labels = { id: { in: value } };
        break;
      case 'priority':
        filter.priority = { eq: value };
        break;
      case 'priorityGte':
        filter.priority = { ...(filter.priority as IDataObject || {}), gte: value };
        break;
      case 'priorityLte':
        filter.priority = { ...(filter.priority as IDataObject || {}), lte: value };
        break;
      case 'createdAfter':
        filter.createdAt = { ...(filter.createdAt as IDataObject || {}), gt: value };
        break;
      case 'createdBefore':
        filter.createdAt = { ...(filter.createdAt as IDataObject || {}), lt: value };
        break;
      case 'updatedAfter':
        filter.updatedAt = { ...(filter.updatedAt as IDataObject || {}), gt: value };
        break;
      case 'updatedBefore':
        filter.updatedAt = { ...(filter.updatedAt as IDataObject || {}), lt: value };
        break;
      case 'searchQuery':
        filter.searchableContent = { contains: value };
        break;
      case 'titleContains':
        filter.title = { containsIgnoreCase: value };
        break;
      case 'includeArchived':
        // Skip - handled separately in query
        break;
      default:
        // Pass through as-is for direct filters
        if (typeof value === 'object') {
          filter[key] = value;
        } else {
          filter[key] = { eq: value };
        }
    }
  }

  return filter;
}

/**
 * Parse issue identifier to extract team key and issue number
 */
export function parseIssueIdentifier(identifier: string): { teamKey: string; issueNumber: number } | null {
  const match = identifier.match(/^([A-Z]+)-(\d+)$/);
  if (!match) {
    return null;
  }
  return {
    teamKey: match[1],
    issueNumber: parseInt(match[2], 10),
  };
}

/**
 * Clean undefined values from an object
 */
export function cleanObject(obj: IDataObject): IDataObject {
  const cleaned: IDataObject = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null && value !== '') {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

/**
 * Format date string for Linear API
 */
export function formatDateForLinear(date: string | Date | number): string {
  const d = typeof date === 'number' ? new Date(date) : (typeof date === 'string' ? new Date(date) : date);
  return d.toISOString();
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
): boolean {
  // Linear uses a simple string comparison for webhook verification
  // The signature is passed in the Linear-Signature header
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  // Check if lengths match first to avoid timing attacks while also
  // handling invalid signatures that don't match the expected format
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  
  if (signatureBuffer.length !== expectedBuffer.length) {
    return false;
  }
  
  return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
}
