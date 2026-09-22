/**
 * Pacing Performance Dashboard Facade
 * Provides backward-compatible entry point re-exporting from modular pacing components.
 */
export {
  PacingPerformanceDashboard,
  type PacingPerformanceDashboardProps,
} from "./pacing/PacingPerformanceDashboard";
export * from "./pacing/PacingChartGeometry";
export * from "./pacing/PacingKpiCards";
export * from "./pacing/PacingDualLineChart";
export * from "./pacing/PacingModuleDetailCard";
export * from "./pacing/PacingDropRecoveryBanner";
export * from "./pacing/PacingDataTable";
