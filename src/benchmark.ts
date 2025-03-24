import { VizFiles } from "@vizhub/viz-types";
import { LocalFileCache } from "langchain/cache/file_system";
import { performAiEdit } from "./index";
import { LlmFunction } from "./types";
import { ChatOpenAI, ChatOpenAIFields } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import dotenv from "dotenv";
import { existsSync, mkdirSync } from "fs";

// Load environment variables from .env file
dotenv.config();

/**
 * Creates an OpenRouter LLM function
 */
export function createOpenRouterLlmFunction({
  apiKey,
  model = "anthropic/claude-3.5-sonnet",
  cache,
}: {
  apiKey: string;
  model?: string;
  cache?: LocalFileCache;
}): LlmFunction {
  return async (prompt: string) => {
    try {
      const options: ChatOpenAIFields = {
        modelName: model,
        configuration: {
          apiKey,
          baseURL: "https://openrouter.ai/api/v1",
        },
        streaming: false,
        cache,
      };

      const chatModel = new ChatOpenAI(options);
      const result = await chatModel.invoke(prompt);

      const parser = new StringOutputParser();
      const resultString = await parser.invoke(result);

      return {
        content: resultString,
        generationId: result.lc_kwargs.id,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`OpenRouter API error: ${error.message}`);
      } else {
        throw new Error(`OpenRouter API error: ${String(error)}`);
      }
    }
  };
}

/**
 * Runs a benchmark test using OpenRouter to implement an "add" function
 * @param apiKey OpenRouter API key
 * @param model Optional model to use
 * @returns Benchmark results including the implementation and performance metrics
 */
export async function runAddFunctionBenchmark({
  apiKey,
  cache,
}: {
  apiKey: string;
  cache: LocalFileCache;
}): Promise<{
  success: boolean;
  implementation?: string;
  isCorrect?: boolean;
  testOutput?: any;
  elapsedTime?: number;
  costCents?: number;
  provider?: string;
  inputTokens?: number;
  outputTokens?: number;
  error?: string;
}> {
  if (!apiKey) {
    throw new Error("Please set OPENROUTER_API_KEY in your .env file");
  }
  // Create test file with empty add function
  const files: VizFiles = {
    file1: {
      name: "index.js",
      text: "function add(a, b) {\n  // TODO: Implement this function\n}\n",
    },
  };

  const prompt =
    "Implement the 'add' function to add two numbers together and return the result.";

  // Create LLM function
  const llmFunction = createOpenRouterLlmFunction({ apiKey, cache });

  console.log("Sending request to OpenRouter...");
  const startTime = Date.now();

  try {
    // Perform the AI edit
    const result = await performAiEdit({
      prompt,
      files,
      llmFunction,
      // Don't include the API key so it doesn't fetch cost metadata
      // apiKey,
    });

    const endTime = Date.now();
    const elapsedTime = (endTime - startTime) / 1000;

    // Extract the implementation
    const implementation = result.changedFiles.file1?.text || "";

    // Validate the implementation
    let isCorrect = false;
    let testOutput = null;

    try {
      // Create a function from the implementation to test it
      const funcStr = implementation + "\nreturn add(3, 4);";
      const testFunc = new Function(funcStr);
      testOutput = testFunc();
      isCorrect = testOutput === 7;
    } catch (error) {
      console.error("Error testing implementation:", error);
    }

    return {
      success: true,
      implementation,
      isCorrect,
      testOutput,
      elapsedTime,
      costCents: result.upstreamCostCents,
      provider: result.provider,
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
    };
  } catch (error) {
    console.error("Benchmark failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

const runBenchmark = async () => {
  /**
   * Example usage of the benchmark function
   */
  // Check if this file is being executed directly (CommonJS approach)
  // This code runs when the file is executed directly
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    console.error("Please set OPENROUTER_API_KEY in your .env file");
    process.exit(1);
  }

  // Set up a file system cache for LLM responses, so
  // we don't call OpenRouter with the same (prompt, model) pair multiple times
  const cacheDirBase = "benchmarks/llmResponseCache";
  if (!existsSync(cacheDirBase)) {
    mkdirSync(cacheDirBase, { recursive: true });
  }
  const cache = await LocalFileCache.create(cacheDirBase);

  runAddFunctionBenchmark({ apiKey, cache })
    .then((result) => {
      console.log("Benchmark result:", JSON.stringify(result, null, 2));
    })
    .catch((error) => {
      console.error("Error running benchmark:", error);
    });
};

runBenchmark();
