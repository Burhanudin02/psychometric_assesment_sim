import { QuestionItem } from "@/features/questions/types";
import { QuestionType } from "@prisma/client";

/**
 * Interface Segregation & Liskov Substitution:
 * Contract for any procedural question generator strategy.
 */
export interface IProceduralQuestionGenerator {
  readonly domain: string;
  readonly questionType: QuestionType;
  readonly subtopics: readonly string[];
  generate(seed?: number): QuestionItem;
}

/**
 * Dependency Inversion & Open/Closed Principle:
 * Registry interface for managing dynamic procedural question generators.
 */
export interface IGeneratorRegistry {
  register(generator: IProceduralQuestionGenerator): void;
  getGenerator(questionType: QuestionType): IProceduralQuestionGenerator | undefined;
  getGeneratorsByDomain(domain: string): IProceduralQuestionGenerator[];
  generate(questionType: QuestionType, seed?: number): QuestionItem;
  getAllGenerators(): IProceduralQuestionGenerator[];
}

