import { QuestionItem } from "../types";
import { attentionGenerator } from "./generators";

export function generateProceduralAttention(): QuestionItem {
  return attentionGenerator.generate();
}
