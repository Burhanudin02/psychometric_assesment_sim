import { defaultGeneratorRegistry } from "../core/GeneratorRegistry";
import { SeriesQuestionGenerator } from "./SeriesQuestionGenerator";
import { NumericalQuestionGenerator } from "./NumericalQuestionGenerator";
import { PatternQuestionGenerator } from "./PatternQuestionGenerator";
import { AttentionQuestionGenerator } from "./AttentionQuestionGenerator";
import { SpatialQuestionGenerator } from "./SpatialQuestionGenerator";

// Register default strategies into singleton registry
export const seriesGenerator = new SeriesQuestionGenerator();
export const numericalGenerator = new NumericalQuestionGenerator();
export const patternGenerator = new PatternQuestionGenerator();
export const attentionGenerator = new AttentionQuestionGenerator();
export const spatialGenerator = new SpatialQuestionGenerator();

defaultGeneratorRegistry.register(seriesGenerator);
defaultGeneratorRegistry.register(numericalGenerator);
defaultGeneratorRegistry.register(patternGenerator);
defaultGeneratorRegistry.register(attentionGenerator);
defaultGeneratorRegistry.register(spatialGenerator);

export {
  SeriesQuestionGenerator,
  NumericalQuestionGenerator,
  PatternQuestionGenerator,
  AttentionQuestionGenerator,
  SpatialQuestionGenerator,
};
