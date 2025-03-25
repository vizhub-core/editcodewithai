/**********************************************************************
 * benchmark.ts
 * --------------------------------------------------------------------
 * Defines 5 challenges, each with index.js (ES module) that performs
 * a simple unit test. The code calls process.exit(0) on success or
 * process.exit(1) on failure.
 *
 * The script then:
 * 1) Calls the AI to implement the TODOs.
 * 2) Writes the generated code to disk in separate folders.
 * 3) Executes each challenge with child_process.
 * 4) Interprets exit code 0 as "pass" and non-0 as "fail."
 * 5) Writes pass/fail results to "results.csv."
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

// 1) Define the LLM function builder for your OpenRouter or other endpoint
function createOpenRouterLlmFunction(model: string, apiKey: string, cache?: LocalFileCache): LlmFunction {
  return async (prompt: string) => {
    const chatModel = new ChatOpenAI(<ChatOpenAIFields>{
      modelName: model,
      configuration: { apiKey, baseURL: "https://openrouter.ai/api/v1" },
      streaming: false,
      cache,
    });
    const result = await chatModel.invoke(prompt);
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
 * Helper: Writes the files for a given challenge into a folder named after challenge.name
 */
function writeChallengeFiles(challengeName: string, changedFiles: VizFiles) {
  const challengeDir = path.join("challenges", challengeName);

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
  console.log("stdout:", stdout.trim());
  console.log("stderr:", stderr.trim());
  console.log("exit code:", status, "\n");

  return status ?? 1; // If undefined, treat as fail
}

/**
 * Main function: runs all 5 challenges, calls the AI to fill them in,
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

  // We can run a single model or multiple. Here, just pick one:
  const model = "anthropic/claude-3.5-sonnet";
  const llmFunction = createOpenRouterLlmFunction(model, apiKey, cache);

  // We'll store results in an array of {challengeName, passFail, exitCode}
  const results: Array<{ challenge: string; passFail: string; exitCode: number }> = [];

  for (const challenge of challenges) {
    console.log(`\n=== Challenge: ${challenge.name} ===`);

    // 1) Ask AI to fill out the placeholder TODOs
    const aiResult = await performAiEdit({
      prompt: challenge.prompt,
      files: challenge.files,
      llmFunction,
    });

    // 2) Write returned files to disk
    const challengeDir = writeChallengeFiles(challenge.name, aiResult.changedFiles);

    // 3) Run index.js in a child process
    const exitCode = runNodeTest(challengeDir);
    const passFail = exitCode === 0 ? "pass" : "fail";

    // 4) Record result
    results.push({ challenge: challenge.name, passFail, exitCode });
  }

  // 5) Write results to CSV
  let csv = "challenge,passFail,exitCode\n";
  for (const r of results) {
    csv += `${r.challenge},${r.passFail},${r.exitCode}\n`;
  }
  fs.writeFileSync("results.csv", csv, "utf-8");

  console.log("\nAll challenges completed. See 'results.csv' for summary.");
  console.log(csv);
}

// Run if invoked directly
if (require.main === module) {
  runAllChallenges().catch((error) => {
    console.error("Error running challenges:", error);
    process.exit(1);
  });
}
