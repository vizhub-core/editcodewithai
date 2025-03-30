#!/usr/bin/env node
import { Command } from "commander";
import * as path from "path";
import { performAiEdit } from "./index";
import { createOpenRouterLlmFunction } from "./benchmarks/llm";
import { computeInitialDocument } from "./computeInitialDocument";
import dotenv from "dotenv";
import { VizFiles } from "@vizhub/viz-types";
import * as fs from "fs/promises";

// Load environment variables
dotenv.config();

const program = new Command();

program
  .name("editcode")
  .description("Edit code files using AI")
  .requiredOption(
    "-p, --prompt <prompt>",
    "The instruction for editing the code"
  )
  .option("-d, --dir <directory>", "Directory to process", process.cwd())
  .option("--dry-run", "Show changes without writing them", false)
  .option(
    "--model <model>",
    "OpenRouter model to use",
    "anthropic/claude-3.7-sonnet"
  )
  .action(async (options) => {
    try {
      // Debug: Log environment
      console.log('Environment variables:', {
        OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY ? '[PRESENT]' : '[MISSING]',
        NODE_ENV: process.env.NODE_ENV,
        PATH: process.env.PATH?.substring(0, 50) + '...'
      });

      // Validate API key
      const apiKey = process.env.OPENROUTER_API_KEY;
      if (!apiKey) {
        console.error(
          "Error: OPENROUTER_API_KEY environment variable is required"
        );
        process.exit(1);
      }

      // Get absolute path
      const fullPath = path.resolve(options.dir);
      console.log(`Processing directory: ${fullPath}`);

      // Use computeInitialDocument to get files (respects .ignore files)
      const initialDocument = computeInitialDocument({ fullPath });

      // Convert to VizFiles format
      const vizFiles: VizFiles = {};
      Object.entries(initialDocument.files).forEach(([id, file]) => {
        if (file.text !== null) {
          // Skip directories
          vizFiles[id] = {
            name: path.relative(process.cwd(), path.join(fullPath, file.name)),
            text: file.text,
          };
        }
      });

      const fileCount = Object.keys(vizFiles).length;
      if (fileCount === 0) {
        console.error("No files found to process");
        process.exit(1);
      }
      console.log(`Found ${fileCount} files to process`);

      // Create LLM function
      const llmFunction = createOpenRouterLlmFunction(options.model, apiKey);

      // Perform the edit
      console.log("\nRequesting changes from AI...");
      const result = await performAiEdit({
        prompt: options.prompt,
        files: vizFiles,
        llmFunction,
        apiKey,
      });

      // Show changes
      console.log("\nProposed changes:");
      for (const [id, file] of Object.entries(result.changedFiles)) {
        const original = vizFiles[id];
        if (!original) {
          console.log(`\nNew file: ${file.name}`);
          console.log(file.text);
        } else if (original.text !== file.text) {
          console.log(`\nModified: ${file.name}`);
          console.log(file.text);
        }
      }

      // Write changes if not dry run
      if (!options.dryRun) {
        console.log("\nWriting changes...");
        for (const [_, file] of Object.entries(result.changedFiles)) {
          const fullPath = path.resolve(file.name);
          await fs.mkdir(path.dirname(fullPath), { recursive: true });
          await fs.writeFile(fullPath, file.text);
          console.log(`Updated ${fullPath}`);
        }
      }

      // Show metadata
      console.log("\nMetadata:");
      console.log(`Model: ${options.model}`);
      console.log(`Provider: ${result.provider}`);
      console.log(`Cost: ${result.upstreamCostCents / 100} USD`);
      console.log(`Input tokens: ${result.inputTokens}`);
      console.log(`Output tokens: ${result.outputTokens}`);
    } catch (error) {
      console.error("Error:", error);
      process.exit(1);
    }
  });

program.parse();
