import { describe, it, expect } from 'vitest';
import { ProgressTracker } from '../src/util/progressTracker';

describe('ProgressTracker', () => {
    it('should initialize with total', () => {
        const tracker = new ProgressTracker(10);
        const progress = tracker.getProgress();

        expect(progress.total).toBe(10);
        expect(progress.current).toBe(0);
        expect(progress.percentage).toBe(0);
    });

    it('should track step progression', () => {
        const tracker = new ProgressTracker(3);

        tracker.startStep('Step 1');
        expect(tracker.getProgress().currentStep).toBe('Step 1');

        tracker.completeStep();
        expect(tracker.getProgress().current).toBe(1);
        expect(tracker.getProgress().completedSteps).toContain('Step 1');

        tracker.startStep('Step 2');
        tracker.completeStep();
        expect(tracker.getProgress().current).toBe(2);
        expect(tracker.getProgress().percentage).toBe(67); // Round(2/3 * 100)
    });

    it('should set total dynamically', () => {
        const tracker = new ProgressTracker();
        expect(tracker.getProgress().total).toBe(0);

        tracker.setTotal(5);
        expect(tracker.getProgress().total).toBe(5);
    });

    it('should track remaining packages', () => {
        const tracker = new ProgressTracker(5);
        tracker.setRemainingPackages(['pkg-a', 'pkg-b', 'pkg-c']);

        const progress = tracker.getProgress();
        expect(progress.remainingPackages).toEqual(['pkg-a', 'pkg-b', 'pkg-c']);
    });

    it('should reset progress', () => {
        const tracker = new ProgressTracker(5);
        tracker.startStep('Step 1');
        tracker.completeStep();
        tracker.setRemainingPackages(['pkg-a']);

        tracker.reset();

        const progress = tracker.getProgress();
        expect(progress.current).toBe(0);
        expect(progress.currentStep).toBe('');
        expect(progress.completedSteps).toHaveLength(0);
        expect(progress.remainingPackages).toHaveLength(0);
    });

    it('should calculate percentage correctly', () => {
        const tracker = new ProgressTracker(4);

        tracker.startStep('Step 1');
        tracker.completeStep();
        expect(tracker.getProgress().percentage).toBe(25);

        tracker.startStep('Step 2');
        tracker.completeStep();
        expect(tracker.getProgress().percentage).toBe(50);

        tracker.startStep('Step 3');
        tracker.completeStep();
        expect(tracker.getProgress().percentage).toBe(75);
    });

    it('should handle zero total gracefully', () => {
        const tracker = new ProgressTracker(0);
        tracker.startStep('Step 1');
        tracker.completeStep();

        expect(tracker.getProgress().percentage).toBe(0);
    });
});

describe('ProgressTracker.forPackage', () => {
    it('should create progress for package execution', () => {
        const progress = ProgressTracker.forPackage(
            '@org/pkg-c',
            3,
            10,
            ['@org/pkg-a', '@org/pkg-b'],
            ['@org/pkg-d', '@org/pkg-e']
        );

        expect(progress.currentStep).toBe('Processing: @org/pkg-c');
        expect(progress.current).toBe(3);
        expect(progress.total).toBe(10);
        expect(progress.completedSteps).toHaveLength(2);
        expect(progress.remainingPackages).toHaveLength(2);
        expect(progress.percentage).toBe(30);
    });
});

describe('ProgressTracker.forPhase', () => {
    it('should create progress for build phase', () => {
        const progress = ProgressTracker.forPhase(
            'Testing',
            ['Linting', 'Building'],
            5
        );

        expect(progress.currentStep).toBe('Testing');
        expect(progress.current).toBe(2);
        expect(progress.total).toBe(5);
        expect(progress.completedSteps).toEqual(['Linting', 'Building']);
        expect(progress.percentage).toBe(40);
    });
});
