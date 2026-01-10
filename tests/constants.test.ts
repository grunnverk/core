import { describe, it, expect } from 'vitest';
import {
    VERSION,
    PROGRAM_NAME,
    DEFAULT_CHARACTER_ENCODING,
    DEFAULT_BINARY_TO_TEXT_ENCODING,
    DEFAULT_DIFF,
    DEFAULT_LOG,
    DEFAULT_OVERRIDES,
    DATE_FORMAT_MONTH_DAY,
    DATE_FORMAT_YEAR,
    DATE_FORMAT_YEAR_MONTH,
    DATE_FORMAT_YEAR_MONTH_DAY,
    DATE_FORMAT_YEAR_MONTH_DAY_SLASH,
    DATE_FORMAT_YEAR_MONTH_DAY_HOURS_MINUTES,
    DATE_FORMAT_YEAR_MONTH_DAY_HOURS_MINUTES_SECONDS,
    DATE_FORMAT_YEAR_MONTH_DAY_HOURS_MINUTES_SECONDS_MILLISECONDS,
    DATE_FORMAT_SHORT_TIMESTAMP,
    DEFAULT_VERBOSE,
    DEFAULT_DRY_RUN,
    DEFAULT_DEBUG,
    DEFAULT_MODEL,
    DEFAULT_MODEL_STRONG,
    DEFAULT_OPENAI_REASONING,
    DEFAULT_OPENAI_MAX_OUTPUT_TOKENS,
    DEFAULT_OUTPUT_DIRECTORY,
    DEFAULT_GIT_COMMAND_MAX_BUFFER,
    DEFAULT_CONTEXT_DIRECTORIES,
    DEFAULT_CONFIG_DIR,
    DEFAULT_PREFERENCES_DIRECTORY,
    DEFAULT_FROM_COMMIT_ALIAS,
    DEFAULT_TO_COMMIT_ALIAS,
    DEFAULT_ADD,
    DEFAULT_CACHED,
    DEFAULT_SENDIT_MODE,
    DEFAULT_INTERACTIVE_MODE,
    DEFAULT_AMEND_MODE,
    DEFAULT_MESSAGE_LIMIT,
    DEFAULT_MAX_DIFF_BYTES,
    DEFAULT_MERGE_METHOD,
    DEFAULT_EXCLUDED_PATTERNS,
    COMMAND_COMMIT,
    COMMAND_AUDIO_COMMIT,
    COMMAND_SELECT_AUDIO,
    COMMAND_RELEASE,
    COMMAND_REVIEW,
    COMMAND_AUDIO_REVIEW,
    COMMAND_PUBLISH,
    COMMAND_TREE,
    COMMAND_LINK,
    COMMAND_UNLINK,
    COMMAND_CLEAN,
    COMMAND_PRECOMMIT,
    COMMAND_DEVELOPMENT,
    COMMAND_VERSIONS,
    COMMAND_UPDATES,
    ALLOWED_COMMANDS,
    DEFAULT_COMMAND,
    DEFAULT_INSTRUCTIONS_DIR,
    DEFAULT_PERSONA_DIR,
    DEFAULT_INSTRUCTIONS_MAP,
    DEFAULT_PERSONA_MAP,
    DEFAULT_PATH_SEPARATOR,
    DEFAULT_IGNORE_PATTERNS,
    DEFAULT_DIRECTORY_PREFIX,
    INTERNAL_DEFAULT_OUTPUT_FILE,
    INTERNAL_DATETIME_FORMAT,
    KODRDRIV_DEFAULTS,
} from '../src/constants';

