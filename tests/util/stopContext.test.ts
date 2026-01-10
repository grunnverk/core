import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { filterContent, isStopContextEnabled, FilterResult } from '../../src/util/stopContext';
import { StopContextConfig } from '../../src/types';

// Mock the logger
vi.mock('../../src/logging', () => ({
    getLogger: () => ({
        warn: vi.fn(),
        verbose: vi.fn(),
        level: 'info',
    }),
}));

describe('stopContext utilities', () => {
    describe('filterContent', () => {
        it('should return original text when config is undefined', () => {
            const text = 'Hello world with sensitive data';
            const result = filterContent(text, undefined);

            expect(result.filtered).toBe(text);
            expect(result.originalLength).toBe(text.length);
            expect(result.filteredLength).toBe(text.length);
            expect(result.matchCount).toBe(0);
            expect(result.matches).toEqual([]);
        });

        it('should return original text when config.enabled is false', () => {
            const text = 'Hello world with sensitive data';
            const config: StopContextConfig = {
                enabled: false,
                strings: ['sensitive'],
            };
            const result = filterContent(text, config);

            expect(result.filtered).toBe(text);
            expect(result.matchCount).toBe(0);
        });

        it('should return original text when no filters are configured', () => {
            const text = 'Hello world';
            const config: StopContextConfig = {
                enabled: true,
            };
            const result = filterContent(text, config);

            expect(result.filtered).toBe(text);
            expect(result.matchCount).toBe(0);
        });

        describe('string filtering', () => {
            it('should filter simple string matches', () => {
                const text = 'Hello secret world';
                const config: StopContextConfig = {
                    enabled: true,
                    strings: ['secret'],
                };
                const result = filterContent(text, config);

                expect(result.filtered).toBe('Hello [REDACTED] world');
                expect(result.matchCount).toBe(1);
                expect(result.matches[0].type).toBe('string');
                expect(result.matches[0].matched).toBe('secret');
            });

            it('should filter multiple occurrences of the same string', () => {
                const text = 'secret is secret and secret';
                const config: StopContextConfig = {
                    enabled: true,
                    strings: ['secret'],
                };
                const result = filterContent(text, config);

                expect(result.filtered).toBe('[REDACTED] is [REDACTED] and [REDACTED]');
                expect(result.matchCount).toBe(3);
            });

            it('should filter multiple different strings', () => {
                const text = 'Hello secret world with password123';
                const config: StopContextConfig = {
                    enabled: true,
                    strings: ['secret', 'password123'],
                };
                const result = filterContent(text, config);

                expect(result.filtered).toBe('Hello [REDACTED] world with [REDACTED]');
                expect(result.matchCount).toBe(2);
            });

            it('should be case-insensitive by default', () => {
                const text = 'SECRET Secret secret';
                const config: StopContextConfig = {
                    enabled: true,
                    strings: ['secret'],
                };
                const result = filterContent(text, config);

                expect(result.filtered).toBe('[REDACTED] [REDACTED] [REDACTED]');
                expect(result.matchCount).toBe(3);
            });

            it('should respect caseSensitive option', () => {
                const text = 'SECRET Secret secret';
                const config: StopContextConfig = {
                    enabled: true,
                    strings: ['secret'],
                    caseSensitive: true,
                };
                const result = filterContent(text, config);

                expect(result.filtered).toBe('SECRET Secret [REDACTED]');
                expect(result.matchCount).toBe(1);
            });

            it('should use custom replacement', () => {
                const text = 'Hello secret world';
                const config: StopContextConfig = {
                    enabled: true,
                    strings: ['secret'],
                    replacement: '***',
                };
                const result = filterContent(text, config);

                expect(result.filtered).toBe('Hello *** world');
            });
        });

        describe('pattern filtering', () => {
            it('should filter regex pattern matches', () => {
                const text = 'My API key is ABC123XYZ';
                const config: StopContextConfig = {
                    enabled: true,
                    patterns: [{ regex: 'ABC[0-9]+XYZ' }],
                };
                const result = filterContent(text, config);

                expect(result.filtered).toBe('My API key is [REDACTED]');
                expect(result.matchCount).toBe(1);
                expect(result.matches[0].type).toBe('pattern');
            });

            it('should filter multiple pattern matches', () => {
                const text = 'Keys: ABC123XYZ and ABC456XYZ';
                const config: StopContextConfig = {
                    enabled: true,
                    patterns: [{ regex: 'ABC[0-9]+XYZ' }],
                };
                const result = filterContent(text, config);

                expect(result.filtered).toBe('Keys: [REDACTED] and [REDACTED]');
                expect(result.matchCount).toBe(2);
            });

            it('should handle complex regex patterns', () => {
                const text = 'Email: test@example.com is valid';
                const config: StopContextConfig = {
                    enabled: true,
                    patterns: [{ regex: '[a-z]+@[a-z]+\\.[a-z]+' }],
                };
                const result = filterContent(text, config);

                expect(result.filtered).toBe('Email: [REDACTED] is valid');
            });

            it('should respect pattern flags', () => {
                const text = 'SECRET secret';
                const config: StopContextConfig = {
                    enabled: true,
                    patterns: [{ regex: 'secret', flags: 'g' }],  // case-sensitive
                };
                const result = filterContent(text, config);

                expect(result.filtered).toBe('SECRET [REDACTED]');
            });

            it('should skip invalid regex patterns gracefully', () => {
                const text = 'Hello world';
                const config: StopContextConfig = {
                    enabled: true,
                    patterns: [{ regex: '[invalid(' }],  // Invalid regex
                };
                const result = filterContent(text, config);

                expect(result.filtered).toBe(text);  // Original text returned
                expect(result.matchCount).toBe(0);
            });
        });

        describe('combined filtering', () => {
            it('should apply both string and pattern filters', () => {
                const text = 'secret key: ABC123XYZ';
                const config: StopContextConfig = {
                    enabled: true,
                    strings: ['secret'],
                    patterns: [{ regex: 'ABC[0-9]+XYZ' }],
                };
                const result = filterContent(text, config);

                expect(result.filtered).toBe('[REDACTED] key: [REDACTED]');
                expect(result.matchCount).toBe(2);
            });
        });

        describe('result metadata', () => {
            it('should track original and filtered lengths', () => {
                const text = 'Hello secret world';  // 18 chars
                const config: StopContextConfig = {
                    enabled: true,
                    strings: ['secret'],  // 6 chars -> [REDACTED] 10 chars
                };
                const result = filterContent(text, config);

                expect(result.originalLength).toBe(18);
                expect(result.filteredLength).toBe(result.filtered.length);
            });

            it('should track match positions', () => {
                const text = 'Hello secret world';
                const config: StopContextConfig = {
                    enabled: true,
                    strings: ['secret'],
                };
                const result = filterContent(text, config);

                expect(result.matches[0].position).toBe(6);  // Position of 'secret'
            });
        });
    });

    describe('isStopContextEnabled', () => {
        it('should return false when config is undefined', () => {
            expect(isStopContextEnabled(undefined)).toBe(false);
        });

        it('should return false when enabled is false', () => {
            const config: StopContextConfig = {
                enabled: false,
                strings: ['secret'],
            };
            expect(isStopContextEnabled(config)).toBe(false);
        });

        it('should return false when no filters configured', () => {
            const config: StopContextConfig = {
                enabled: true,
            };
            expect(isStopContextEnabled(config)).toBe(false);
        });

        it('should return false when strings array is empty', () => {
            const config: StopContextConfig = {
                enabled: true,
                strings: [],
            };
            expect(isStopContextEnabled(config)).toBe(false);
        });

        it('should return false when patterns array is empty', () => {
            const config: StopContextConfig = {
                enabled: true,
                patterns: [],
            };
            expect(isStopContextEnabled(config)).toBe(false);
        });

        it('should return true when strings are configured', () => {
            const config: StopContextConfig = {
                enabled: true,
                strings: ['secret'],
            };
            expect(isStopContextEnabled(config)).toBe(true);
        });

        it('should return true when patterns are configured', () => {
            const config: StopContextConfig = {
                enabled: true,
                patterns: [{ regex: 'test' }],
            };
            expect(isStopContextEnabled(config)).toBe(true);
        });

        it('should return true when enabled is not explicitly set and filters exist', () => {
            const config: StopContextConfig = {
                strings: ['secret'],
            };
            expect(isStopContextEnabled(config)).toBe(true);
        });
    });
});

