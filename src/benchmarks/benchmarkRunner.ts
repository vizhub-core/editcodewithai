import { LocalFileCache } from "@langchain/core/caches/file_system_cache";
import { performAiEdit } from "../ai/performAiEdit";
import { createOpenRouterLlmFunction } from "./llm";
import {
  writeChallengeFiles,
  writeResultsToCsv,
  ensureCacheDir,
  saveVisualizationOutput,
} from "./fileUtils";
import { runTest } from "./runner";
import { challenges } from "./challenges";
import {
  ChallengeResult,
  TestRunResult,
  PerformAiEditParams,
  PerformAiEditResult,
} from "./types";
import { models } from "./models";
import path from "path";

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
        apiKey,
        baseURL: "https://openrouter.ai/api/v1",
      });

      // Write returned files to disk, including LLM response
      const challengeDir = writeChallengeFiles(
        challenge.name,
        model,
        aiResult.changedFiles,
        aiResult.rawResponse
      );

      // Run index.js in a child process
      const exitCode = runTest(challengeDir, challenge.type || "code");
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

export async function runBenchmark(
  challenges: Challenge[],
  models: string[],
  apiKey: string,
  options: {
    cacheEnabled?: boolean;
    outputDir?: string;
  } = {}
): Promise<ChallengeResult[]> {
  const results: ChallengeResult[] = [];
  const cacheDirBase = path.join(process.cwd(), ".cache");
  const cache = options.cacheEnabled
    ? LocalFileCache.create(cacheDirBase)
    : undefined;

  for (const challenge of challenges) {
    for (const model of models) {
      console.log(`Running ${challenge.name} with ${model}...`);

      try {
        // Perform AI edit
        const editResult = await performAiEdit({
          files: challenge.files,
          prompt: challenge.prompt,
          model,
          apiKey,
          cache,
        });

        // Run test based on challenge type
        const testResult = await runNodeTest(editResult.outputDir);

        // For visualization challenges, save the output image
        if (challenge.type === "visualization" && testResult.outputImage) {
          const imagePath = saveVisualizationOutput(
            challenge.name,
            model,
            testResult.outputImage
          );
          console.log(`Visualization saved to: ${imagePath}`);
        }

        const result: ChallengeResult = {
          challenge: challenge.name,
          model,
          passFail: testResult.pass ? "pass" : "fail",
          testOutput: testResult.output,
          editOutput: editResult.output,
          duration: editResult.duration,
        };

        results.push(result);
      } catch (error) {
        console.error(`Error running ${challenge.name} with ${model}:`, error);
        results.push({
          challenge: challenge.name,
          model,
          passFail: "error",
          testOutput: error instanceof Error ? error.message : String(error),
          editOutput: "",
          duration: 0,
        });
      }
    }
  }

  // Write results to CSV
  const outputPath = options.outputDir
    ? path.join(options.outputDir, "results.csv")
    : "benchmarks/results.csv";
  writeResultsToCsv(results, outputPath);

  return results;
}
