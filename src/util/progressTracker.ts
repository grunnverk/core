/**
 * Progress tracking for long-running operations
 *
 * Provides structured progress updates for MCP integrations
 */

export interface ProgressUpdate {
    current: number;
    total: number;
    currentStep: string;
    completedSteps: string[];
    remainingPackages?: string[];
    percentage?: number;
}

export class ProgressTracker {
    private completedSteps: string[] = [];
    private currentStep: string = '';
    private current: number = 0;
    private total: number = 0;
    private remainingPackages: string[] = [];

    constructor(total: number = 0) {
        this.total = total;
    }

    /**
     * Set the total number of items
     */
    setTotal(total: number): void {
        this.total = total;
    }

    /**
     * Start a new step
     */
    startStep(stepName: string): void {
        this.currentStep = stepName;
    }

    /**
     * Complete the current step
     */
    completeStep(): void {
        if (this.currentStep) {
            this.completedSteps.push(this.currentStep);
            this.current++;
        }
    }

    /**
     * Set remaining packages
     */
    setRemainingPackages(packages: string[]): void {
        this.remainingPackages = packages;
    }

    /**
     * Get current progress
     */
    getProgress(): ProgressUpdate {
        return {
            current: this.current,
            total: this.total,
            currentStep: this.currentStep,
            completedSteps: [...this.completedSteps],
            remainingPackages: [...this.remainingPackages],
            percentage: this.total > 0 ? Math.round((this.current / this.total) * 100) : 0
        };
    }

    /**
     * Reset progress
     */
    reset(): void {
        this.completedSteps = [];
        this.currentStep = '';
        this.current = 0;
        this.remainingPackages = [];
    }

    /**
     * Create a progress update for a package execution
     */
    static forPackage(
        packageName: string,
        index: number,
        total: number,
        completedPackages: string[],
        remainingPackages: string[]
    ): ProgressUpdate {
        return {
            current: index,
            total: total,
            currentStep: `Processing: ${packageName}`,
            completedSteps: completedPackages.map(pkg => `Completed: ${pkg}`),
            remainingPackages: remainingPackages,
            percentage: total > 0 ? Math.round((index / total) * 100) : 0
        };
    }

    /**
     * Create a progress update for a build phase
     */
    static forPhase(
        phase: string,
        completedPhases: string[],
        totalPhases: number
    ): ProgressUpdate {
        return {
            current: completedPhases.length,
            total: totalPhases,
            currentStep: phase,
            completedSteps: completedPhases,
            percentage: totalPhases > 0 ? Math.round((completedPhases.length / totalPhases) * 100) : 0
        };
    }
}
