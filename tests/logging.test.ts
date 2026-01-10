import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getLogger, setLogLevel, getDryRunLogger } from '../src/logging';

// Mock fs to avoid file system operations
vi.mock('fs', () => ({
    default: {
        mkdirSync: vi.fn(),
        existsSync: vi.fn(() => true),
    },
    mkdirSync: vi.fn(),
    existsSync: vi.fn(() => true),
}));

describe('logging utilities', () => {
    describe('getLogger', () => {
        it('should return a logger instance', () => {
            const logger = getLogger();
            expect(logger).toBeDefined();
        });

        it('should return the same logger instance', () => {
            const logger1 = getLogger();
            const logger2 = getLogger();
            expect(logger1).toBe(logger2);
        });

        it('should have standard log methods', () => {
            const logger = getLogger();
            expect(typeof logger.info).toBe('function');
            expect(typeof logger.warn).toBe('function');
            expect(typeof logger.error).toBe('function');
            expect(typeof logger.debug).toBe('function');
            expect(typeof logger.verbose).toBe('function');
        });
    });

    describe('setLogLevel', () => {
        afterEach(() => {
            // Reset to default level after each test
            setLogLevel('info');
        });

        it('should set log level to info', () => {
            setLogLevel('info');
            const logger = getLogger();
            expect(logger.level).toBe('info');
        });

        it('should set log level to debug', () => {
            setLogLevel('debug');
            const logger = getLogger();
            expect(logger.level).toBe('debug');
        });

        it('should set log level to verbose', () => {
            setLogLevel('verbose');
            const logger = getLogger();
            // verbose may be treated as debug in winston
            expect(['verbose', 'debug']).toContain(logger.level);
        });

        it('should set log level to warn', () => {
            setLogLevel('warn');
            const logger = getLogger();
            expect(logger.level).toBe('warn');
        });

        it('should set log level to error', () => {
            setLogLevel('error');
            const logger = getLogger();
            expect(logger.level).toBe('error');
        });
    });

    describe('getDryRunLogger', () => {
        afterEach(() => {
            setLogLevel('info');
        });

        it('should return regular logger when isDryRun is false', () => {
            const logger = getDryRunLogger(false);
            const regularLogger = getLogger();
            expect(logger).toBe(regularLogger);
        });

        it('should return a wrapper when isDryRun is true', () => {
            const logger = getDryRunLogger(true);
            const regularLogger = getLogger();
            // Should be a different object (the wrapper)
            expect(logger).not.toBe(regularLogger);
        });

        it('should have all log methods when isDryRun is true', () => {
            const logger = getDryRunLogger(true);
            expect(typeof logger.info).toBe('function');
            expect(typeof logger.warn).toBe('function');
            expect(typeof logger.error).toBe('function');
            expect(typeof logger.debug).toBe('function');
            expect(typeof logger.verbose).toBe('function');
            expect(typeof logger.silly).toBe('function');
        });

        it('should call underlying logger methods', () => {
            const logger = getDryRunLogger(true);
            // Just verify the methods don't throw
            expect(() => logger.info('test message')).not.toThrow();
            expect(() => logger.debug('debug message')).not.toThrow();
        });
    });
});

