import { describe, it, expect } from 'vitest';
import { validateReleaseSummary, validateTranscriptionResult, sanitizeDirection } from '../../src/util/validation';

describe('validation utilities', () => {
    describe('validateReleaseSummary', () => {
        it('should return a valid ReleaseSummary when given valid data', () => {
            const data = { title: 'Release 1.0', body: 'Initial release' };
            const result = validateReleaseSummary(data);
            expect(result).toEqual(data);
            expect(result.title).toBe('Release 1.0');
            expect(result.body).toBe('Initial release');
        });

        it('should throw error for null input', () => {
            expect(() => validateReleaseSummary(null)).toThrow('Invalid release summary: not an object');
        });

        it('should throw error for undefined input', () => {
            expect(() => validateReleaseSummary(undefined)).toThrow('Invalid release summary: not an object');
        });

        it('should throw error for non-object input', () => {
            expect(() => validateReleaseSummary('string')).toThrow('Invalid release summary: not an object');
            expect(() => validateReleaseSummary(123)).toThrow('Invalid release summary: not an object');
        });

        it('should throw error when title is missing', () => {
            expect(() => validateReleaseSummary({ body: 'body' })).toThrow('Invalid release summary: title must be a string');
        });

        it('should throw error when title is not a string', () => {
            expect(() => validateReleaseSummary({ title: 123, body: 'body' })).toThrow('Invalid release summary: title must be a string');
        });

        it('should throw error when body is missing', () => {
            expect(() => validateReleaseSummary({ title: 'title' })).toThrow('Invalid release summary: body must be a string');
        });

        it('should throw error when body is not a string', () => {
            expect(() => validateReleaseSummary({ title: 'title', body: 123 })).toThrow('Invalid release summary: body must be a string');
        });

        it('should allow empty strings for title and body', () => {
            const data = { title: '', body: '' };
            const result = validateReleaseSummary(data);
            expect(result).toEqual(data);
        });
    });

    describe('validateTranscriptionResult', () => {
        it('should return a valid TranscriptionResult when given valid data', () => {
            const data = { text: 'Transcribed text' };
            const result = validateTranscriptionResult(data);
            expect(result).toEqual(data);
            expect(result.text).toBe('Transcribed text');
        });

        it('should allow additional properties', () => {
            const data = { text: 'Transcribed text', duration: 120, language: 'en' };
            const result = validateTranscriptionResult(data);
            expect(result.text).toBe('Transcribed text');
            expect(result.duration).toBe(120);
            expect(result.language).toBe('en');
        });

        it('should throw error for null input', () => {
            expect(() => validateTranscriptionResult(null)).toThrow('Invalid transcription result: not an object');
        });

        it('should throw error for undefined input', () => {
            expect(() => validateTranscriptionResult(undefined)).toThrow('Invalid transcription result: not an object');
        });

        it('should throw error for non-object input', () => {
            expect(() => validateTranscriptionResult('string')).toThrow('Invalid transcription result: not an object');
            expect(() => validateTranscriptionResult(123)).toThrow('Invalid transcription result: not an object');
        });

        it('should throw error when text is missing', () => {
            expect(() => validateTranscriptionResult({ duration: 120 })).toThrow('Invalid transcription result: text property must be a string');
        });

        it('should throw error when text is not a string', () => {
            expect(() => validateTranscriptionResult({ text: 123 })).toThrow('Invalid transcription result: text property must be a string');
        });

        it('should allow empty string for text', () => {
            const data = { text: '' };
            const result = validateTranscriptionResult(data);
            expect(result.text).toBe('');
        });
    });

    describe('sanitizeDirection', () => {
        it('should return undefined for undefined input', () => {
            expect(sanitizeDirection(undefined)).toBeUndefined();
        });

        it('should return undefined for empty string', () => {
            expect(sanitizeDirection('')).toBeUndefined();
        });

        it('should preserve simple strings', () => {
            expect(sanitizeDirection('focus on bug fixes')).toBe('focus on bug fixes');
        });

        it('should replace newlines with spaces', () => {
            expect(sanitizeDirection('line1\nline2')).toBe('line1 line2');
            expect(sanitizeDirection('line1\r\nline2')).toBe('line1 line2');
        });

        it('should collapse multiple whitespace', () => {
            expect(sanitizeDirection('word1   word2')).toBe('word1 word2');
            expect(sanitizeDirection('word1\t\tword2')).toBe('word1 word2');
        });

        it('should trim leading and trailing whitespace', () => {
            expect(sanitizeDirection('  trimmed  ')).toBe('trimmed');
        });

        it('should truncate long strings', () => {
            const longString = 'a'.repeat(3000);
            const result = sanitizeDirection(longString);
            expect(result).not.toBeUndefined();
            expect(result!.length).toBe(2000);
            expect(result!.endsWith('...')).toBe(true);
        });

        it('should respect custom maxLength', () => {
            const longString = 'a'.repeat(100);
            const result = sanitizeDirection(longString, 50);
            expect(result!.length).toBe(50);
            expect(result!.endsWith('...')).toBe(true);
        });

        it('should not truncate strings at exact maxLength', () => {
            const exactString = 'a'.repeat(2000);
            const result = sanitizeDirection(exactString);
            expect(result).toBe(exactString);
        });

        it('should handle combined sanitization and truncation', () => {
            const messyString = '\n  ' + 'a'.repeat(3000) + '  \n';
            const result = sanitizeDirection(messyString);
            expect(result!.length).toBe(2000);
            expect(result!.startsWith('a')).toBe(true);
            expect(result!.endsWith('...')).toBe(true);
        });
    });
});

