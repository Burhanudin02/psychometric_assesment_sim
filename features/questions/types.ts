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
  | "RAPID_ARITHMETIC"
  | "VISUAL_SEQUENCE"
  | "SHAPE_TRANSFORMATION"
  | "MATRIX_REASONING"
  | "ODD_ONE_OUT"
  | "VISUAL_ANALOGY"
  | "ROTATION_2D"
  | "MIRROR_TRANSFORMATION"
  | "SPATIAL_POSITION"
  | "CUBE_ORIENTATION";

export type Difficulty = "EASY" | "MODERATE" | "HARD" | "VERY_HARD";

export type QualityStatus = "DRAFT" | "ACTIVE" | "REVIEW_REQUIRED" | "DEPRECATED";

export type ImagePosition = "ABOVE_QUESTION" | "BELOW_QUESTION" | "INLINE";

export interface QuestionOption {
  id: string; // "A", "B", "C", "D"
  text?: string;
  svg?: string;
  image?: string;
  altText?: string;
}

export interface QuestionItem {
  id: string;
  domain: string;
  subtopic: string;
  questionType: QuestionType;
  difficulty: Difficulty;
  qualityStatus?: QualityStatus;
  prompt: string;
  svgData?: string | null;
  image?: string | null;
  imagePosition?: ImagePosition;
  options: QuestionOption[];
  correctAnswer: string;
  rule?: string;
  explanation: string;
  solvingStrategy: string;
  tags: string[];
  estimatedDifficulty: number;
  isProcedural?: boolean;
  generatorSeed?: string | null;
  active?: boolean;
  version?: number;
  reportCount?: number;
  lastReviewedAt?: string | null;
  lastReviewedBy?: string | null;
  reviewNote?: string | null;
  metadata?: Record<string, unknown> | null;
}
