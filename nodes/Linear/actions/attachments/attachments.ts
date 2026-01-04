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

const ATTACHMENT_FIELDS = `
  id
  title
  subtitle
  url
  metadata
  source {
    type
    imageUrl
  }
  sourceType
  groupBySource
  createdAt
  updatedAt
  creator {
    id
    name
    email
  }
  issue {
    id
    identifier
    title
  }
`;

export const attachmentsOperations: INodePropertyOptions[] = [
  { name: 'Create Attachment', value: 'createAttachment' },
  { name: 'Delete Attachment', value: 'deleteAttachment' },
  { name: 'Get Attachment', value: 'getAttachment' },
  { name: 'List Attachments', value: 'listAttachments' },
  { name: 'Update Attachment', value: 'updateAttachment' },
];

export const attachmentsFields = [
  // Attachment ID for get/update/delete
  {
    displayName: 'Attachment ID',
    name: 'attachmentId',
    type: 'string' as const,
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['attachments'],
        operation: ['getAttachment', 'updateAttachment', 'deleteAttachment'],
      },
    },
    description: 'The ID of the attachment',
  },

  // Create Attachment
  {
    displayName: 'Issue ID or Identifier',
    name: 'issueId',
    type: 'string' as const,
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['attachments'],
        operation: ['createAttachment', 'listAttachments'],
      },
    },
    description: 'The ID (UUID) or identifier (e.g., ENG-123) of the issue',
  },
  {
    displayName: 'URL',
    name: 'url',
    type: 'string' as const,
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['attachments'],
        operation: ['createAttachment'],
      },
    },
    description: 'The URL of the attachment',
  },
  {
    displayName: 'Title',
    name: 'title',
    type: 'string' as const,
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['attachments'],
        operation: ['createAttachment'],
      },
    },
    description: 'The title of the attachment',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection' as const,
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['attachments'],
        operation: ['createAttachment'],
      },
    },
    options: [
      {
        displayName: 'Icon URL',
        name: 'iconUrl',
        type: 'string' as const,
        default: '',
        description: 'URL for the attachment icon',
      },
      {
        displayName: 'Metadata',
        name: 'metadata',
        type: 'json' as const,
        default: '{}',
        description: 'Additional metadata for the attachment',
      },
      {
        displayName: 'Subtitle',
        name: 'subtitle',
        type: 'string' as const,
        default: '',
        description: 'The subtitle of the attachment',
      },
    ],
  },

  // Update Attachment
  {
    displayName: 'Update Fields',
    name: 'updateFields',
    type: 'collection' as const,
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['attachments'],
        operation: ['updateAttachment'],
      },
    },
    options: [
      {
        displayName: 'Icon URL',
        name: 'iconUrl',
        type: 'string' as const,
        default: '',
        description: 'URL for the attachment icon',
      },
      {
        displayName: 'Metadata',
        name: 'metadata',
        type: 'json' as const,
        default: '{}',
        description: 'Additional metadata for the attachment',
      },
      {
        displayName: 'Subtitle',
        name: 'subtitle',
        type: 'string' as const,
        default: '',
        description: 'The subtitle of the attachment',
      },
      {
        displayName: 'Title',
        name: 'title',
        type: 'string' as const,
        default: '',
        description: 'The title of the attachment',
      },
      {
        displayName: 'URL',
        name: 'url',
        type: 'string' as const,
        default: '',
        description: 'The URL of the attachment',
      },
    ],
  },

  // Pagination
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean' as const,
    default: false,
    displayOptions: {
      show: {
        resource: ['attachments'],
        operation: ['listAttachments'],
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
        resource: ['attachments'],
        operation: ['listAttachments'],
        returnAll: [false],
      },
    },
    description: 'Max number of results to return',
  },
];

export async function executeAttachmentsOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject> {
  let result: IDataObject = {};

  switch (operation) {
    case 'listAttachments':
      result = await listAttachments.call(this, i);
      break;
    case 'getAttachment':
      result = await getAttachment.call(this, i);
      break;
    case 'createAttachment':
      result = await createAttachment.call(this, i);
      break;
    case 'updateAttachment':
      result = await updateAttachment.call(this, i);
      break;
    case 'deleteAttachment':
      result = await deleteAttachment.call(this, i);
      break;
  }

  return result;
}

async function listAttachments(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const issueId = this.getNodeParameter('issueId', i) as string;
  const returnAll = this.getNodeParameter('returnAll', i) as boolean;
  const limit = this.getNodeParameter('limit', i, 50) as number;

  const query = `
    query IssueAttachments($id: String!, $first: Int, $after: String) {
      issue(id: $id) {
        attachments(first: $first, after: $after) {
          nodes {
            ${ATTACHMENT_FIELDS}
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    }
  `;

  const attachments = await linearGraphQLPaginatedRequest.call(
    this,
    query,
    { id: issueId },
    'issue.attachments',
    returnAll,
    limit,
  );

  return { attachments };
}

async function getAttachment(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const attachmentId = this.getNodeParameter('attachmentId', i) as string;

  const query = `
    query Attachment($id: String!) {
      attachment(id: $id) {
        ${ATTACHMENT_FIELDS}
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, query, { id: attachmentId });
  return (response as IDataObject).attachment as IDataObject;
}

async function createAttachment(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const issueId = this.getNodeParameter('issueId', i) as string;
  const url = this.getNodeParameter('url', i) as string;
  const title = this.getNodeParameter('title', i) as string;
  const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

  // Parse metadata if provided
  if (additionalFields.metadata && typeof additionalFields.metadata === 'string') {
    try {
      additionalFields.metadata = JSON.parse(additionalFields.metadata as string);
    } catch {
      // Leave as string if not valid JSON
    }
  }

  const input = cleanObject({
    issueId,
    url,
    title,
    ...additionalFields,
  });

  const mutation = `
    mutation AttachmentCreate($input: AttachmentCreateInput!) {
      attachmentCreate(input: $input) {
        success
        attachment {
          ${ATTACHMENT_FIELDS}
        }
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, mutation, { input });
  return ((response as IDataObject).attachmentCreate as IDataObject).attachment as IDataObject;
}

async function updateAttachment(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const attachmentId = this.getNodeParameter('attachmentId', i) as string;
  const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;

  // Parse metadata if provided
  if (updateFields.metadata && typeof updateFields.metadata === 'string') {
    try {
      updateFields.metadata = JSON.parse(updateFields.metadata as string);
    } catch {
      // Leave as string if not valid JSON
    }
  }

  const input = cleanObject(updateFields);

  const mutation = `
    mutation AttachmentUpdate($id: String!, $input: AttachmentUpdateInput!) {
      attachmentUpdate(id: $id, input: $input) {
        success
        attachment {
          ${ATTACHMENT_FIELDS}
        }
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, mutation, { id: attachmentId, input });
  return ((response as IDataObject).attachmentUpdate as IDataObject).attachment as IDataObject;
}

async function deleteAttachment(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const attachmentId = this.getNodeParameter('attachmentId', i) as string;

  const mutation = `
    mutation AttachmentDelete($id: String!) {
      attachmentDelete(id: $id) {
        success
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, mutation, { id: attachmentId });
  return { success: ((response as IDataObject).attachmentDelete as IDataObject).success };
}