describe('constants', () => {
    describe('version and program info', () => {
        it('should have VERSION defined', () => {
            expect(VERSION).toBeDefined();
            expect(typeof VERSION).toBe('string');
        });

        it('should have PROGRAM_NAME as kodrdriv', () => {
            expect(PROGRAM_NAME).toBe('kodrdriv');
        });
    });

    describe('encoding defaults', () => {
        it('should have utf-8 as default character encoding', () => {
            expect(DEFAULT_CHARACTER_ENCODING).toBe('utf-8');
        });

        it('should have base64 as default binary encoding', () => {
            expect(DEFAULT_BINARY_TO_TEXT_ENCODING).toBe('base64');
        });
    });

    describe('boolean defaults', () => {
        it('should have DEFAULT_DIFF as true', () => {
            expect(DEFAULT_DIFF).toBe(true);
        });

        it('should have DEFAULT_LOG as false', () => {
            expect(DEFAULT_LOG).toBe(false);
        });

        it('should have DEFAULT_OVERRIDES as false', () => {
            expect(DEFAULT_OVERRIDES).toBe(false);
        });

        it('should have DEFAULT_VERBOSE as false', () => {
            expect(DEFAULT_VERBOSE).toBe(false);
        });

        it('should have DEFAULT_DRY_RUN as false', () => {
            expect(DEFAULT_DRY_RUN).toBe(false);
        });

        it('should have DEFAULT_DEBUG as false', () => {
            expect(DEFAULT_DEBUG).toBe(false);
        });

        it('should have DEFAULT_ADD as false', () => {
            expect(DEFAULT_ADD).toBe(false);
        });

        it('should have DEFAULT_CACHED as false', () => {
            expect(DEFAULT_CACHED).toBe(false);
        });

        it('should have DEFAULT_SENDIT_MODE as false', () => {
            expect(DEFAULT_SENDIT_MODE).toBe(false);
        });

        it('should have DEFAULT_INTERACTIVE_MODE as false', () => {
            expect(DEFAULT_INTERACTIVE_MODE).toBe(false);
        });

        it('should have DEFAULT_AMEND_MODE as false', () => {
            expect(DEFAULT_AMEND_MODE).toBe(false);
        });
    });

    describe('date format constants', () => {
        it('should have proper date formats', () => {
            expect(DATE_FORMAT_MONTH_DAY).toBe('MM-DD');
            expect(DATE_FORMAT_YEAR).toBe('YYYY');
            expect(DATE_FORMAT_YEAR_MONTH).toBe('YYYY-MM');
            expect(DATE_FORMAT_YEAR_MONTH_DAY).toBe('YYYY-MM-DD');
            expect(DATE_FORMAT_YEAR_MONTH_DAY_SLASH).toBe('YYYY/MM/DD');
            expect(DATE_FORMAT_YEAR_MONTH_DAY_HOURS_MINUTES).toBe('YYYY-MM-DD-HHmm');
            expect(DATE_FORMAT_YEAR_MONTH_DAY_HOURS_MINUTES_SECONDS).toBe('YYYY-MM-DD-HHmmss');
            expect(DATE_FORMAT_YEAR_MONTH_DAY_HOURS_MINUTES_SECONDS_MILLISECONDS).toBe('YYYY-MM-DD-HHmmss.SSS');
            expect(DATE_FORMAT_SHORT_TIMESTAMP).toBe('YYMMdd-HHmm');
        });
    });

    describe('model defaults', () => {
        it('should have DEFAULT_MODEL as gpt-4o-mini', () => {
            expect(DEFAULT_MODEL).toBe('gpt-4o-mini');
        });

        it('should have DEFAULT_MODEL_STRONG as gpt-4o', () => {
            expect(DEFAULT_MODEL_STRONG).toBe('gpt-4o');
        });

        it('should have DEFAULT_OPENAI_REASONING as low', () => {
            expect(DEFAULT_OPENAI_REASONING).toBe('low');
        });

        it('should have DEFAULT_OPENAI_MAX_OUTPUT_TOKENS', () => {
            expect(DEFAULT_OPENAI_MAX_OUTPUT_TOKENS).toBe(10000);
        });
    });

    describe('directory defaults', () => {
        it('should have DEFAULT_OUTPUT_DIRECTORY', () => {
            expect(DEFAULT_OUTPUT_DIRECTORY).toBe('output/kodrdriv');
        });

        it('should have DEFAULT_CONFIG_DIR', () => {
            expect(DEFAULT_CONFIG_DIR).toBe('.kodrdriv');
        });

        it('should have DEFAULT_PREFERENCES_DIRECTORY in home directory', () => {
            expect(DEFAULT_PREFERENCES_DIRECTORY).toContain('.kodrdriv');
        });

        it('should have DEFAULT_CONTEXT_DIRECTORIES as empty array', () => {
            expect(DEFAULT_CONTEXT_DIRECTORIES).toEqual([]);
        });
    });

    describe('git defaults', () => {
        it('should have DEFAULT_FROM_COMMIT_ALIAS as main', () => {
            expect(DEFAULT_FROM_COMMIT_ALIAS).toBe('main');
        });

        it('should have DEFAULT_TO_COMMIT_ALIAS as HEAD', () => {
            expect(DEFAULT_TO_COMMIT_ALIAS).toBe('HEAD');
        });

        it('should have DEFAULT_GIT_COMMAND_MAX_BUFFER at 50MB', () => {
            expect(DEFAULT_GIT_COMMAND_MAX_BUFFER).toBe(50 * 1024 * 1024);
        });
    });

    describe('message and diff limits', () => {
        it('should have DEFAULT_MESSAGE_LIMIT', () => {
            expect(DEFAULT_MESSAGE_LIMIT).toBe(3);
        });

        it('should have DEFAULT_MAX_DIFF_BYTES', () => {
            expect(DEFAULT_MAX_DIFF_BYTES).toBe(20480); // 20KB
        });
    });

    describe('merge method', () => {
        it('should have DEFAULT_MERGE_METHOD as squash', () => {
            expect(DEFAULT_MERGE_METHOD).toBe('squash');
        });
    });

    describe('excluded patterns', () => {
        it('should include common exclusions', () => {
            expect(DEFAULT_EXCLUDED_PATTERNS).toContain('node_modules');
            expect(DEFAULT_EXCLUDED_PATTERNS).toContain('package-lock.json');
            expect(DEFAULT_EXCLUDED_PATTERNS).toContain('dist');
            expect(DEFAULT_EXCLUDED_PATTERNS).toContain('.git');
            expect(DEFAULT_EXCLUDED_PATTERNS).toContain('.env');
        });

        it('should be an array', () => {
            expect(Array.isArray(DEFAULT_EXCLUDED_PATTERNS)).toBe(true);
        });
    });

    describe('command constants', () => {
        it('should have all command names defined', () => {
            expect(COMMAND_COMMIT).toBe('commit');
            expect(COMMAND_AUDIO_COMMIT).toBe('audio-commit');
            expect(COMMAND_SELECT_AUDIO).toBe('select-audio');
            expect(COMMAND_RELEASE).toBe('release');
            expect(COMMAND_REVIEW).toBe('review');
            expect(COMMAND_AUDIO_REVIEW).toBe('audio-review');
            expect(COMMAND_PUBLISH).toBe('publish');
            expect(COMMAND_TREE).toBe('tree');
            expect(COMMAND_LINK).toBe('link');
            expect(COMMAND_UNLINK).toBe('unlink');
            expect(COMMAND_CLEAN).toBe('clean');
            expect(COMMAND_PRECOMMIT).toBe('precommit');
            expect(COMMAND_DEVELOPMENT).toBe('development');
            expect(COMMAND_VERSIONS).toBe('versions');
            expect(COMMAND_UPDATES).toBe('updates');
        });

        it('should have ALLOWED_COMMANDS as array containing all commands', () => {
            expect(Array.isArray(ALLOWED_COMMANDS)).toBe(true);
            expect(ALLOWED_COMMANDS).toContain(COMMAND_COMMIT);
            expect(ALLOWED_COMMANDS).toContain(COMMAND_RELEASE);
            expect(ALLOWED_COMMANDS).toContain(COMMAND_PUBLISH);
        });

        it('should have DEFAULT_COMMAND as commit', () => {
            expect(DEFAULT_COMMAND).toBe('commit');
        });
    });

    describe('instructions and personas', () => {
        it('should have DEFAULT_INSTRUCTIONS_DIR', () => {
            expect(DEFAULT_INSTRUCTIONS_DIR).toBe('instructions');
        });

        it('should have DEFAULT_PERSONA_DIR', () => {
            expect(DEFAULT_PERSONA_DIR).toBe('personas');
        });

        it('should have DEFAULT_INSTRUCTIONS_MAP', () => {
            expect(DEFAULT_INSTRUCTIONS_MAP).toBeDefined();
            expect(DEFAULT_INSTRUCTIONS_MAP[COMMAND_COMMIT]).toContain('commit.md');
        });

        it('should have DEFAULT_PERSONA_MAP', () => {
            expect(DEFAULT_PERSONA_MAP).toBeDefined();
            expect(DEFAULT_PERSONA_MAP[COMMAND_COMMIT]).toContain('you.md');
        });
    });

    describe('misc constants', () => {
        it('should have DEFAULT_PATH_SEPARATOR', () => {
            expect(DEFAULT_PATH_SEPARATOR).toBe('/');
        });

        it('should have DEFAULT_IGNORE_PATTERNS', () => {
            expect(Array.isArray(DEFAULT_IGNORE_PATTERNS)).toBe(true);
            expect(DEFAULT_IGNORE_PATTERNS).toContain('node_modules/**');
            expect(DEFAULT_IGNORE_PATTERNS).toContain('.git/**');
        });

        it('should have DEFAULT_DIRECTORY_PREFIX', () => {
            expect(DEFAULT_DIRECTORY_PREFIX).toBe('.kodrdriv');
        });

        it('should have INTERNAL_DEFAULT_OUTPUT_FILE', () => {
            expect(INTERNAL_DEFAULT_OUTPUT_FILE).toBe('output.txt');
        });

        it('should have INTERNAL_DATETIME_FORMAT', () => {
            expect(INTERNAL_DATETIME_FORMAT).toBe('YYYY-MM-DD_HH-mm-ss');
        });
    });

    describe('KODRDRIV_DEFAULTS', () => {
        it('should be a comprehensive config object', () => {
            expect(KODRDRIV_DEFAULTS).toBeDefined();
            expect(typeof KODRDRIV_DEFAULTS).toBe('object');
        });

        it('should have root level defaults', () => {
            expect(KODRDRIV_DEFAULTS.dryRun).toBe(false);
            expect(KODRDRIV_DEFAULTS.verbose).toBe(false);
            expect(KODRDRIV_DEFAULTS.debug).toBe(false);
            expect(KODRDRIV_DEFAULTS.model).toBe('gpt-4o-mini');
        });

        it('should have commit defaults', () => {
            expect(KODRDRIV_DEFAULTS.commit).toBeDefined();
            expect(KODRDRIV_DEFAULTS.commit.add).toBe(false);
            expect(KODRDRIV_DEFAULTS.commit.cached).toBe(false);
            expect(KODRDRIV_DEFAULTS.commit.sendit).toBe(false);
        });

        it('should have release defaults', () => {
            expect(KODRDRIV_DEFAULTS.release).toBeDefined();
            expect(KODRDRIV_DEFAULTS.release.from).toBe('main');
            expect(KODRDRIV_DEFAULTS.release.to).toBe('HEAD');
        });

        it('should have review defaults', () => {
            expect(KODRDRIV_DEFAULTS.review).toBeDefined();
            expect(KODRDRIV_DEFAULTS.review.includeCommitHistory).toBe(true);
            expect(KODRDRIV_DEFAULTS.review.includeRecentDiffs).toBe(true);
        });

        it('should have publish defaults', () => {
            expect(KODRDRIV_DEFAULTS.publish).toBeDefined();
            expect(KODRDRIV_DEFAULTS.publish.mergeMethod).toBe('squash');
            expect(KODRDRIV_DEFAULTS.publish.targetBranch).toBe('main');
        });

        it('should have branches config', () => {
            expect(KODRDRIV_DEFAULTS.branches).toBeDefined();
            expect(KODRDRIV_DEFAULTS.branches.working).toBeDefined();
            expect(KODRDRIV_DEFAULTS.branches.main).toBeDefined();
        });

        it('should have excluded patterns', () => {
            expect(KODRDRIV_DEFAULTS.excludedPatterns).toEqual(DEFAULT_EXCLUDED_PATTERNS);
        });
    });
});

