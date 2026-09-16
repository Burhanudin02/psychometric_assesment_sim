import blueprintData from "@/data/curriculumBlueprint.json";

export interface CurriculumModule {
  moduleNumber: number;
  title: string;
  domain: string;
  subtopic: string;
  timeLimitSeconds: number;
  targetPaceSeconds: number;
  defaultItemCount: number;
  instructions: string;
  cognitiveFocus: string;
}

export function getCurriculumBlueprint(): CurriculumModule[] {
  return blueprintData as CurriculumModule[];
}

export function getModuleConfig(moduleNumber: number): CurriculumModule | undefined {
  const list = getCurriculumBlueprint();
  return list.find((m) => m.moduleNumber === moduleNumber);
}

export const DOMAIN_LABELS: Record<string, string> = {
  NUMERICAL_REASONING: "Numerical Reasoning",
  NUMBER_SERIES: "Number Series",
  VERBAL_REASONING: "Verbal Reasoning",
  LOGICAL_REASONING: "Logical Reasoning",
  ABSTRACT_REASONING: "Abstract / Figural Reasoning",
  SPATIAL_REASONING: "Spatial Reasoning",
  ATTENTION_CONCENTRATION: "Attention & Concentration",
  SPEED_ACCURACY: "Speed + Accuracy",
  MULTI_DOMAIN: "Mixed Cognitive Challenge",
  PAULI_KRAEPELIN: "Pauli/Kraepelin Drill (Historical)",
};
