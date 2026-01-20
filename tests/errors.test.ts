import { describe, it, expect } from 'vitest';
import {
    KodrdrivError,
    PublishError,
    TreeExecutionError,
    ValidationError,
    WorkspaceError,
    formatErrorForMCP,
    extractCommandErrorDetails
} from '../src/errors';

describe('KodrdrivError', () => {
    it('should create error with context', () => {
        const error = new KodrdrivError(
            'Test error',
            {
                operation: 'test',
                phase: 'testing',
                files: ['test.ts']
            }
        );

        expect(error.message).toBe('Test error');
        expect(error.context.operation).toBe('test');
        expect(error.context.phase).toBe('testing');
        expect(error.context.files).toEqual(['test.ts']);
        expect(error.recoverable).toBe(true);
    });

    it('should set recoverable flag', () => {
        const error = new KodrdrivError(
            'Fatal error',
            { operation: 'test' },
            false
        );

        expect(error.recoverable).toBe(false);
    });
});

describe('TreeExecutionError', () => {
    it('should include failed and completed packages', () => {
        const error = new TreeExecutionError(
            'Tree failed',
            { phase: 'execution' },
            ['pkg-d'],
            ['pkg-a', 'pkg-b', 'pkg-c'],
            '/path/to/checkpoint'
        );

        expect(error.context.operation).toBe('tree');
        expect(error.failedPackages).toEqual(['pkg-d']);
        expect(error.completedPackages).toEqual(['pkg-a', 'pkg-b', 'pkg-c']);
        expect(error.checkpointPath).toBe('/path/to/checkpoint');
    });
});

describe('ValidationError', () => {
    it('should include validation errors and warnings', () => {
        const error = new ValidationError(
            'Validation failed',
            { phase: 'pre_flight' },
            [
                {
                    check: 'git_status',
                    message: 'Uncommitted changes',
                    files: ['package.json']
                }
            ],
            [
                {
                    check: 'branch_sync',
                    message: 'Branch not in sync'
                }
            ]
        );

        expect(error.validationErrors).toHaveLength(1);
        expect(error.validationWarnings).toHaveLength(1);
        expect(error.recoverable).toBe(false);
    });
});

describe('formatErrorForMCP', () => {
    it('should format TreeExecutionError with recovery steps', () => {
        const error = new TreeExecutionError(
            'Tree publish failed',
            { phase: 'execution' },
            ['@org/pkg-d'],
            ['@org/pkg-a', '@org/pkg-b'],
            '.kodrdriv-context'
        );

        const formatted = formatErrorForMCP(error);

        expect(formatted.message).toBe('Tree publish failed');
        expect(formatted.context.failedPackages).toEqual(['@org/pkg-d']);
        expect(formatted.context.completedPackages).toEqual(['@org/pkg-a', '@org/pkg-b']);
        expect(formatted.recovery).toBeDefined();
        expect(formatted.recovery).toContain('Fix the issue in: @org/pkg-d');
        expect(formatted.recovery?.some(r => r.includes('--continue'))).toBe(true);
    });

    it('should format ValidationError with detailed errors', () => {
        const error = new ValidationError(
            'Pre-flight validation failed',
            { phase: 'validation' },
            [
                {
                    check: 'git_status',
                    message: 'Uncommitted changes',
                    files: ['package.json', 'src/index.ts']
                },
                {
                    check: 'scripts',
                    message: 'Missing prepublishOnly script'
                }
            ]
        );

        const formatted = formatErrorForMCP(error);

        expect(formatted.message).toBe('Pre-flight validation failed');
        expect(formatted.context.validationErrors).toHaveLength(2);
        expect(formatted.recovery).toBeDefined();
        expect(formatted.recovery?.length).toBeGreaterThan(2);
    });

    it('should format PublishError with command details', () => {
        const error = new PublishError(
            'Publish failed',
            {
                phase: 'npm_publish',
                command: 'npm publish',
                exitCode: 1,
                files: ['package.json']
            }
        );

        const formatted = formatErrorForMCP(error);

        expect(formatted.message).toBe('Publish failed');
        expect(formatted.context.operation).toBe('publish');
        expect(formatted.context.command).toBe('npm publish');
        expect(formatted.context.exitCode).toBe(1);
    });

    it('should handle generic errors gracefully', () => {
        const error = new Error('Generic error');

        const formatted = formatErrorForMCP(error);

        expect(formatted.message).toBe('Generic error');
        expect(formatted.context).toBeDefined();
    });
});

describe('extractCommandErrorDetails', () => {
    it('should extract stdout and stderr', () => {
        const error = {
            message: 'Command failed',
            stdout: 'output text',
            stderr: 'error text',
            code: 1,
            cmd: 'npm test'
        };

        const details = extractCommandErrorDetails(error);

        expect(details.stdout).toBe('output text');
        expect(details.stderr).toBe('error text');
        expect(details.exitCode).toBe(1);
        expect(details.command).toBe('npm test');
    });

    it('should handle missing fields gracefully', () => {
        const error = {
            message: 'Command failed'
        };

        const details = extractCommandErrorDetails(error);

        expect(details.stdout).toBeUndefined();
        expect(details.stderr).toBeUndefined();
        expect(details.exitCode).toBeUndefined();
    });

    it('should convert non-string stdout/stderr to strings', () => {
        const error = {
            stdout: Buffer.from('test'),
            stderr: { toString: () => 'error' }
        };

        const details = extractCommandErrorDetails(error);

        expect(typeof details.stdout).toBe('string');
        expect(typeof details.stderr).toBe('string');
    });
});
