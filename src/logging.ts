import winston from 'winston';
import { Writable } from 'stream';

import * as fs from 'fs';
import path from 'path';
import { DATE_FORMAT_YEAR_MONTH_DAY_HOURS_MINUTES_SECONDS_MILLISECONDS, PROGRAM_NAME, DEFAULT_OUTPUT_DIRECTORY } from './constants';

export interface LogContext {
    [key: string]: any;
}

// Track if debug directory has been ensured for this session
let debugDirectoryEnsured = false;

const ensureDebugDirectory = () => {
    if (debugDirectoryEnsured) return;

    const debugDir = path.join(DEFAULT_OUTPUT_DIRECTORY, 'debug');

    try {
        fs.mkdirSync(debugDir, { recursive: true });
        debugDirectoryEnsured = true;
    } catch (error) {
        // Only log to console if not in MCP server mode (MCP mode requires clean stdout)
        if (process.env.KODRDRIV_MCP_SERVER !== 'true') {
            // eslint-disable-next-line no-console
            console.error(`Failed to create debug directory ${debugDir}:`, error);
        }
    }
};

const generateDebugLogFilename = () => {
    const now = new Date();
    const timestamp = now.toISOString()
        .replace(/[-:]/g, '')
        .replace(/\./g, '')
        .replace('T', '-')
        .replace('Z', '');

    return `${timestamp}-debug.log`;
};

const createTransports = (level: string) => {
    const transports: winston.transport[] = [];

    // When running as MCP server, NEVER add console transports as they interfere with the protocol
    // All output must go through log capture mechanism instead
    const isMcpServer = process.env.KODRDRIV_MCP_SERVER === 'true';

    if (isMcpServer) {
        // In MCP mode, add a silent Memory transport to prevent winston from logging transport errors
        // Winston complains when there are no transports, so we add a silent one
        // The log capture transport will be added separately via installLogCapture
        // Use a no-op stream that discards all output
        const silentStream = new Writable({
            write(_chunk: any, _encoding: string, callback: () => void) {
                // Silent - discard all output, log capture handles actual logging
                callback();
            },
            // Suppress any errors from the stream itself
            destroy: function(_err: Error | null, callback: () => void) {
                callback();
            },
        });
        // Suppress winston transport errors by catching them
        const silentTransport = new winston.transports.Stream({
            stream: silentStream,
            silent: true,
        });
        // Override error handling on the transport to prevent winston from logging to stderr
        (silentTransport as any).on('error', () => {
            // Silently ignore transport errors - don't output to stderr
        });
        transports.push(silentTransport);
    } else {
        // Add console transport for info level and above (only when NOT in MCP mode)
        if (level === 'info') {
            transports.push(
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.colorize(),
                        winston.format.printf(({ level, message, dryRun }): string => {
                            const dryRunPrefix = dryRun ? '🔍 DRY RUN: ' : '';
                            // For info level messages, don't show the level prefix
                            if (level.includes('info')) {
                                return `${dryRunPrefix}${String(message)}`;
                            }
                            // For warn, error, etc., show the level prefix
                            return `${level}: ${dryRunPrefix}${String(message)}`;
                        })
                    )
                })
            );
        } else {
            // For debug/verbose levels, add console transport that shows info and above
            transports.push(
                new winston.transports.Console({
                    level: 'info', // Show info, warn, and error on console
                    format: winston.format.combine(
                        winston.format.colorize(),
                        winston.format.printf(({ timestamp, level, message, dryRun, ...meta }): string => {
                            // For info level messages, use simpler format without timestamp
                            if (level.includes('info')) {
                                const dryRunPrefix = dryRun ? '🔍 DRY RUN: ' : '';
                                return `${dryRunPrefix}${String(message)}`;
                            }

                            // Filter out winston internal metadata
                            const filteredMeta = Object.keys(meta).reduce((acc, key) => {
                                if (!['level', 'message', 'timestamp', 'dryRun', 'service', 'splat', 'Symbol(level)', 'Symbol(message)'].includes(key)) {
                                    acc[key] = meta[key];
                                }
                                return acc;
                            }, {} as Record<string, any>);

                            const metaStr = Object.keys(filteredMeta).length ? ` ${JSON.stringify(filteredMeta, null, 2)}` : '';
                            const dryRunPrefix = dryRun ? '🔍 DRY RUN: ' : '';
                            return `${timestamp} ${level}: ${dryRunPrefix}${String(message)}${metaStr}`;
                        })
                    )
                })
            );
        }
    }

    // Add file transport for debug levels (debug and silly)
    if (level === 'debug' || level === 'silly') {
        ensureDebugDirectory();

        const debugLogPath = path.join(DEFAULT_OUTPUT_DIRECTORY, 'debug', generateDebugLogFilename());

        transports.push(
            new winston.transports.File({
                filename: debugLogPath,
                level: 'debug', // Capture debug and above in the file
                format: winston.format.combine(
                    winston.format.timestamp({ format: DATE_FORMAT_YEAR_MONTH_DAY_HOURS_MINUTES_SECONDS_MILLISECONDS }),
                    winston.format.errors({ stack: true }),
                    winston.format.splat(),
                    winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
                        // Filter out winston internal metadata and properly format remaining meta
                        const filteredMeta = Object.keys(meta).reduce((acc, key) => {
                            // Skip internal winston fields
                            if (!['level', 'message', 'timestamp', 'splat', 'Symbol(level)', 'Symbol(message)'].includes(key)) {
                                acc[key] = meta[key];
                            }
                            return acc;
                        }, {} as Record<string, any>);

                        const metaStr = Object.keys(filteredMeta).length
                            ? ` ${JSON.stringify(filteredMeta, null, 2)}`
                            : '';
                        const serviceStr = service ? ` [${service}]` : '';
                        return `${timestamp}${serviceStr} ${level}: ${message}${metaStr}`;
                    })
                )
            })
        );
    }

    return transports;
};

