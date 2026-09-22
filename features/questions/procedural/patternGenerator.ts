import { QuestionItem } from "../types";
import { patternGenerator } from "./generators";

export function generateProceduralPattern(): QuestionItem {
  return patternGenerator.generate();
}
