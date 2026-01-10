import { describe, it, expect, vi } from 'vitest';
import {
    truncateLargeDiff,
    truncateDiffByFiles,
    getReviewExcludedPatterns,
    getMinimalExcludedPatterns,
} from '../../src/content/diff';

// Mock the logger
vi.mock('../../src/logging', () => ({
    getLogger: () => ({
        info: vi.fn(),
        warn: vi.fn(),
        verbose: vi.fn(),
        debug: vi.fn(),
        error: vi.fn(),
    }),
}));

// Mock @eldrforge/git-tools
vi.mock('@eldrforge/git-tools', () => ({
    run: vi.fn(),
}));

describe('diff utilities', () => {
    describe('truncateLargeDiff', () => {
        it('should return original content if under maxLength', () => {
            const content = 'Short diff content';
            const result = truncateLargeDiff(content, 100);
            expect(result).toBe(content);
        });

        it('should truncate content that exceeds maxLength', () => {
            const content = 'a'.repeat(6000);
            const result = truncateLargeDiff(content, 100);

            // Result should contain truncation message
            expect(result).toContain('TRUNCATED');
            // The actual content should be truncated (excluding the message)
            expect(result.indexOf('TRUNCATED')).toBeLessThan(content.length);
        });

        it('should use default maxLength of 5000', () => {
            const content = 'a'.repeat(4000);
            const result = truncateLargeDiff(content);
            expect(result).toBe(content);  // Under default limit
        });

        it('should truncate at line boundaries', () => {
            const content = 'line1\nline2\nline3\nline4\nline5';
            const result = truncateLargeDiff(content, 15);

            // Should not cut in the middle of a line
            expect(result.split('\n').every(line =>
                line === '' || !line.includes('line') || line.match(/^line\d$/) || line.includes('TRUNCATED')
            )).toBe(true);
        });

        it('should include truncation notice with size info', () => {
            const content = 'a'.repeat(6000);
            const result = truncateLargeDiff(content, 100);

            expect(result).toContain('TRUNCATED');
            expect(result).toContain('Original diff was');
            expect(result).toContain('6000');
        });
    });

    describe('truncateDiffByFiles', () => {
        it('should return original content if under maxDiffBytes', () => {
            const content = 'Small diff content';
            const result = truncateDiffByFiles(content, 1000);
            expect(result).toBe(content);
        });

        it('should handle single file diffs that are too large', () => {
            const largeDiff = `diff --git a/large.ts b/large.ts
${'a'.repeat(30000)}`;
            const result = truncateDiffByFiles(largeDiff, 1000);

            expect(result).toContain('diff --git a/large.ts');
            expect(result).toContain('CHANGE OMITTED');
            expect(result).toContain('File too large');
        });

        it('should process multiple files independently', () => {
            const multiFileDiff = `diff --git a/file1.ts b/file1.ts
${'a'.repeat(500)}
diff --git a/file2.ts b/file2.ts
${'b'.repeat(500)}`;

            const result = truncateDiffByFiles(multiFileDiff, 1000);

            expect(result).toContain('file1.ts');
            expect(result).toContain('file2.ts');
        });

        it('should omit files that exceed size limit', () => {
            const mixedDiff = `diff --git a/small.ts b/small.ts
+small change
diff --git a/large.ts b/large.ts
${'a'.repeat(30000)}`;

            const result = truncateDiffByFiles(mixedDiff, 1000);

            expect(result).toContain('small.ts');
            expect(result).toContain('large.ts');
            expect(result).toContain('CHANGE OMITTED');
        });

        it('should include summary of omitted files', () => {
            const largeDiff = `diff --git a/large.ts b/large.ts
${'a'.repeat(30000)}`;
            const result = truncateDiffByFiles(largeDiff, 1000);

            expect(result).toContain('SUMMARY');
            expect(result).toContain('files omitted');
        });

        it('should handle empty diff', () => {
            const result = truncateDiffByFiles('', 1000);
            expect(result).toBe('');
        });

        it('should handle diff without file headers', () => {
            const content = 'just some content without diff headers';
            const result = truncateDiffByFiles(content, 1000);
            expect(result).toBe(content);
        });
    });

    describe('getReviewExcludedPatterns', () => {
        it('should include all base patterns', () => {
            const basePatterns = ['node_modules', '.git'];
            const result = getReviewExcludedPatterns(basePatterns);

            expect(result).toContain('node_modules');
            expect(result).toContain('.git');
        });

        it('should add lock file exclusions', () => {
            const result = getReviewExcludedPatterns([]);

            expect(result).toContain('package-lock.json');
            expect(result).toContain('yarn.lock');
            expect(result).toContain('bun.lockb');
            expect(result).toContain('Cargo.lock');
        });

        it('should add image file exclusions', () => {
            const result = getReviewExcludedPatterns([]);

            expect(result).toContain('*.png');
            expect(result).toContain('*.jpg');
            expect(result).toContain('*.gif');
            expect(result).toContain('*.svg');
        });

        it('should add video and audio file exclusions', () => {
            const result = getReviewExcludedPatterns([]);

            expect(result).toContain('*.mp4');
            expect(result).toContain('*.mp3');
            expect(result).toContain('*.wav');
        });

        it('should add archive file exclusions', () => {
            const result = getReviewExcludedPatterns([]);

            expect(result).toContain('*.zip');
            expect(result).toContain('*.tar.gz');
            expect(result).toContain('*.rar');
        });

        it('should remove duplicate patterns', () => {
            const basePatterns = ['*.png', 'node_modules'];
            const result = getReviewExcludedPatterns(basePatterns);

            const pngCount = result.filter(p => p === '*.png').length;
            expect(pngCount).toBe(1);
        });
    });

    describe('getMinimalExcludedPatterns', () => {
        it('should remove critical patterns from base patterns', () => {
            const basePatterns = ['node_modules', 'package-lock.json', 'dist'];
            const result = getMinimalExcludedPatterns(basePatterns);

            expect(result).toContain('node_modules');
            expect(result).toContain('dist');
            expect(result).not.toContain('package-lock.json');
        });

        it('should remove yarn.lock from exclusions', () => {
            const basePatterns = ['yarn.lock', 'other'];
            const result = getMinimalExcludedPatterns(basePatterns);

            expect(result).toContain('other');
            expect(result).not.toContain('yarn.lock');
        });

        it('should remove .gitignore from exclusions', () => {
            const basePatterns = ['.gitignore', 'other'];
            const result = getMinimalExcludedPatterns(basePatterns);

            expect(result).not.toContain('.gitignore');
        });

        it('should remove .env.example from exclusions', () => {
            const basePatterns = ['.env.example', 'other'];
            const result = getMinimalExcludedPatterns(basePatterns);

            expect(result).not.toContain('.env.example');
        });

        it('should remove patterns containing critical file names', () => {
            const basePatterns = ['**/package-lock.json', 'other'];
            const result = getMinimalExcludedPatterns(basePatterns);

            expect(result).not.toContain('**/package-lock.json');
        });

        it('should return empty array when all patterns are critical', () => {
            const basePatterns = ['package-lock.json', 'yarn.lock'];
            const result = getMinimalExcludedPatterns(basePatterns);

            expect(result).toEqual([]);
        });
    });
});

