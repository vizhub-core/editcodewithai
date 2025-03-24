import { parseMarkdownFiles, serializeMarkdownFiles } from "llm-code-format";
import { PerformAiEditParams, PerformAiEditResult } from "./types";
import { PROMPT_TEMPLATE_VERSION, assembleFullPrompt } from "./prompt";
import { getGenerationMetadata } from "./metadata";
import { prepareFilesForPrompt, mergeFileChanges } from "./fileUtils";

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
}: PerformAiEditParams): Promise<PerformAiEditResult> {
  // 1. Serialize the existing files into the "markdown code block" format
  const preparedFiles = prepareFilesForPrompt(files);
  const filesContext = serializeMarkdownFiles(preparedFiles);

  // 2. Assemble the final prompt
  const fullPrompt = assembleFullPrompt({ filesContext, prompt });
  debug && console.log("[performAiEdit] fullPrompt:", fullPrompt);

  // 3. Invoke the model via the provided LLM function
  const result = await llmFunction(fullPrompt);

  // 4. We parse the output to figure out which files changed
  const resultString = result.content;
  const parsed = parseMarkdownFiles(resultString, "bold");

  // 5. Merge the changes into a new `Files` object
  const changedFiles = mergeFileChanges(files, parsed.files);

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
  };
}