const createFormat = (level: string) => {
    const baseFormats = [
        winston.format.errors({ stack: true }),
        winston.format.splat(),
    ];

    if (level === 'info') {
        return winston.format.combine(
            ...baseFormats,
            winston.format.printf(({ message, dryRun, ..._meta }): string => {
                // Auto-format dry-run messages
                if (dryRun) {
                    return `🔍 DRY RUN: ${message}`;
                }
                return String(message);
            })
        );
    }

    return winston.format.combine(
        winston.format.timestamp({ format: DATE_FORMAT_YEAR_MONTH_DAY_HOURS_MINUTES_SECONDS_MILLISECONDS }),
        ...baseFormats,
        winston.format.printf(({ timestamp, level, message, dryRun, ...meta }): string => {
            // Filter out winston internal metadata
            const filteredMeta = Object.keys(meta).reduce((acc, key) => {
                if (!['level', 'message', 'timestamp', 'dryRun', 'service', 'splat', 'Symbol(level)', 'Symbol(message)'].includes(key)) {
                    acc[key] = meta[key];
                }
                return acc;
            }, {} as Record<string, any>);

            const metaStr = Object.keys(filteredMeta).length ? ` ${JSON.stringify(filteredMeta, null, 2)}` : '';
            const dryRunPrefix = dryRun ? '🔍 DRY RUN: ' : '';
            return `${timestamp} ${level}: ${dryRunPrefix}${String(message)}${metaStr}`;
        })
    );
};

// Create the logger instance once
const logger = winston.createLogger({
    level: 'info',
    format: createFormat('info'),
    defaultMeta: { service: PROGRAM_NAME },
    transports: createTransports('info'),
    // Suppress winston's own error handling in MCP mode to prevent stderr pollution
    exceptionHandlers: process.env.KODRDRIV_MCP_SERVER === 'true' ? [] : undefined,
    rejectionHandlers: process.env.KODRDRIV_MCP_SERVER === 'true' ? [] : undefined,
    // Prevent winston from logging transport errors to stderr
    handleExceptions: false,
    handleRejections: false,
});

export const setLogLevel = (level: string) => {
    // Reconfigure the existing logger instead of creating a new one
    const isMcpServer = process.env.KODRDRIV_MCP_SERVER === 'true';
    logger.configure({
        level,
        format: createFormat(level),
        defaultMeta: { service: PROGRAM_NAME },
        transports: createTransports(level),
        // Suppress winston's own error handling in MCP mode to prevent stderr pollution
        exceptionHandlers: isMcpServer ? [] : undefined,
        rejectionHandlers: isMcpServer ? [] : undefined,
        // Prevent winston from logging transport errors to stderr
        handleExceptions: false,
        handleRejections: false,
    });
};

export const getLogger = () => logger;

/**
 * Get a logger that automatically formats messages for dry-run mode
 */
export const getDryRunLogger = (isDryRun: boolean) => {
    if (!isDryRun) {
        return logger;
    }

    // Return a wrapper that adds dry-run context to all log calls
    return {
        info: (message: string, ...args: any[]) => logger.info(message, { dryRun: true }, ...args),
        warn: (message: string, ...args: any[]) => logger.warn(message, { dryRun: true }, ...args),
        error: (message: string, ...args: any[]) => logger.error(message, { dryRun: true }, ...args),
        debug: (message: string, ...args: any[]) => logger.debug(message, { dryRun: true }, ...args),
        verbose: (message: string, ...args: any[]) => logger.verbose(message, { dryRun: true }, ...args),
        silly: (message: string, ...args: any[]) => logger.silly(message, { dryRun: true }, ...args),
    };
};
