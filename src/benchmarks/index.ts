/**********************************************************************
 * Runs all challenges on different models from the models.ts file
 *
 * Writes final results to "results.csv" with columns:
 *    challenge, model, passFail
 **********************************************************************/
import dotenv from "dotenv";
import { challenges } from "./challenges";
import { models } from "./models";
import { runBenchmark, runTest, startGraderUI } from "./core"; // Import startGraderUI

// Load environment variables from .env file
dotenv.config();

// Main execution block (optional, if you want `npm start` to run benchmarks)
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

// Export necessary functions and variables
export { runBenchmark, runTest, startGraderUI }; // Export startGraderUI
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
