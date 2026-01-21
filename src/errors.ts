/**
 * Structured error types for kodrdriv operations
 *
 * These errors provide detailed context for MCP integrations and AI agents
 * to understand failures and provide actionable recovery steps.
 */

export interface KodrdrivErrorContext {
    operation: string;
    package?: string;
    phase?: string;
    files?: string[];
    command?: string;
    exitCode?: number;
    stdout?: string;
    stderr?: string;
    stack?: string;
}

/**
 * Base error class for all kodrdriv operations
 */
export class KodrdrivError extends Error {
    constructor(
        message: string,
        public context: KodrdrivErrorContext,
        public recoverable: boolean = true
    ) {
        super(message);
        this.name = 'KodrdrivError';
        // Capture stack trace
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

/**
 * Error specific to publish operations
 */
export class PublishError extends KodrdrivError {
    constructor(message: string, context: Omit<KodrdrivErrorContext, 'operation'>) {
        super(message, { ...context, operation: 'publish' });
        this.name = 'PublishError';
    }
}

/**
 * Error specific to tree operations (monorepo orchestration)
 */
export class TreeExecutionError extends KodrdrivError {
    constructor(
        message: string,
        context: Omit<KodrdrivErrorContext, 'operation'>,
        public failedPackages: string[] = [],
        public completedPackages: string[] = [],
        public checkpointPath?: string
    ) {
        super(message, { ...context, operation: 'tree' });
        this.name = 'TreeExecutionError';
    }
}

/**
 * Error for validation failures (pre-flight checks)
 */
export class ValidationError extends KodrdrivError {
    constructor(
        message: string,
        context: Omit<KodrdrivErrorContext, 'operation'>,
        public validationErrors: Array<{
            check: string;
            message: string;
            files?: string[];
        }> = [],
        public validationWarnings: Array<{
            check: string;
            message: string;
        }> = []
    ) {
        super(message, { ...context, operation: 'validation' }, false);
        this.name = 'ValidationError';
    }
}

/**
 * Error for workspace structure issues
 */
export class WorkspaceError extends KodrdrivError {
    constructor(
        message: string,
        context: Omit<KodrdrivErrorContext, 'operation'>,
        public expectedStructure?: string
    ) {
        super(message, { ...context, operation: 'workspace' }, false);
        this.name = 'WorkspaceError';
    }
}

/**
 * Format error for MCP tool responses
 */
export function formatErrorForMCP(error: Error): {
    message: string;
    context: Record<string, any>;
    recovery?: string[];
} {
    // Handle TreeExecutionError
    if (error instanceof TreeExecutionError) {
        const recovery: string[] = [];

        if (error.failedPackages.length > 0) {
            recovery.push(`Fix the issue in: ${error.failedPackages.join(', ')}`);
        }

        if (error.checkpointPath) {
            recovery.push(`Then resume with: kodrdriv tree_publish --continue`);
            recovery.push(`Or via MCP: kodrdriv_tree_publish({directory: "...", continue: true})`);
        }

        return {
            message: error.message,
            context: {
                ...error.context,
                failedPackages: error.failedPackages,
                completedPackages: error.completedPackages,
                checkpointPath: error.checkpointPath,
                recoverable: error.recoverable,
            },
            recovery: recovery.length > 0 ? recovery : undefined,
        };
    }

    // Handle ValidationError
    if (error instanceof ValidationError) {
        const recovery: string[] = [];

        if (error.validationErrors.length > 0) {
            recovery.push('Fix the following validation errors:');
            error.validationErrors.forEach((err, idx) => {
                recovery.push(`  ${idx + 1}. ${err.check}: ${err.message}`);
                if (err.files && err.files.length > 0) {
                    recovery.push(`     Files: ${err.files.join(', ')}`);
                }
            });
        }

        return {
            message: error.message,
            context: {
                ...error.context,
                validationErrors: error.validationErrors,
                validationWarnings: error.validationWarnings,
                recoverable: error.recoverable,
            },
            recovery: recovery.length > 0 ? recovery : undefined,
        };
    }

    // Handle PublishError
    if (error instanceof PublishError) {
        const recovery: string[] = [];

        if (error.context.phase) {
            recovery.push(`Failed during: ${error.context.phase}`);
        }

        if (error.context.files && error.context.files.length > 0) {
            recovery.push(`Check these files: ${error.context.files.join(', ')}`);
        }

        if (error.context.command) {
            recovery.push(`Failed command: ${error.context.command}`);
            if (error.context.exitCode) {
                recovery.push(`Exit code: ${error.context.exitCode}`);
            }
        }

        return {
            message: error.message,
            context: {
                ...error.context,
                recoverable: error.recoverable,
            },
            recovery: recovery.length > 0 ? recovery : undefined,
        };
    }

    // Handle WorkspaceError
    if (error instanceof WorkspaceError) {
        const recovery: string[] = [];

        if (error.expectedStructure) {
            recovery.push(`Expected structure: ${error.expectedStructure}`);
        }

        if (error.context.files && error.context.files.length > 0) {
            recovery.push(`Missing or invalid files: ${error.context.files.join(', ')}`);
        }

        return {
            message: error.message,
            context: {
                ...error.context,
                expectedStructure: error.expectedStructure,
                recoverable: error.recoverable,
            },
            recovery: recovery.length > 0 ? recovery : undefined,
        };
    }

    // Handle generic KodrdrivError
    if (error instanceof KodrdrivError) {
        return {
            message: error.message,
            context: {
                ...error.context,
                recoverable: error.recoverable,
            },
        };
    }

    // Handle generic Error
    return {
        message: error.message || 'Unknown error occurred',
        context: {
            name: error.name,
            stack: error.stack,
        },
    };
}

/**
 * Extract error details from command execution errors
 */
export function extractCommandErrorDetails(error: any): Partial<KodrdrivErrorContext> {
    const context: Partial<KodrdrivErrorContext> = {};

    // Extract stdout/stderr from various error formats
    if (error.stdout) {
        context.stdout = typeof error.stdout === 'string' ? error.stdout : String(error.stdout);
    }

    if (error.stderr) {
        context.stderr = typeof error.stderr === 'string' ? error.stderr : String(error.stderr);
    }

    // Extract exit code
    if (error.code !== undefined) {
        context.exitCode = error.code;
    } else if (error.exitCode !== undefined) {
        context.exitCode = error.exitCode;
    }

    // Extract command if available
    if (error.cmd) {
        context.command = error.cmd;
    } else if (error.command) {
        context.command = error.command;
    }

    return context;
}
