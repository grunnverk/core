import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    getTimestampedFilename,
    getTimestampedRequestFilename,
    getTimestampedResponseFilename,
    getTimestampedCommitFilename,
    getTimestampedReleaseNotesFilename,
    getTimestampedAudioFilename,
    getTimestampedTranscriptFilename,
    getTimestampedReviewFilename,
    getTimestampedReviewNotesFilename,
    getTimestampedArchivedAudioFilename,
    getTimestampedArchivedTranscriptFilename,
    getOutputPath,
    findDevelopmentBranch,
    haveSamePrereleaseTag,
    isDevelopmentVersion,
    isReleaseVersion,
    getExpectedVersionPattern,
    validateVersionForBranch,
} from '../../src/util/general';
import MockDate from 'mockdate';

// Mock the logger to prevent console output during tests
vi.mock('../../src/logging', () => ({
    getLogger: () => ({
        info: vi.fn(),
        warn: vi.fn(),
        verbose: vi.fn(),
        debug: vi.fn(),
        error: vi.fn(),
    }),
}));

describe('general utilities', () => {
    describe('timestamped filename utilities', () => {
        beforeEach(() => {
            // Mock date to 2026-01-15 10:30:45
            MockDate.set(new Date(2026, 0, 15, 10, 30, 45));
        });

        afterEach(() => {
            MockDate.reset();
        });

        it('should generate timestamped filename with default extension', () => {
            const filename = getTimestampedFilename('test');
            expect(filename).toMatch(/^\d{6}-\d{4}-test\.json$/);
            expect(filename).toBe('260115-1030-test.json');
        });

        it('should generate timestamped filename with custom extension', () => {
            const filename = getTimestampedFilename('test', '.md');
            expect(filename).toBe('260115-1030-test.md');
        });

        it('should generate request filename', () => {
            const filename = getTimestampedRequestFilename('api');
            expect(filename).toBe('260115-1030-api.request.json');
        });

        it('should generate response filename', () => {
            const filename = getTimestampedResponseFilename('api');
            expect(filename).toBe('260115-1030-api.response.json');
        });

        it('should generate commit filename', () => {
            const filename = getTimestampedCommitFilename();
            expect(filename).toBe('260115-1030-commit-message.md');
        });

        it('should generate release notes filename', () => {
            const filename = getTimestampedReleaseNotesFilename();
            expect(filename).toBe('260115-1030-release-notes.md');
        });

        it('should generate audio filename', () => {
            const filename = getTimestampedAudioFilename();
            expect(filename).toBe('260115-1030-audio-recording.wav');
        });

        it('should generate transcript filename', () => {
            const filename = getTimestampedTranscriptFilename();
            expect(filename).toBe('260115-1030-audio-transcript.md');
        });

        it('should generate review filename', () => {
            const filename = getTimestampedReviewFilename();
            expect(filename).toBe('260115-1030-review-analysis.md');
        });

        it('should generate review notes filename', () => {
            const filename = getTimestampedReviewNotesFilename();
            expect(filename).toBe('260115-1030-review-notes.md');
        });

        it('should generate archived audio filename with default extension', () => {
            const filename = getTimestampedArchivedAudioFilename();
            expect(filename).toBe('260115-1030-review-audio.wav');
        });

        it('should generate archived audio filename with custom extension', () => {
            const filename = getTimestampedArchivedAudioFilename('.mp3');
            expect(filename).toBe('260115-1030-review-audio.mp3');
        });

        it('should generate archived transcript filename', () => {
            const filename = getTimestampedArchivedTranscriptFilename();
            expect(filename).toBe('260115-1030-review-transcript.md');
        });
    });

    describe('getOutputPath', () => {
        it('should join directory and filename', () => {
            const path = getOutputPath('/output/dir', 'file.json');
            expect(path).toMatch(/output[\/\\]dir[\/\\]file\.json$/);
        });

        it('should handle relative directories', () => {
            const path = getOutputPath('output', 'file.txt');
            expect(path).toMatch(/output[\/\\]file\.txt$/);
        });
    });

    describe('findDevelopmentBranch', () => {
        it('should return null for undefined config', () => {
            expect(findDevelopmentBranch(undefined)).toBeNull();
        });

        it('should return null for null config', () => {
            expect(findDevelopmentBranch(null)).toBeNull();
        });

        it('should return null for non-object config', () => {
            expect(findDevelopmentBranch('string' as any)).toBeNull();
        });

        it('should return null when no development branch is configured', () => {
            const config = {
                main: { targetBranch: 'main' },
                feature: { targetBranch: 'main' },
            };
            expect(findDevelopmentBranch(config)).toBeNull();
        });

        it('should find the development branch', () => {
            const config = {
                main: { targetBranch: 'main' },
                working: { developmentBranch: true, targetBranch: 'main' },
            };
            expect(findDevelopmentBranch(config)).toBe('working');
        });

        it('should return first development branch when multiple exist', () => {
            const config = {
                dev1: { developmentBranch: true, targetBranch: 'main' },
                dev2: { developmentBranch: true, targetBranch: 'main' },
            };
            const result = findDevelopmentBranch(config);
            expect(['dev1', 'dev2']).toContain(result);
        });
    });

    describe('haveSamePrereleaseTag', () => {
        it('should return true for versions with same prerelease tag', () => {
            expect(haveSamePrereleaseTag('1.2.3-dev.0', '1.2.3-dev.5')).toBe(true);
            expect(haveSamePrereleaseTag('1.0.0-alpha.0', '2.0.0-alpha.10')).toBe(true);
        });

        it('should return false for versions with different prerelease tags', () => {
            expect(haveSamePrereleaseTag('1.2.3-dev.0', '1.2.3-test.0')).toBe(false);
            expect(haveSamePrereleaseTag('1.2.3-alpha.0', '1.2.3-beta.0')).toBe(false);
        });

        it('should return false when one version has no prerelease tag', () => {
            expect(haveSamePrereleaseTag('1.2.3', '1.2.3-dev.0')).toBe(false);
            expect(haveSamePrereleaseTag('1.2.3-dev.0', '1.2.3')).toBe(false);
        });

        it('should return false when both versions have no prerelease tag', () => {
            expect(haveSamePrereleaseTag('1.2.3', '1.2.4')).toBe(false);
        });

        it('should handle versions with v prefix', () => {
            expect(haveSamePrereleaseTag('v1.2.3-dev.0', 'v1.2.3-dev.5')).toBe(true);
            expect(haveSamePrereleaseTag('v1.2.3-dev.0', '1.2.3-dev.5')).toBe(true);
        });
    });

    describe('isDevelopmentVersion', () => {
        it('should return true for versions with prerelease tags', () => {
            expect(isDevelopmentVersion('1.2.3-dev.0')).toBe(true);
            expect(isDevelopmentVersion('1.0.0-alpha.1')).toBe(true);
            expect(isDevelopmentVersion('2.0.0-beta')).toBe(true);
        });

        it('should return false for release versions', () => {
            expect(isDevelopmentVersion('1.2.3')).toBe(false);
            expect(isDevelopmentVersion('0.0.1')).toBe(false);
            expect(isDevelopmentVersion('10.20.30')).toBe(false);
        });
    });

    describe('isReleaseVersion', () => {
        it('should return true for standard semver release versions', () => {
            expect(isReleaseVersion('1.2.3')).toBe(true);
            expect(isReleaseVersion('0.0.1')).toBe(true);
            expect(isReleaseVersion('10.20.30')).toBe(true);
        });

        it('should return false for prerelease versions', () => {
            expect(isReleaseVersion('1.2.3-dev.0')).toBe(false);
            expect(isReleaseVersion('1.0.0-alpha.1')).toBe(false);
        });

        it('should return false for versions with v prefix', () => {
            expect(isReleaseVersion('v1.2.3')).toBe(false);
        });
    });

    describe('getExpectedVersionPattern', () => {
        it('should return development pattern for working branch', () => {
            const pattern = getExpectedVersionPattern('working');
            expect(pattern.isDevelopment).toBe(true);
            expect(pattern.description).toContain('X.Y.Z-<tag>');
        });

        it('should return development pattern for dev branch', () => {
            const pattern = getExpectedVersionPattern('dev');
            expect(pattern.isDevelopment).toBe(true);
        });

        it('should return development pattern for feature branches', () => {
            const pattern = getExpectedVersionPattern('feature/new-feature');
            expect(pattern.isDevelopment).toBe(true);
        });

        it('should return release pattern for main branch', () => {
            const pattern = getExpectedVersionPattern('main');
            expect(pattern.isDevelopment).toBe(false);
            expect(pattern.description).toContain('X.Y.Z');
        });

        it('should return release pattern for master branch', () => {
            const pattern = getExpectedVersionPattern('master');
            expect(pattern.isDevelopment).toBe(false);
        });

        it('should return release pattern for production branch', () => {
            const pattern = getExpectedVersionPattern('production');
            expect(pattern.isDevelopment).toBe(false);
        });

        it('should return flexible pattern for other branches', () => {
            const pattern = getExpectedVersionPattern('random-branch');
            expect(pattern.isDevelopment).toBe(false);
            expect(pattern.description).toContain('or');
        });
    });

    describe('validateVersionForBranch', () => {
        it('should validate release version on main branch', () => {
            const result = validateVersionForBranch('1.2.3', 'main');
            expect(result.valid).toBe(true);
        });

        it('should invalidate development version on main branch', () => {
            const result = validateVersionForBranch('1.2.3-dev.0', 'main');
            expect(result.valid).toBe(false);
            // The function checks format first, so the issue may be about format or version type
            expect(result.issue).toBeDefined();
        });

        it('should validate development version on working branch', () => {
            const result = validateVersionForBranch('1.2.3-dev.0', 'working');
            expect(result.valid).toBe(true);
        });

        it('should invalidate release version on working branch', () => {
            const result = validateVersionForBranch('1.2.3', 'working');
            expect(result.valid).toBe(false);
            // The function checks format first, so the issue may be about format or version type
            expect(result.issue).toBeDefined();
        });

        it('should validate any version on generic branches', () => {
            expect(validateVersionForBranch('1.2.3', 'feature-branch').valid).toBe(true);
            expect(validateVersionForBranch('1.2.3-dev.0', 'some-branch').valid).toBe(true);
        });
    });
});

