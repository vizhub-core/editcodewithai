/**********************************************************************
 * benchmark.ts
 * --------------------------------------------------------------------
 * Requires environment variables to be set in a .env file
 * --------------------------------------------------------------------
 * Defines 5 challenges, each with index.js (ES module) that performs
 * a simple unit test. The code calls process.exit(0) on success or
 * process.exit(1) on failure.
 *
 * Runs all challenges on 5 different models:
 *    ["gpt3", "gpt4", "gpt5", "deepseek", "qwen32"]
 *
 * Writes final results to "results.csv" with columns:
 *    challenge, model, passFail, exitCode
 **********************************************************************/
import dotenv from "dotenv";
import { runAllChallenges } from "./benchmarkRunner";

// Load environment variables from .env file
dotenv.config();

// Run if invoked directly
if (require.main === module) {
  runAllChallenges().catch((error) => {
    console.error("Error running challenges:", error);
    process.exit(1);
  });
}

// Re-export for programmatic usage
export { runAllChallenges } from "./benchmarkRunner";
export { challenges } from "./challenges";
export { createOpenRouterLlmFunction } from "./llm";
export { runNodeTest } from "./runner";
export { writeChallengeFiles, writeResultsToCsv } from "./fileUtils";
