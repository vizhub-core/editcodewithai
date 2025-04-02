#!/usr/bin/env node
import dotenv from "dotenv";
import { runBenchmark, startGraderUI } from "./core";
import { ensureCacheDir } from "../benchmarks/fileUtils";
import { Challenge } from "./types"; // Import Challenge type
import { challenges } from "./challenges";
import { models as defaultModels } from "./models";

// Load environment variables
dotenv.config();

const args = process.argv.slice(2);
const command = args[0] || "run";

// Helper function to parse command line arguments
const getArgValue = (flag: string): string | undefined => {
  const index = args.findIndex((arg) => arg === flag);
  return index !== -1 && index < args.length - 1 ? args[index + 1] : undefined;
};

const hasFlag = (flag: string): boolean => {
  return args.includes(flag);
};

/**
 * Run benchmarks command
 */
const runBenchmarkCommand = async () => {
  // Parse CLI options
  const challenge = getArgValue("--challenge");
  const modelStr = getArgValue("--models");
  const useCache = getArgValue("--cache") !== "false";

  // Set up models
  const models = modelStr ? modelStr.split(",") : defaultModels;

  console.log("Running benchmark...");
  console.log("Challenge:", challenge || "all challenges");
  console.log("Models:", models.join(", "));
  console.log("Cache enabled:", useCache);

  // Ensure cache directory exists if cache is enabled
  if (useCache) {
    ensureCacheDir("benchmarks/cache");
  }

  try {
    // Get API key from environment
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("Please set OPENROUTER_API_KEY in your .env file");
    }

    // Filter challenges if specified - Added type for 'c'
    const challengesToRun = challenge
      ? challenges.filter((c: Challenge) => c.name === challenge)
      : challenges;

    if (challenge && challengesToRun.length === 0) {
      throw new Error(`Challenge "${challenge}" not found`);
    }

    await runBenchmark(challengesToRun, models, apiKey, {
      cacheEnabled: useCache,
      outputDir: "benchmarks/results",
    });

    console.log("Benchmark completed successfully!");
  } catch (error) {
    console.error("Error running benchmark:", error);
    process.exit(1);
  }
};

/**
 * Start the grader UI
 */
const startGraderCommand = () => {
  // Parse CLI options
  const challenge = getArgValue("--challenge");
  const port = parseInt(getArgValue("--port") || "3001", 10);

  console.log("Starting grader UI...");
  if (challenge) {
    console.log("Filtering by challenge:", challenge);
  }

  // Start the server and open the browser
  const server = startGraderUI(port, challenge);

  // Handle shutdown
  process.on("SIGINT", () => {
    console.log("\nShutting down grader server...");
    server.close(() => {
      console.log("Server closed");
      process.exit(0);
    });
  });
};

// Execute the appropriate command
switch (command) {
  case "run":
    runBenchmarkCommand();
    break;
  case "grade":
    startGraderCommand();
    break;
  case "help":
    console.log(`
Benchmark CLI tool

Commands:
  run                           Run benchmarks
    --challenge <challenge>     Run a specific challenge
    --models <model1,model2>    Specify models to use
    --cache                     Enable caching

  grade                         Launch the grader UI
    --challenge <challenge>     Filter by challenge
    --port <port>               Specify server port (default: 3001)

  help                          Show this help message
    `);
    break;
  default:
    console.error(`Unknown command: ${command}`);
    console.log('Use "help" to see available commands');
    process.exit(1);
}
