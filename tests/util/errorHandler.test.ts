import { describe, it, expect, vi } from 'vitest';
import {
    createSuccessResult,
    createErrorResult,
} from '../../src/util/errorHandler';
import { CommandError } from '@eldrforge/shared';

// Mock @eldrforge/shared
vi.mock('@eldrforge/shared', async () => {
    const actual = await vi.importActual('@eldrforge/shared');
    return {
        ...actual,
        CommandError: class CommandError extends Error {
            public readonly code: string;
            public readonly recoverable: boolean;
            public readonly originalCause?: Error;

            constructor(
                message: string,
                code: string,
                recoverable: boolean = false,
                cause?: Error
            ) {
                super(message);
                this.name = 'CommandError';
                this.code = code;
                this.recoverable = recoverable;
                this.originalCause = cause;
                if (cause) {
                    (this as any).cause = cause;
                }
            }
        },
        UserCancellationError: class UserCancellationError extends Error {
            constructor(message: string = 'Operation cancelled by user') {
                super(message);
                this.name = 'UserCancellationError';
            }
        },
        PullRequestCheckError: class PullRequestCheckError extends Error {
            constructor(message: string) {
                super(message);
                this.name = 'PullRequestCheckError';
            }
        },
    };
});

describe('errorHandler utilities', () => {
    describe('createSuccessResult', () => {
        it('should create a success result with data', () => {
            const result = createSuccessResult('test data');

            expect(result.success).toBe(true);
            expect(result.data).toBe('test data');
            expect(result.error).toBeUndefined();
            expect(result.warnings).toBeUndefined();
        });

        it('should create a success result with complex data', () => {
            const data = { foo: 'bar', count: 42 };
            const result = createSuccessResult(data);

            expect(result.success).toBe(true);
            expect(result.data).toEqual(data);
        });

        it('should include warnings when provided', () => {
            const warnings = ['Warning 1', 'Warning 2'];
            const result = createSuccessResult('data', warnings);

            expect(result.success).toBe(true);
            expect(result.data).toBe('data');
            expect(result.warnings).toEqual(warnings);
        });

        it('should handle undefined warnings', () => {
            const result = createSuccessResult('data', undefined);

            expect(result.success).toBe(true);
            expect(result.warnings).toBeUndefined();
        });

        it('should handle null data', () => {
            const result = createSuccessResult(null);

            expect(result.success).toBe(true);
            expect(result.data).toBeNull();
        });
    });

    describe('createErrorResult', () => {
        it('should create an error result', () => {
            const error = new CommandError('Test error', 'TEST_ERROR');
            const result = createErrorResult(error);

            expect(result.success).toBe(false);
            expect(result.error).toBe(error);
            expect(result.data).toBeUndefined();
        });

        it('should include warnings when provided', () => {
            const error = new CommandError('Test error', 'TEST_ERROR');
            const warnings = ['Warning during failure'];
            const result = createErrorResult(error, warnings);

            expect(result.success).toBe(false);
            expect(result.error).toBe(error);
            expect(result.warnings).toEqual(warnings);
        });

        it('should preserve error properties', () => {
            const error = new CommandError('Test error', 'TEST_CODE', true);
            const result = createErrorResult(error);

            expect(result.success).toBe(false);
            expect(result.error?.message).toBe('Test error');
            expect((result.error as any)?.recoverable).toBe(true);
            expect((result.error as any)?.code).toBe('TEST_CODE');
        });
    });
});
