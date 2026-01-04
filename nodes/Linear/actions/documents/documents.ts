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

const DOCUMENT_FIELDS = `
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

export const documentsOperations: INodePropertyOptions[] = [
  { name: 'Create Document', value: 'createDocument' },
  { name: 'Delete Document', value: 'deleteDocument' },
  { name: 'Get Document', value: 'getDocument' },
  { name: 'List Documents', value: 'listDocuments' },
  { name: 'Update Document', value: 'updateDocument' },
];

export const documentsFields = [
  // Document ID for get/update/delete
  {
    displayName: 'Document ID',
    name: 'documentId',
    type: 'string' as const,
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['documents'],
        operation: ['getDocument', 'updateDocument', 'deleteDocument'],
      },
    },
    description: 'The ID of the document',
  },

  // Create Document
  {
    displayName: 'Project',
    name: 'projectId',
    type: 'options' as const,
    typeOptions: {
      loadOptionsMethod: 'getProjects',
    },
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['documents'],
        operation: ['createDocument'],
      },
    },
    description: 'The project to create the document in',
  },
  {
    displayName: 'Title',
    name: 'title',
    type: 'string' as const,
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['documents'],
        operation: ['createDocument'],
      },
    },
    description: 'The title of the document',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection' as const,
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['documents'],
        operation: ['createDocument'],
      },
    },
    options: [
      {
        displayName: 'Color',
        name: 'color',
        type: 'string' as const,
        default: '',
        description: 'The document color',
      },
      {
        displayName: 'Content',
        name: 'content',
        type: 'string' as const,
        typeOptions: {
          rows: 6,
        },
        default: '',
        description: 'The content of the document (Markdown)',
      },
      {
        displayName: 'Icon',
        name: 'icon',
        type: 'string' as const,
        default: '',
        description: 'The document icon',
      },
    ],
  },

  // Update Document
  {
    displayName: 'Update Fields',
    name: 'updateFields',
    type: 'collection' as const,
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['documents'],
        operation: ['updateDocument'],
      },
    },
    options: [
      {
        displayName: 'Color',
        name: 'color',
        type: 'string' as const,
        default: '',
        description: 'The document color',
      },
      {
        displayName: 'Content',
        name: 'content',
        type: 'string' as const,
        typeOptions: {
          rows: 6,
        },
        default: '',
        description: 'The content of the document (Markdown)',
      },
      {
        displayName: 'Icon',
        name: 'icon',
        type: 'string' as const,
        default: '',
        description: 'The document icon',
      },
      {
        displayName: 'Title',
        name: 'title',
        type: 'string' as const,
        default: '',
        description: 'The title of the document',
      },
    ],
  },

  // List filters
  {
    displayName: 'Project',
    name: 'projectId',
    type: 'options' as const,
    typeOptions: {
      loadOptionsMethod: 'getProjects',
    },
    default: '',
    displayOptions: {
      show: {
        resource: ['documents'],
        operation: ['listDocuments'],
      },
    },
    description: 'Filter documents by project (optional)',
  },

  // Pagination
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean' as const,
    default: false,
    displayOptions: {
      show: {
        resource: ['documents'],
        operation: ['listDocuments'],
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
        resource: ['documents'],
        operation: ['listDocuments'],
        returnAll: [false],
      },
    },
    description: 'Max number of results to return',
  },
];

export async function executeDocumentsOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject> {
  let result: IDataObject = {};

  switch (operation) {
    case 'listDocuments':
      result = await listDocuments.call(this, i);
      break;
    case 'getDocument':
      result = await getDocument.call(this, i);
      break;
    case 'createDocument':
      result = await createDocument.call(this, i);
      break;
    case 'updateDocument':
      result = await updateDocument.call(this, i);
      break;
    case 'deleteDocument':
      result = await deleteDocument.call(this, i);
      break;
  }

  return result;
}

async function listDocuments(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const projectId = this.getNodeParameter('projectId', i, '') as string;
  const returnAll = this.getNodeParameter('returnAll', i) as boolean;
  const limit = this.getNodeParameter('limit', i, 50) as number;

  // If project specified, get project documents
  if (projectId) {
    const query = `
      query ProjectDocuments($id: String!, $first: Int, $after: String) {
        project(id: $id) {
          documents(first: $first, after: $after) {
            nodes {
              ${DOCUMENT_FIELDS}
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      }
    `;

    const documents = await linearGraphQLPaginatedRequest.call(
      this,
      query,
      { id: projectId },
      'project.documents',
      returnAll,
      limit,
    );

    return { documents };
  }

  // Get all documents
  const query = `
    query Documents($first: Int, $after: String) {
      documents(first: $first, after: $after) {
        nodes {
          ${DOCUMENT_FIELDS}
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;

  const documents = await linearGraphQLPaginatedRequest.call(
    this,
    query,
    {},
    'documents',
    returnAll,
    limit,
  );

  return { documents };
}

async function getDocument(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const documentId = this.getNodeParameter('documentId', i) as string;

  const query = `
    query Document($id: String!) {
      document(id: $id) {
        ${DOCUMENT_FIELDS}
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, query, { id: documentId });
  return (response as IDataObject).document as IDataObject;
}

async function createDocument(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const projectId = this.getNodeParameter('projectId', i) as string;
  const title = this.getNodeParameter('title', i) as string;
  const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

  const input = cleanObject({
    projectId,
    title,
    ...additionalFields,
  });

  const mutation = `
    mutation DocumentCreate($input: DocumentCreateInput!) {
      documentCreate(input: $input) {
        success
        document {
          ${DOCUMENT_FIELDS}
        }
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, mutation, { input });
  return ((response as IDataObject).documentCreate as IDataObject).document as IDataObject;
}

async function updateDocument(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const documentId = this.getNodeParameter('documentId', i) as string;
  const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;

  const input = cleanObject(updateFields);

  const mutation = `
    mutation DocumentUpdate($id: String!, $input: DocumentUpdateInput!) {
      documentUpdate(id: $id, input: $input) {
        success
        document {
          ${DOCUMENT_FIELDS}
        }
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, mutation, { id: documentId, input });
  return ((response as IDataObject).documentUpdate as IDataObject).document as IDataObject;
}

async function deleteDocument(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const documentId = this.getNodeParameter('documentId', i) as string;

  const mutation = `
    mutation DocumentDelete($id: String!) {
      documentDelete(id: $id) {
        success
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, mutation, { id: documentId });
  return { success: ((response as IDataObject).documentDelete as IDataObject).success };
}
