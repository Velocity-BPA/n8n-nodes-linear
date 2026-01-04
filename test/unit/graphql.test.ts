/**
 * Unit tests for Linear GraphQL Transport
 *
 * This file is part of n8n-nodes-linear, licensed under the Business Source License 1.1 (BSL 1.1).
 * Copyright (c) 2025 Velocity BPA. All rights reserved.
 */

import { verifyWebhookSignature, parseIssueIdentifier, cleanObject, formatDateForLinear } from '../../nodes/Linear/transport/graphql';

describe('GraphQL Transport Utilities', () => {
	describe('verifyWebhookSignature', () => {
		it('should verify a valid signature', () => {
			const payload = '{"test": "data"}';
			const secret = 'test-secret';
			// Pre-computed HMAC SHA256 signature for the above payload and secret
			const crypto = require('crypto');
			const expectedSignature = crypto
				.createHmac('sha256', secret)
				.update(payload)
				.digest('hex');

			expect(verifyWebhookSignature(payload, expectedSignature, secret)).toBe(true);
		});

		it('should reject an invalid signature', () => {
			const payload = '{"test": "data"}';
			const secret = 'test-secret';
			const invalidSignature = 'invalid-signature';

			expect(verifyWebhookSignature(payload, invalidSignature, secret)).toBe(false);
		});

		it('should reject when payload has been tampered', () => {
			const originalPayload = '{"test": "data"}';
			const tamperedPayload = '{"test": "tampered"}';
			const secret = 'test-secret';
			const crypto = require('crypto');
			const signature = crypto
				.createHmac('sha256', secret)
				.update(originalPayload)
				.digest('hex');

			expect(verifyWebhookSignature(tamperedPayload, signature, secret)).toBe(false);
		});
	});

	describe('parseIssueIdentifier', () => {
		it('should parse a valid issue identifier', () => {
			const result = parseIssueIdentifier('ENG-123');
			expect(result).toEqual({ teamKey: 'ENG', issueNumber: 123 });
		});

		it('should parse identifier with uppercase team key only', () => {
			// Note: parseIssueIdentifier only accepts uppercase team keys
			const result = parseIssueIdentifier('eng-456');
			expect(result).toBeNull();
		});

		it('should return null for invalid identifier format', () => {
			expect(parseIssueIdentifier('invalid')).toBeNull();
			expect(parseIssueIdentifier('123')).toBeNull();
			expect(parseIssueIdentifier('ENG')).toBeNull();
			expect(parseIssueIdentifier('')).toBeNull();
		});

		it('should handle UUIDs by returning null', () => {
			const uuid = '550e8400-e29b-41d4-a716-446655440000';
			expect(parseIssueIdentifier(uuid)).toBeNull();
		});
	});

	describe('cleanObject', () => {
		it('should remove undefined values', () => {
			const input = {
				a: 1,
				b: undefined,
				c: 'hello',
			};
			const result = cleanObject(input);
			expect(result).toEqual({ a: 1, c: 'hello' });
		});

		it('should remove null values', () => {
			const input = {
				a: 1,
				b: null,
				c: 'hello',
			};
			const result = cleanObject(input);
			expect(result).toEqual({ a: 1, c: 'hello' });
		});

		it('should remove empty strings', () => {
			const input = {
				a: 1,
				b: '',
				c: 'hello',
			};
			const result = cleanObject(input);
			expect(result).toEqual({ a: 1, c: 'hello' });
		});

		it('should keep falsy values like 0 and false', () => {
			const input = {
				a: 0,
				b: false,
				c: 'hello',
			};
			const result = cleanObject(input);
			expect(result).toEqual({ a: 0, b: false, c: 'hello' });
		});

		it('should handle empty objects', () => {
			const result = cleanObject({});
			expect(result).toEqual({});
		});

		it('should handle objects with only empty values', () => {
			const input = {
				a: undefined,
				b: null,
				c: '',
			};
			const result = cleanObject(input);
			expect(result).toEqual({});
		});
	});

	describe('formatDateForLinear', () => {
		it('should format Date object to ISO string', () => {
			const date = new Date('2024-01-15T10:30:00Z');
			const result = formatDateForLinear(date);
			expect(result).toBe('2024-01-15T10:30:00.000Z');
		});

		it('should format date string to ISO string', () => {
			const result = formatDateForLinear('2024-01-15');
			expect(result).toContain('2024-01-15');
		});

		it('should handle timestamp numbers', () => {
			const timestamp = new Date('2024-01-15T10:30:00Z').getTime();
			const result = formatDateForLinear(timestamp);
			expect(result).toBe('2024-01-15T10:30:00.000Z');
		});

		it('should handle ISO string input', () => {
			const isoString = '2024-01-15T10:30:00.000Z';
			const result = formatDateForLinear(isoString);
			expect(result).toBe('2024-01-15T10:30:00.000Z');
		});
	});
});

describe('GraphQL Constants', () => {
	it('should have LINEAR_API_URL defined', () => {
		const { LINEAR_API_URL } = require('../../nodes/Linear/constants/constants');
		expect(LINEAR_API_URL).toBe('https://api.linear.app/graphql');
	});

	it('should have priority options defined', () => {
		const { PRIORITY_OPTIONS } = require('../../nodes/Linear/constants/constants');
		expect(PRIORITY_OPTIONS).toBeInstanceOf(Array);
		expect(PRIORITY_OPTIONS.length).toBeGreaterThan(0);
	});

	it('should have issue fields defined', () => {
		const { ISSUE_FIELDS } = require('../../nodes/Linear/constants/constants');
		expect(typeof ISSUE_FIELDS).toBe('string');
		expect(ISSUE_FIELDS).toContain('id');
		expect(ISSUE_FIELDS).toContain('title');
	});
});
