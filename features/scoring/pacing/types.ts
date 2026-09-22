export interface ModulePerformanceItem {
  moduleNumber: number;
  title: string;
  domain: string;
  domainLabel: string;
  subtopic: string;
  total: number;
  answered: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  accuracy: number | null; // null if not attempted
  medianResponseTimeMs: number | null; // null if not attempted
  averageResponseTimeMs: number | null;
  timedOut: boolean;
  isAttempted: boolean;
}

export interface PacingPhaseMetrics {
  name: string;
  rangeLabel: string;
  moduleNumbers: number[];
  attemptedCount: number;
  accuracy: number | null;
  medianResponseTimeMs: number | null;
  timeoutCount: number;
}

export interface PerformanceDropInfo {
  fromModule: number;
  toModule: number;
  fromTitle: string;
  toTitle: string;
  accuracyDropPp: number;
  speedSlowdownSec: number;
  combinedDropScore: number;
  description: string;
}

export interface LateRecoveryInfo {
  hasRecovered: boolean;
  recoveryDeltaPp: number;
  description: string;
}

export interface PacingMetricsSummary {
  modules: ModulePerformanceItem[];
  // Baseline (M01-M05 or attempted up to 5)
  baselineModuleCount: number;
  baselineAccuracy: number | null;
  baselineMedianResponseTimeMs: number | null;
  // Phases
  earlyPhase: PacingPhaseMetrics; // M01-M07
  middlePhase: PacingPhaseMetrics; // M08-M14
  latePhase: PacingPhaseMetrics; // M15-M21
  // Early vs Late Comparison
  deltaAccuracyPp: number | null;
  deltaResponseTimeSec: number | null;
  deltaTimeoutCount: number;
  // Drop and Recovery Detection
  largestDrop: PerformanceDropInfo | null;
  recovery: LateRecoveryInfo | null;
  // Overall Summary across attempted modules
  attemptedModuleCount: number;
  overallAccuracy: number;
  overallMedianResponseTimeMs: number;
  totalTimeouts: number;
  stabilityScore: number; // 0-100 (100 = perfectly consistent accuracy)
  // Automated neutral text insights
  insights: string[];
}

export interface RawAttemptLike {
  moduleNumber: number;
  domain?: string;
  isAnswered: boolean;
  isCorrect: boolean;
  responseTimeMs: number;
  isTimedOut: boolean;
}
