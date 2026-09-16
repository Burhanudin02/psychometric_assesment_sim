export type QuestionType =
  | "TEXT_MCQ"
  | "NUMERICAL_MCQ"
  | "NUMBER_SERIES"
  | "LOGICAL_STATEMENT"
  | "VERBAL_ANALOGY"
  | "VERBAL_CLASSIFICATION"
  | "SVG_PATTERN"
  | "SVG_MATRIX"
  | "SPATIAL_ROTATION"
  | "SYMBOL_SCANNING"
  | "RAPID_ARITHMETIC";

export type Difficulty = "EASY" | "MODERATE" | "HARD" | "VERY_HARD";

export interface QuestionOption {
  id: string; // "A", "B", "C", "D"
  text?: string;
  svg?: string;
}

export interface QuestionItem {
  id: string;
  domain: string;
  subtopic: string;
  questionType: QuestionType;
  difficulty: Difficulty;
  prompt: string;
  svgData?: string | null;
  options: QuestionOption[];
  correctAnswer: string;
  explanation: string;
  solvingStrategy: string;
  tags: string[];
  estimatedDifficulty: number;
  isProcedural?: boolean;
  generatorSeed?: string | null;
  active?: boolean;
  version?: number;
  metadata?: Record<string, unknown> | null;
}
