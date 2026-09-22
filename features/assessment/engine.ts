/**
 * Assessment Engine Facade
 * Delegates domain operations to specialized assessment services (SRP, DIP, Modularity).
 */
export {
  type AnswerSubmissionItem,
  gradeAndPersistModuleAttempts,
  computeSessionMetricsFromDb,
} from "./services/assessmentGradingService";

export {
  createAssessmentSession,
  getActiveSessionState,
  submitModuleAnswersInternal,
  finalizeAssessmentSession,
} from "./services/assessmentSessionService";

export {
  logIntegrityEvent,
  terminateAssessmentSession,
  type TerminateSessionParams,
  type TerminationResult,
} from "./services/assessmentIntegrityService";
