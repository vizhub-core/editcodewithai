import { parseMarkdownFiles, formatMarkdownFiles } from "llm-code-format";
import type {
  PerformAiEditParams,
  PerformAiEditResult,
  EditFormat,
} from "./types";
import { PROMPT_TEMPLATE_VERSION, assembleFullPrompt } from "./prompt";
import { getGenerationMetadata } from "./metadata";
import {
  prepareFilesForPrompt,
  mergeFileChanges,
  parseDiffs,
  applyDiffs,
} from "./fileUtils";

export type {
  LlmFunction,
  PerformAiEditParams,
  PerformAiEditResult,
  EditFormat,
} from "./types";

const debug = false;

/**
 * Core AI logic for:
 * - Building the prompt (including context)
 * - Calling the provided LLM function
 * - Parsing and merging file changes
 * - Retrieving cost metadata
 */
export async function performAiEdit({
  prompt,
  files,
  llmFunction,
  apiKey,
  editFormat = "whole",
}: PerformAiEditParams): Promise<PerformAiEditResult> {
  // 1. Format the existing files into the "markdown code block" format
  const preparedFiles = prepareFilesForPrompt(files);
  const filesContext = formatMarkdownFiles(preparedFiles);

  // 2. Assemble the final prompt
  const fullPrompt = assembleFullPrompt({ filesContext, prompt, editFormat });
  debug && console.log("[performAiEdit] fullPrompt:", fullPrompt);

  // 3. Invoke the model via the provided LLM function
  const result = await llmFunction(fullPrompt);

  // 4. We parse the output to figure out which files changed
  const resultString = result.content;
  let changedFiles;

  switch (editFormat) {
    case "whole": {
      const parsed = parseMarkdownFiles(resultString, "bold");
      changedFiles = mergeFileChanges(files, parsed.files);
      break;
    }
    case "diff": {
      const diffs = parseDiffs(resultString);
      changedFiles = applyDiffs(files, diffs);
      break;
    }
    case "diff-fenced":
    case "udiff": {
      // For diff-based formats, a different parsing and application logic is needed.
      // This would involve parsing the diff format from the LLM response
      // and then applying it to the original files.
      // A new utility function, e.g., `applyDiffs`, would be required in `fileUtils.ts`.
      throw new Error(`Edit format "${editFormat}" is not yet implemented.`);
    }
    default:
      // This will catch any unhandled or unknown edit formats.
      throw new Error(`Unknown edit format: ${editFormat}`);
  }

  // 6. Retrieve cost metadata for charging the user
  const openRouterGenerationId = result.generationId || "";
  let upstreamCostCents = 0;
  let provider = "";
  let inputTokens = 0;
  let outputTokens = 0;

  if (openRouterGenerationId && apiKey) {
    const costData = await getGenerationMetadata({
      apiKey,
      generationId: openRouterGenerationId,
    });
    upstreamCostCents = costData.upstreamCostCents;
    provider = costData.provider;
    inputTokens = costData.inputTokens;
    outputTokens = costData.outputTokens;
  }

  return {
    changedFiles,
    openRouterGenerationId,
    upstreamCostCents,
    provider,
    inputTokens,
    outputTokens,
    promptTemplateVersion: PROMPT_TEMPLATE_VERSION,
    rawResponse: resultString, // Include the raw response
  };
}
