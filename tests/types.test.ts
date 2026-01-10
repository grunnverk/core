import { describe, it, expect } from 'vitest';
import { ConfigSchema, SecureConfigSchema, CommandConfigSchema } from '../src/types';

describe('types and schemas', () => {
    describe('ConfigSchema', () => {
        it('should validate empty config', () => {
            const result = ConfigSchema.safeParse({});
            expect(result.success).toBe(true);
        });

        it('should validate config with basic options', () => {
            const config = {
                dryRun: true,
                verbose: true,
                debug: false,
                model: 'gpt-4',
            };
            const result = ConfigSchema.safeParse(config);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.dryRun).toBe(true);
                expect(result.data.model).toBe('gpt-4');
            }
        });

        it('should validate openaiReasoning enum', () => {
            expect(ConfigSchema.safeParse({ openaiReasoning: 'low' }).success).toBe(true);
            expect(ConfigSchema.safeParse({ openaiReasoning: 'medium' }).success).toBe(true);
            expect(ConfigSchema.safeParse({ openaiReasoning: 'high' }).success).toBe(true);
            expect(ConfigSchema.safeParse({ openaiReasoning: 'invalid' }).success).toBe(false);
        });

        it('should validate contextDirectories as string array', () => {
            const config = { contextDirectories: ['dir1', 'dir2'] };
            const result = ConfigSchema.safeParse(config);
            expect(result.success).toBe(true);
        });

        it('should reject contextDirectories with non-strings', () => {
            const config = { contextDirectories: [123, 'dir2'] };
            const result = ConfigSchema.safeParse(config);
            expect(result.success).toBe(false);
        });

        describe('commit config', () => {
            it('should validate commit options', () => {
                const config = {
                    commit: {
                        add: true,
                        cached: false,
                        sendit: true,
                        interactive: false,
                        amend: false,
                        messageLimit: 5,
                        maxDiffBytes: 10000,
                    },
                };
                const result = ConfigSchema.safeParse(config);
                expect(result.success).toBe(true);
            });

            it('should validate commit push as boolean', () => {
                const config = { commit: { push: true } };
                const result = ConfigSchema.safeParse(config);
                expect(result.success).toBe(true);
            });

            it('should validate commit push as string', () => {
                const config = { commit: { push: 'origin' } };
                const result = ConfigSchema.safeParse(config);
                expect(result.success).toBe(true);
            });
        });

        describe('release config', () => {
            it('should validate release options', () => {
                const config = {
                    release: {
                        from: 'main',
                        to: 'HEAD',
                        messageLimit: 10,
                        interactive: true,
                    },
                };
                const result = ConfigSchema.safeParse(config);
                expect(result.success).toBe(true);
            });
        });

        describe('review config', () => {
            it('should validate review options', () => {
                const config = {
                    review: {
                        includeCommitHistory: true,
                        includeRecentDiffs: true,
                        includeReleaseNotes: false,
                        includeGithubIssues: true,
                        commitHistoryLimit: 20,
                    },
                };
                const result = ConfigSchema.safeParse(config);
                expect(result.success).toBe(true);
            });
        });

        describe('publish config', () => {
            it('should validate publish options', () => {
                const config = {
                    publish: {
                        mergeMethod: 'squash',
                        targetVersion: 'minor',
                        interactive: true,
                        sendit: false,
                    },
                };
                const result = ConfigSchema.safeParse(config);
                expect(result.success).toBe(true);
            });

            it('should validate mergeMethod enum', () => {
                expect(ConfigSchema.safeParse({ publish: { mergeMethod: 'merge' } }).success).toBe(true);
                expect(ConfigSchema.safeParse({ publish: { mergeMethod: 'squash' } }).success).toBe(true);
                expect(ConfigSchema.safeParse({ publish: { mergeMethod: 'rebase' } }).success).toBe(true);
                expect(ConfigSchema.safeParse({ publish: { mergeMethod: 'invalid' } }).success).toBe(false);
            });
        });

        describe('branches config', () => {
            it('should validate branches record', () => {
                const config = {
                    branches: {
                        working: {
                            targetBranch: 'main',
                            developmentBranch: true,
                            version: {
                                type: 'prerelease',
                                increment: true,
                                tag: 'dev',
                            },
                        },
                        main: {
                            version: {
                                type: 'release',
                            },
                        },
                    },
                };
                const result = ConfigSchema.safeParse(config);
                expect(result.success).toBe(true);
            });

            it('should validate version type enum', () => {
                const releaseConfig = {
                    branches: { main: { version: { type: 'release' } } },
                };
                const prereleaseConfig = {
                    branches: { dev: { version: { type: 'prerelease' } } },
                };
                expect(ConfigSchema.safeParse(releaseConfig).success).toBe(true);
                expect(ConfigSchema.safeParse(prereleaseConfig).success).toBe(true);
            });

            it('should validate incrementLevel enum', () => {
                const config = {
                    branches: {
                        dev: {
                            version: {
                                type: 'prerelease',
                                incrementLevel: 'patch',
                            },
                        },
                    },
                };
                expect(ConfigSchema.safeParse(config).success).toBe(true);

                const minorConfig = { branches: { dev: { version: { type: 'prerelease', incrementLevel: 'minor' } } } };
                expect(ConfigSchema.safeParse(minorConfig).success).toBe(true);

                const majorConfig = { branches: { dev: { version: { type: 'prerelease', incrementLevel: 'major' } } } };
                expect(ConfigSchema.safeParse(majorConfig).success).toBe(true);
            });
        });

        describe('tree config', () => {
            it('should validate tree options', () => {
                const config = {
                    tree: {
                        directories: ['packages/*'],
                        exclude: ['test-fixtures'],
                        startFrom: '@scope/package',
                        parallel: true,
                        maxConcurrency: 4,
                    },
                };
                const result = ConfigSchema.safeParse(config);
                expect(result.success).toBe(true);
            });

            it('should validate tree retry config', () => {
                const config = {
                    tree: {
                        retry: {
                            maxAttempts: 3,
                            initialDelayMs: 1000,
                            maxDelayMs: 30000,
                            backoffMultiplier: 2,
                        },
                    },
                };
                const result = ConfigSchema.safeParse(config);
                expect(result.success).toBe(true);
            });

            it('should validate tree monitoring config', () => {
                const config = {
                    tree: {
                        monitoring: {
                            showProgress: true,
                            showMetrics: true,
                            logLevel: 'verbose',
                        },
                    },
                };
                const result = ConfigSchema.safeParse(config);
                expect(result.success).toBe(true);
            });
        });

        describe('link/unlink config', () => {
            it('should validate link options', () => {
                const config = {
                    link: {
                        scopeRoots: { '@scope': '/path/to/packages' },
                        dryRun: true,
                    },
                };
                const result = ConfigSchema.safeParse(config);
                expect(result.success).toBe(true);
            });

            it('should validate unlink options', () => {
                const config = {
                    unlink: {
                        scopeRoots: { '@scope': '/path' },
                        cleanNodeModules: true,
                    },
                };
                const result = ConfigSchema.safeParse(config);
                expect(result.success).toBe(true);
            });
        });

        describe('audioCommit config', () => {
            it('should validate audioCommit options', () => {
                const config = {
                    audioCommit: {
                        maxRecordingTime: 600,
                        audioDevice: 'default',
                    },
                };
                const result = ConfigSchema.safeParse(config);
                expect(result.success).toBe(true);
            });
        });

        describe('audioReview config', () => {
            it('should validate audioReview options', () => {
                const config = {
                    audioReview: {
                        includeCommitHistory: true,
                        maxRecordingTime: 300,
                    },
                };
                const result = ConfigSchema.safeParse(config);
                expect(result.success).toBe(true);
            });
        });

        describe('development config', () => {
            it('should validate development options', () => {
                const config = {
                    development: {
                        targetVersion: 'minor',
                        noMilestones: false,
                    },
                };
                const result = ConfigSchema.safeParse(config);
                expect(result.success).toBe(true);
            });
        });

        describe('versions config', () => {
            it('should validate versions options', () => {
                const config = {
                    versions: {
                        subcommand: 'minor',
                        directories: ['packages/*'],
                    },
                };
                const result = ConfigSchema.safeParse(config);
                expect(result.success).toBe(true);
            });
        });

        describe('updates config', () => {
            it('should validate updates options', () => {
                const config = {
                    updates: {
                        scope: '@myorg',
                        directories: ['packages/*'],
                    },
                };
                const result = ConfigSchema.safeParse(config);
                expect(result.success).toBe(true);
            });
        });

        describe('stopContext config', () => {
            it('should validate stopContext options', () => {
                const config = {
                    stopContext: {
                        enabled: true,
                        strings: ['secret', 'password'],
                        patterns: [
                            { regex: 'API_KEY_\\w+', flags: 'g' },
                        ],
                        caseSensitive: false,
                        replacement: '[REDACTED]',
                    },
                };
                const result = ConfigSchema.safeParse(config);
                expect(result.success).toBe(true);
            });
        });

        describe('excludedPatterns', () => {
            it('should validate excludedPatterns as string array', () => {
                const config = {
                    excludedPatterns: ['node_modules', 'dist', '*.log'],
                };
                const result = ConfigSchema.safeParse(config);
                expect(result.success).toBe(true);
            });
        });
    });

    describe('SecureConfigSchema', () => {
        it('should validate empty config', () => {
            const result = SecureConfigSchema.safeParse({});
            expect(result.success).toBe(true);
        });

        it('should validate openaiApiKey', () => {
            const config = { openaiApiKey: 'sk-test-key' };
            const result = SecureConfigSchema.safeParse(config);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.openaiApiKey).toBe('sk-test-key');
            }
        });

        it('should reject non-string openaiApiKey', () => {
            const config = { openaiApiKey: 12345 };
            const result = SecureConfigSchema.safeParse(config);
            expect(result.success).toBe(false);
        });
    });

    describe('CommandConfigSchema', () => {
        it('should validate empty config', () => {
            const result = CommandConfigSchema.safeParse({});
            expect(result.success).toBe(true);
        });

        it('should validate commandName', () => {
            const config = { commandName: 'commit' };
            const result = CommandConfigSchema.safeParse(config);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.commandName).toBe('commit');
            }
        });

        it('should reject non-string commandName', () => {
            const config = { commandName: 123 };
            const result = CommandConfigSchema.safeParse(config);
            expect(result.success).toBe(false);
        });
    });
});

