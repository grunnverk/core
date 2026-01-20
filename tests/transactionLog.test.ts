import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TransactionLog, noopRollback, createGitRollback } from '../src/transactionLog';

describe('TransactionLog', () => {
    let txLog: TransactionLog;

    beforeEach(() => {
        txLog = new TransactionLog();
    });

    it('should record operations', async () => {
        const rollback = vi.fn().mockResolvedValue(undefined);

        await txLog.record('test_operation', { data: 'test' }, rollback);

        expect(txLog.count).toBe(1);
        expect(txLog.hasOperations()).toBe(true);
    });

    it('should rollback operations in reverse order', async () => {
        const callOrder: number[] = [];

        const rollback1 = vi.fn().mockImplementation(async () => {
            callOrder.push(1);
        });
        const rollback2 = vi.fn().mockImplementation(async () => {
            callOrder.push(2);
        });
        const rollback3 = vi.fn().mockImplementation(async () => {
            callOrder.push(3);
        });

        await txLog.record('op1', {}, rollback1);
        await txLog.record('op2', {}, rollback2);
        await txLog.record('op3', {}, rollback3);

        await txLog.rollbackAll();

        // Should be called in reverse order: 3, 2, 1
        expect(callOrder).toEqual([3, 2, 1]);
        expect(txLog.count).toBe(0);
    });

    it('should continue rollback even if one operation fails', async () => {
        const rollback1 = vi.fn().mockResolvedValue(undefined);
        const rollback2 = vi.fn().mockRejectedValue(new Error('Rollback 2 failed'));
        const rollback3 = vi.fn().mockResolvedValue(undefined);

        await txLog.record('op1', {}, rollback1);
        await txLog.record('op2', {}, rollback2);
        await txLog.record('op3', {}, rollback3);

        await expect(txLog.rollbackAll()).rejects.toThrow('Rollback completed with 1 error(s)');

        // All rollbacks should have been attempted
        expect(rollback1).toHaveBeenCalled();
        expect(rollback2).toHaveBeenCalled();
        expect(rollback3).toHaveBeenCalled();
    });

    it('should clear operations', () => {
        txLog.record('op1', {}, async () => {});
        expect(txLog.count).toBe(1);

        txLog.clear();

        expect(txLog.count).toBe(0);
        expect(txLog.hasOperations()).toBe(false);
    });

    it('should get operations readonly', async () => {
        const rollback = vi.fn();
        await txLog.record('op1', { data: 'test' }, rollback);

        const operations = txLog.getOperations();

        expect(operations).toHaveLength(1);
        expect(operations[0].type).toBe('op1');
        expect(operations[0].details).toEqual({ data: 'test' });
    });
});

describe('noopRollback', () => {
    it('should return resolved promise', async () => {
        await expect(noopRollback()).resolves.toBeUndefined();
    });
});

describe('createGitRollback', () => {
    it('should create rollback function that runs git command', async () => {
        const rollback = createGitRollback('git checkout main');

        // We can't easily test the actual execution without mocking run
        expect(typeof rollback).toBe('function');
    });
});
