
/**********************************************************************
 * benchmark.ts
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
import { VizFiles } from "@vizhub/viz-types";
import { performAiEdit } from "./index"; // Your AI editing pipeline
import { LlmFunction } from "./types";   // Type describing your LLM function
import { ChatOpenAI, ChatOpenAIFields } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { LocalFileCache } from "langchain/cache/file_system";
import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";

// 1) Define the LLM function builder for your environment.
//    We'll keep it general, using the "model" string as a placeholder.
function createOpenRouterLlmFunction(model: string, apiKey: string, cache?: LocalFileCache): LlmFunction {
  return async (prompt: string) => {
    // For demonstration, we're using ChatOpenAI from 'langchain', but the model param is a placeholder
    const chatModel = new ChatOpenAI(<ChatOpenAIFields>{
      modelName: model, // e.g. "gpt3", "gpt4" – placeholder
      configuration: { apiKey, baseURL: "https://openrouter.ai/api/v1" },
      streaming: false,
      cache,
    });

    // Invoke the model
    const result = await chatModel.invoke(prompt);

    // Parse to string
    const parser = new StringOutputParser();
    const resultString = await parser.invoke(result);

    return { content: resultString, generationId: result.lc_kwargs.id };
  };
}

// 2) Challenges definition. Each has multiple files (some with TODO).
//    "index.js" includes the test code that calls process.exit(1) if it fails.
const challenges: Array<{
  name: string;
  prompt: string;
  files: VizFiles;
}> = [
  {
    name: "add",
    prompt: "Implement the 'add' function to correctly add two numbers (a+b) and pass the test in index.js.",
    files: {
      file1: {
        name: "index.js",
        text: `
import { add } from "./functions.js";

// A simple test:
const result = add(3, 4);
if (result !== 7) {
  console.error("Test failed: expected 7, got", result);
  process.exit(1);
}
console.log("Add test passed");
process.exit(0);
        `,
      },
      file2: {
        name: "functions.js",
        text: `
// TODO: Implement the add function
export function add(a, b) {
  // TODO
}
        `,
      },
    },
  },
  {
    name: "multiply",
    prompt: "Implement the 'multiply' function to correctly multiply two numbers and pass the unit test in index.js.",
    files: {
      file1: {
        name: "index.js",
        text: `
import { multiply } from "./functions.js";

const result = multiply(6, 7);
if (result !== 42) {
  console.error("Test failed: expected 42, got", result);
  process.exit(1);
}
console.log("Multiply test passed");
process.exit(0);
      `,
      },
      file2: {
        name: "functions.js",
        text: `
// TODO: Implement the multiply function
export function multiply(a, b) {
  // TODO
}
      `,
      },
    },
  },
  {
    name: "square",
    prompt: "Implement the 'square' function that returns x*x.",
    files: {
      file1: {
        name: "index.js",
        text: `
import { square } from "./functions.js";

const input = 5;
const result = square(input);
if (result !== 25) {
  console.error("Test failed: expected 25, got", result);
  process.exit(1);
}
console.log("Square test passed");
process.exit(0);
      `,
      },
      file2: {
        name: "functions.js",
        text: `
// TODO: Implement the square function
export function square(x) {
  // TODO
}
      `,
    },
  },
  {
    name: "toUpperCase",
    prompt: "Implement the toUpperCase function that returns the given string in uppercase.",
    files: {
      file1: {
        name: "index.js",
        text: `
import { toUpperCase } from "./functions.js";

const input = "hello";
const result = toUpperCase(input);
if (result !== "HELLO") {
  console.error("Test failed: expected 'HELLO', got", result);
  process.exit(1);
}
console.log("toUpperCase test passed");
process.exit(0);
      `,
      },
      file2: {
        name: "functions.js",
        text: `
// TODO: Implement the toUpperCase function
export function toUpperCase(str) {
  // TODO
}
      `,
      },
    },
  },
  {
    name: "reverseString",
    prompt: "Implement the reverseString function that reverses the given string.",
    files: {
      file1: {
        name: "index.js",
        text: `
import { reverseString } from "./functions.js";

const input = "OpenAI";
const expected = "IAnepO";

const result = reverseString(input);
if (result !== expected) {
  console.error("Test failed: expected", expected, "but got", result);
  process.exit(1);
}
console.log("reverseString test passed");
process.exit(0);
      `,
      },
      file2: {
        name: "functions.js",
        text: `
// TODO: Implement the reverseString function
export function reverseString(str) {
  // TODO
}
      `,
      },
    },
  },
];

/**
 * Helper: Writes the files for a given challenge into a folder named after challenge.name + model
 * e.g. "challenges/add/gpt4" to keep them separate per model.
 */
