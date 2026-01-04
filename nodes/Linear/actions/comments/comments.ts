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
} from '../../transport/graphql';
import { COMMENT_FIELDS, REACTION_FIELDS } from '../../constants/constants';

export const commentsOperations: INodePropertyOptions[] = [
  { name: 'Create Comment', value: 'createComment' },
  { name: 'Create Reaction', value: 'createReaction' },
  { name: 'Delete Comment', value: 'deleteComment' },
  { name: 'Delete Reaction', value: 'deleteReaction' },
  { name: 'Get Comment', value: 'getComment' },
  { name: 'List Comments', value: 'listComments' },
  { name: 'Update Comment', value: 'updateComment' },
];

export const commentsFields = [
  // Issue ID for listing/creating comments
  {
    displayName: 'Issue ID or Identifier',
    name: 'issueId',
    type: 'string' as const,
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['comments'],
        operation: ['listComments', 'createComment'],
      },
    },
    description: 'The ID (UUID) or identifier (e.g., ENG-123) of the issue',
  },

  // Comment ID for get/update/delete
  {
    displayName: 'Comment ID',
    name: 'commentId',
    type: 'string' as const,
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['comments'],
        operation: ['getComment', 'updateComment', 'deleteComment', 'createReaction', 'deleteReaction'],
      },
    },
    description: 'The ID of the comment',
  },

  // Create Comment
  {
    displayName: 'Body',
    name: 'body',
    type: 'string' as const,
    typeOptions: {
      rows: 4,
    },
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['comments'],
        operation: ['createComment'],
      },
    },
    description: 'The content of the comment (Markdown supported)',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection' as const,
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['comments'],
        operation: ['createComment'],
      },
    },
    options: [
      {
        displayName: 'Parent Comment ID',
        name: 'parentId',
        type: 'string' as const,
        default: '',
        description: 'The ID of the parent comment for threading',
      },
    ],
  },

  // Update Comment
  {
    displayName: 'Body',
    name: 'body',
    type: 'string' as const,
    typeOptions: {
      rows: 4,
    },
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['comments'],
        operation: ['updateComment'],
      },
    },
    description: 'The new content of the comment',
  },

  // List Comments pagination
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean' as const,
    default: false,
    displayOptions: {
      show: {
        resource: ['comments'],
        operation: ['listComments'],
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
        resource: ['comments'],
        operation: ['listComments'],
        returnAll: [false],
      },
    },
    description: 'Max number of results to return',
  },

  // Reactions
  {
    displayName: 'Emoji',
    name: 'emoji',
    type: 'string' as const,
    default: '👍',
    required: true,
    displayOptions: {
      show: {
        resource: ['comments'],
        operation: ['createReaction'],
      },
    },
    description: 'The emoji to use for the reaction',
  },
  {
    displayName: 'Reaction ID',
    name: 'reactionId',
    type: 'string' as const,
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['comments'],
        operation: ['deleteReaction'],
      },
    },
    description: 'The ID of the reaction to delete',
  },
];

export async function executeCommentsOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject> {
  let result: IDataObject = {};

  switch (operation) {
    case 'listComments':
      result = await listComments.call(this, i);
      break;
    case 'getComment':
      result = await getComment.call(this, i);
      break;
    case 'createComment':
      result = await createComment.call(this, i);
      break;
    case 'updateComment':
      result = await updateComment.call(this, i);
      break;
    case 'deleteComment':
      result = await deleteComment.call(this, i);
      break;
    case 'createReaction':
      result = await createReaction.call(this, i);
      break;
    case 'deleteReaction':
      result = await deleteReaction.call(this, i);
      break;
  }

  return result;
}

async function listComments(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const issueId = this.getNodeParameter('issueId', i) as string;
  const returnAll = this.getNodeParameter('returnAll', i) as boolean;
  const limit = this.getNodeParameter('limit', i, 50) as number;

  const query = `
    query IssueComments($issueId: String!, $first: Int, $after: String) {
      issue(id: $issueId) {
        comments(first: $first, after: $after) {
          nodes {
            ${COMMENT_FIELDS}
            reactions {
              nodes {
                ${REACTION_FIELDS}
              }
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    }
  `;

  const comments = await linearGraphQLPaginatedRequest.call(
    this,
    query,
    { issueId },
    'issue.comments',
    returnAll,
    limit,
  );

  return { comments };
}

async function getComment(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const commentId = this.getNodeParameter('commentId', i) as string;

  const query = `
    query Comment($id: String!) {
      comment(id: $id) {
        ${COMMENT_FIELDS}
        reactions {
          nodes {
            ${REACTION_FIELDS}
          }
        }
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, query, { id: commentId });
  return (response as IDataObject).comment as IDataObject;
}

async function createComment(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const issueId = this.getNodeParameter('issueId', i) as string;
  const body = this.getNodeParameter('body', i) as string;
  const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

  const input: IDataObject = {
    issueId,
    body,
  };

  if (additionalFields.parentId) {
    input.parentId = additionalFields.parentId;
  }

  const mutation = `
    mutation CommentCreate($input: CommentCreateInput!) {
      commentCreate(input: $input) {
        success
        comment {
          ${COMMENT_FIELDS}
        }
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, mutation, { input });
  return ((response as IDataObject).commentCreate as IDataObject).comment as IDataObject;
}

async function updateComment(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const commentId = this.getNodeParameter('commentId', i) as string;
  const body = this.getNodeParameter('body', i) as string;

  const mutation = `
    mutation CommentUpdate($id: String!, $input: CommentUpdateInput!) {
      commentUpdate(id: $id, input: $input) {
        success
        comment {
          ${COMMENT_FIELDS}
        }
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, mutation, { 
    id: commentId, 
    input: { body } 
  });
  return ((response as IDataObject).commentUpdate as IDataObject).comment as IDataObject;
}

async function deleteComment(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const commentId = this.getNodeParameter('commentId', i) as string;

  const mutation = `
    mutation CommentDelete($id: String!) {
      commentDelete(id: $id) {
        success
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, mutation, { id: commentId });
  return { success: ((response as IDataObject).commentDelete as IDataObject).success };
}

async function createReaction(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const commentId = this.getNodeParameter('commentId', i) as string;
  const emoji = this.getNodeParameter('emoji', i) as string;

  const mutation = `
    mutation ReactionCreate($input: ReactionCreateInput!) {
      reactionCreate(input: $input) {
        success
        reaction {
          ${REACTION_FIELDS}
        }
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, mutation, { 
    input: { 
      commentId, 
      emoji 
    } 
  });
  return ((response as IDataObject).reactionCreate as IDataObject).reaction as IDataObject;
}

async function deleteReaction(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const reactionId = this.getNodeParameter('reactionId', i) as string;

  const mutation = `
    mutation ReactionDelete($id: String!) {
      reactionDelete(id: $id) {
        success
      }
    }
  `;

  const response = await linearGraphQLRequest.call(this, mutation, { id: reactionId });
  return { success: ((response as IDataObject).reactionDelete as IDataObject).success };
}
