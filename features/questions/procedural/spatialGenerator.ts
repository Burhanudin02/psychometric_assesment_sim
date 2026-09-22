import { QuestionItem } from "../types";
import { spatialGenerator } from "./generators";

export function generateProceduralSpatial(): QuestionItem {
  return spatialGenerator.generate();
}