function writeChallengeFiles(challengeName: string, model: string, changedFiles: VizFiles) {
  const challengeDir = path.join("challenges", challengeName, model);

  if (!fs.existsSync(challengeDir)) {
    fs.mkdirSync(challengeDir, { recursive: true });
  }

  Object.keys(changedFiles).forEach((fileKey) => {
    const { name, text } = changedFiles[fileKey];
    const filePath = path.join(challengeDir, name);
    fs.writeFileSync(filePath, text, "utf-8");
  });

  return challengeDir;
}

/**
 * Helper: Runs "index.js" for a given challenge directory with Node and returns exit code.
 */
function runNodeTest(challengeDir: string) {
  const child = spawnSync("node", ["index.js"], {
    cwd: challengeDir,
    encoding: "utf-8",
  });
  const { status, stdout, stderr } = child;

  // You can log or store stdout/stderr if you want more details
  console.log(`--- Running test in ${challengeDir} ---`);
  console.log("stdout:\n", stdout.trim());
  console.log("stderr:\n", stderr.trim());
  console.log("exit code:", status, "\n");

  // If status is null, consider that a failure (process didn't run or crashed).
  return status ?? 1;
}

/**
 * Main function: runs the 5 challenges on 5 different models, calls the AI to fill them in,
 * executes each test, and writes pass/fail results to CSV.
 */
async function runAllChallenges() {
  const apiKey = process.env.OPENROUTER_API_KEY || "";
  if (!apiKey) {
    throw new Error("Please set OPENROUTER_API_KEY in your .env");
  }

  // Optional: set up a local file cache so repeated prompts don't cost extra
  const cacheDirBase = "benchmarks/llmResponseCache";
  if (!fs.existsSync(cacheDirBase)) {
    fs.mkdirSync(cacheDirBase, { recursive: true });
  }
  const cache = await LocalFileCache.create(cacheDirBase);

  // 5 placeholder models
  const models = ["gpt3", "gpt4", "gpt5", "deepseek", "qwen32"];

  // We'll store results in an array of {challenge, model, passFail, exitCode}
  const results: Array<{ challenge: string; model: string; passFail: string; exitCode: number }> = [];

  // Outer loop: each model
  for (const model of models) {
    // Create the LLM function for this model
    const llmFunction = createOpenRouterLlmFunction(model, apiKey, cache);

    // Inner loop: each challenge
    for (const challenge of challenges) {
      console.log(`\n=== Challenge: ${challenge.name} | Model: ${model} ===`);

      // 1) Ask AI to fill out the placeholder TODOs
      const aiResult = await performAiEdit({
        prompt: challenge.prompt,
        files: challenge.files,
        llmFunction,
      });

      // 2) Write returned files to disk in e.g. "challenges/add/gpt3"
      const challengeDir = writeChallengeFiles(challenge.name, model, aiResult.changedFiles);

      // 3) Run index.js in a child process
      const exitCode = runNodeTest(challengeDir);
      const passFail = exitCode === 0 ? "pass" : "fail";

      // 4) Record the result
      results.push({ challenge: challenge.name, model, passFail, exitCode });
    }
  }

  // 5) Write results to CSV
  let csv = "challenge,model,passFail,exitCode\n";
  for (const r of results) {
    csv += `${r.challenge},${r.model},${r.passFail},${r.exitCode}\n`;
  }
  fs.writeFileSync("results.csv", csv, "utf-8");

  console.log("\nAll challenges completed. See 'results.csv' for summary.\n");
  console.log(csv);
}

// Run if invoked directly
if (require.main === module) {
  runAllChallenges().catch((error) => {
    console.error("Error running challenges:", error);
    process.exit(1);
  });
}
