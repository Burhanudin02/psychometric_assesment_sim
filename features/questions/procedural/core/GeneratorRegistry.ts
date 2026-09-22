import { QuestionType } from "@prisma/client";
import { QuestionItem } from "@/features/questions/types";
import { IGeneratorRegistry, IProceduralQuestionGenerator } from "./types";

/**
 * Open/Closed Principle (OCP) & Strategy Pattern:
 * The GeneratorRegistry allows registering new question generation strategies dynamically
 * without modifying any caller code.
 */
export class GeneratorRegistry implements IGeneratorRegistry {
  private generators = new Map<string, IProceduralQuestionGenerator>();

  register(generator: IProceduralQuestionGenerator): void {
    this.generators.set(generator.questionType, generator);
  }

  getGenerator(questionType: QuestionType): IProceduralQuestionGenerator | undefined {
    return this.generators.get(questionType);
  }

  getGeneratorsByDomain(domain: string): IProceduralQuestionGenerator[] {
    return Array.from(this.generators.values()).filter((g) => g.domain === domain);
  }

  generate(questionType: QuestionType, seed?: number): QuestionItem {
    const generator = this.getGenerator(questionType);
    if (!generator) {
      throw new Error(`Tidak ditemukan generator prosedural untuk tipe: ${questionType}`);
    }
    return generator.generate(seed);
  }

  getAllGenerators(): IProceduralQuestionGenerator[] {
    return Array.from(this.generators.values());
  }
}

export const defaultGeneratorRegistry = new GeneratorRegistry();

