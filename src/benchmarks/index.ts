/**********************************************************************
 * benchmark.ts
 * --------------------------------------------------------------------
 * Requires environment variables to be set in a .env file
 * --------------------------------------------------------------------
 * Defines 5 challenges, each with index.js (ES module) that performs
 * a simple unit test. The code calls process.exit(0) on success or
 * process.exit(1) on failure.
 *
 * Runs all challenges on different models from the models.ts file
 *
 * Writes final results to "results.csv" with columns:
 *    challenge, model, passFail
 **********************************************************************/
import dotenv from "dotenv";
import { challenges } from "./challenges";
import { models } from "./models";
import { runBenchmark } from "./core";

// Load environment variables from .env file
dotenv.config();

// Run if invoked directly
if (require.main === module) {
  const apiKey = process.env.OPENROUTER_API_KEY || "";
  if (!apiKey) {
    throw new Error("Please set OPENROUTER_API_KEY in your .env");
  }

  runBenchmark(challenges, models, apiKey).catch((error) => {
    console.error("Error running challenges:", error);
    process.exit(1);
  });
}

// Re-export for programmatic usage
export { runBenchmark, runTest, startGraderUI } from "./core";
export { challenges } from "./challenges";
export { models } from "./models";
export { createOpenRouterLlmFunction } from "./llm";
export {
  writeChallengeFiles,
  writeResultsToCsv,
  readResultsFromCsv,
  ensureCacheDir,
  saveVisualizationOutput,
} from "./fileUtils";
