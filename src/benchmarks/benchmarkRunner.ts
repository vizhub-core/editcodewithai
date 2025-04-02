import { createOpenRouterLlmFunction } from "./llm";
import {
  writeChallengeFiles,
  writeResultsToCsv,
  ensureCacheDir,
  saveVisualizationOutput,
} from "./fileUtils";
import { runTest } from "./runner";
import { challenges } from "./challenges";
import { Challenge, ChallengeResult } from "./types"; // Import Challenge type
import { models } from "./models";
import path from "path";
import dotenv from "dotenv"; // Import dotenv
import { LocalFileCache } from "langchain/cache/file_system";
import { performAiEdit } from "..";

// Load environment variables
dotenv.config();

/**
 * Main function: runs the challenges on different models, calls the AI to fill them in,
 * executes each test, and writes pass/fail results to CSV.
 * This function seems deprecated or less used compared to runBenchmark in core.ts
 * Keeping it for reference but runBenchmark in core.ts is likely the primary one.
 */
export async function runAllChallenges() {
  const apiKey = process.env.OPENROUTER_API_KEY || "";
  if (!apiKey) {
    throw new Error("Please set OPENROUTER_API_KEY in your .env");
  }

  // Setup cache
  const cacheDirBase = path.join(process.cwd(), "benchmarks/llmResponseCache"); // Use cwd for consistency
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
      // Add failure results for remaining challenges for this model
      challenges.forEach((challenge) => {
        // Check if result already exists for this combo
        if (
          !results.some(
            (r) => r.challenge === challenge.name && r.model === model
          )
        ) {
          results.push({
            challenge: challenge.name,
            model,
            passFail: "error",
            testOutput: error instanceof Error ? error.message : String(error),
          });
        }
      });
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
      const startTime = Date.now();
      // Ask AI to fill out the placeholder TODOs
      const aiResult = await performAiEdit({
        prompt: challenge.prompt,
        files: challenge.files,
        llmFunction, // Pass the created function
        apiKey,
        baseURL: "https://openrouter.ai/api/v1", // Optional: Or configure within llmFunction
      });
      const duration = Date.now() - startTime;

      // Write returned files to disk, including LLM response
      const challengeDir = writeChallengeFiles(
        challenge.name,
        model,
        aiResult.changedFiles,
        aiResult.rawResponse
      );

      // Run the test
      const testResult = await runTest(challengeDir, challenge.type || "code");

      // Save visualization if applicable
      if (challenge.type === "visualization" && testResult.outputImage) {
        const imagePath = saveVisualizationOutput(
          challenge.name,
          model,
          testResult.outputImage
        );
        console.log(`Visualization saved to: ${imagePath}`);
      }

      // Record the result
      results.push({
        challenge: challenge.name,
        model,
        passFail: testResult.pass ? "pass" : "fail",
        testOutput: testResult.output,
        editOutput: aiResult.rawResponse || "",
        duration,
      });
    } catch (error) {
      console.error(
        `Error running challenge ${challenge.name} with model ${model}:`,
        error
      );
      results.push({
        challenge: challenge.name,
        model,
        passFail: "error",
        testOutput: error instanceof Error ? error.message : String(error),
      });
    }
  }
}

/**
 * Runs a specific set of challenges and models.
 * This seems to be the more actively used function based on core.ts and cli.ts
 */
export async function runBenchmark(
  challengesToRun: Challenge[], // Use Challenge type
  modelsToRun: string[], // Use specific name
  apiKey: string,
  options: {
    cacheEnabled?: boolean;
    outputDir?: string;
  } = {}
): Promise<ChallengeResult[]> {
  const results: ChallengeResult[] = [];
  const cacheDirBase = path.join(process.cwd(), "benchmarks/cache"); // Consistent cache location

  // Setup cache if enabled
  let cache;
  if (options.cacheEnabled) {
    ensureCacheDir(cacheDirBase);
    cache = await LocalFileCache.create(cacheDirBase);
  }

  for (const challenge of challengesToRun) {
    for (const model of modelsToRun) {
      console.log(`Running ${challenge.name} with ${model}...`);

      try {
        const startTime = Date.now();
        // Create LLM function for this model/run
        const llmFunction = createOpenRouterLlmFunction(model, apiKey, cache);

        // Perform AI edit
        const aiResult = await performAiEdit({
          files: challenge.files,
          prompt: challenge.prompt,
          llmFunction, // Pass the function
          apiKey,
          baseURL: "https://openrouter.ai/api/v1", // Optional: Or configure within llmFunction
        });
        const duration = Date.now() - startTime;

        // Write returned files to disk
        const challengeDir = writeChallengeFiles(
          challenge.name,
          model,
          aiResult.changedFiles,
          aiResult.rawResponse
        );

        // Run test based on challenge type
        const testResult = await runTest(
          challengeDir,
          challenge.type || "code"
        );

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
          editOutput: aiResult.rawResponse || "",
          duration: duration,
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
  writeResultsToCsv(results, outputPath); // Use the existing results array

  return results;
}

// Optional: Add main execution block if this file can be run directly
if (require.main === module) {
  runAllChallenges().catch((error) => {
    console.error("Benchmark runner failed:", error);
    process.exit(1);
  });
}
