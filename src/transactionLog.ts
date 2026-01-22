/**
 * Transaction log for tracking and rolling back operations
 *
 * Provides a way to track operations and roll them back if something fails,
 * leaving the repository in a clean state.
 */

import { getLogger } from './logging';

export interface TransactionOperation {
    type: string;
    timestamp: Date;
    details: any;
    rollback: () => Promise<void>;
}

export class TransactionLog {
    private operations: TransactionOperation[] = [];
    private logger = getLogger();

    /**
     * Record an operation with its rollback function
     */
    async record(
        type: string,
        details: any,
        rollback: () => Promise<void>
    ): Promise<void> {
        this.operations.push({
            type,
            timestamp: new Date(),
            details,
            rollback
        });

        this.logger.debug(`TRANSACTION_RECORDED: ${type} | Details: ${JSON.stringify(details)}`);
    }

    /**
     * Roll back all operations in reverse order
     */
    async rollbackAll(): Promise<void> {
        this.logger.info('TRANSACTION_ROLLBACK_STARTING: Rolling back operations | Count: ' + this.operations.length);

        const errors: Error[] = [];

        // Rollback in reverse order (LIFO)
        for (let i = this.operations.length - 1; i >= 0; i--) {
            const op = this.operations[i];

            try {
                this.logger.info(`TRANSACTION_ROLLBACK: Rolling back ${op.type} | Timestamp: ${op.timestamp.toISOString()}`);
                await op.rollback();
                this.logger.info(`TRANSACTION_ROLLBACK_SUCCESS: ${op.type} rolled back successfully`);
            } catch (error: any) {
                this.logger.error(`TRANSACTION_ROLLBACK_FAILED: Failed to rollback ${op.type} | Error: ${error.message}`);
                errors.push(error);
                // Continue rolling back other operations even if one fails
            }
        }

        if (errors.length > 0) {
            this.logger.error(`TRANSACTION_ROLLBACK_PARTIAL: ${errors.length} rollback operation(s) failed`);
            throw new Error(`Rollback completed with ${errors.length} error(s). See logs for details.`);
        }

        this.logger.info('TRANSACTION_ROLLBACK_COMPLETE: All operations rolled back successfully');
        this.operations = [];
    }

    /**
     * Clear the transaction log without rolling back
     */
    clear(): void {
        this.operations = [];
        this.logger.debug('TRANSACTION_LOG_CLEARED: Transaction log cleared');
    }

    /**
     * Get the number of recorded operations
     */
    get count(): number {
        return this.operations.length;
    }

    /**
     * Get all operations
     */
    getOperations(): Readonly<TransactionOperation[]> {
        return [...this.operations];
    }

    /**
     * Check if there are any recorded operations
     */
    hasOperations(): boolean {
        return this.operations.length > 0;
    }
}

/**
 * Create a no-op rollback function for operations that can't be rolled back
 */
export function noopRollback(): Promise<void> {
    return Promise.resolve();
}

/**
 * Helper to create a file restore rollback
 */
export function createFileRestoreRollback(
    filePath: string,
    originalContent: string
): () => Promise<void> {
    return async () => {
        const { createStorage } = await import('@grunnverk/shared');
        const storage = createStorage();
        await storage.writeFile(filePath, originalContent, 'utf-8');
    };
}

/**
 * Helper to create a git command rollback
 */
export function createGitRollback(command: string): () => Promise<void> {
    return async () => {
        const { run } = await import('@grunnverk/git-tools');
        await run(command);
    };
}
