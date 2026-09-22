import { QuestionItem } from "../types";
import { seriesGenerator } from "./generators";

export function generateProceduralSeries(seed?: number): QuestionItem {
  return seriesGenerator.generate(seed);
}
