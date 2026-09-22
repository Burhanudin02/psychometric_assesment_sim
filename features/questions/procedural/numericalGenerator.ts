import { QuestionItem } from "../types";
import { numericalGenerator } from "./generators";

export function generateProceduralNumerical(seed?: number): QuestionItem {
  return numericalGenerator.generate(seed);
}
