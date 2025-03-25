import { LocalFileCache } from "langchain/cache/file_system";
import { performAiEdit } from "../index";
import { createOpenRouterLlmFunction } from "./llm";
import {
  writeChallengeFiles,
  writeResultsToCsv,
  ensureCacheDir,
} from "./fileUtils";
import { runNodeTest } from "./runner";
import { challenges } from "./challenges";
import { ChallengeResult } from "./types";
import { models } from "./models";

/**
 * Main function: runs the challenges on different models, calls the AI to fill them in,
 * executes each test, and writes pass/fail results to CSV.
 */
export async function runAllChallenges() {
  const apiKey = process.env.OPENROUTER_API_KEY || "";
  if (!apiKey) {
    throw new Error("Please set OPENROUTER_API_KEY in your .env");
  }

  // Setup cache
  const cacheDirBase = "benchmarks/llmResponseCache";
  ensureCacheDir(cacheDirBase);
  const cache = await LocalFileCache.create(cacheDirBase);

  // Store results
  const results: ChallengeResult[] = [];

  // Run each model against each challenge
  for (const model of models) {
    try {
      await runModelChallenges(model, apiKey, cache, results);
    } catch (error) {
      console.error(`Error running model ${model}:`, error);
      // Add failure results for remaining challenges
      for (const challenge of challenges) {
        results.push({
          challenge: challenge.name,
          model,
          passFail: "error",
        });
      }
    }
  }

  // Write results to CSV
  const csv = writeResultsToCsv(results, "benchmarks/results.csv");

  console.log(
    "\nAll challenges completed. See 'benchmarks/results.csv' for summary.\n"
  );
  console.log(csv);
}

/**
 * Runs all challenges for a specific model
 */
async function runModelChallenges(
  model: string,
  apiKey: string,
  cache: LocalFileCache,
  results: ChallengeResult[]
): Promise<void> {
  // Create the LLM function for this model
  const llmFunction = createOpenRouterLlmFunction(model, apiKey, cache);

  // Run each challenge for this model
  for (const challenge of challenges) {
    console.log(`\n=== Challenge: ${challenge.name} | Model: ${model} ===`);

    try {
      // Ask AI to fill out the placeholder TODOs
      const aiResult = await performAiEdit({
        prompt: challenge.prompt,
        files: challenge.files,
        llmFunction,
      });

      // Write returned files to disk, including LLM response
      const challengeDir = writeChallengeFiles(
        challenge.name,
        model,
        aiResult.changedFiles,
        aiResult.rawResponse
      );

      // Run index.js in a child process
      const exitCode = runNodeTest(challengeDir);
      const passFail = exitCode === 0 ? "pass" : "fail";

      // Record the result
      results.push({
        challenge: challenge.name,
        model,
        passFail,
      });
    } catch (error) {
      console.error(`Error running challenge ${challenge.name}:`, error);
      results.push({
        challenge: challenge.name,
        model,
        passFail: "error",
      });
    }
  }
}
