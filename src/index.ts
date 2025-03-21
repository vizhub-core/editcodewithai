import { ChatOpenAI, ChatOpenAIFields } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { parseMarkdownFiles, serializeMarkdownFiles } from "llm-code-format";
import { VizFiles, VizFile, generateVizFileId } from "@vizhub/viz-types";

const debug = false;

// Versions of the prompt template.
const PROMPT_TEMPLATE_VERSION = 1;

// Template pieces
const TASK = (prompt: string) => `## Your Task\n\n${prompt}`;
const FILES = (filesContext: string) => `## Original Files\n\n${filesContext}`;
const FORMAT = [
  "## Formatting Instructions\n\n",
  "Suggest changes to the original files using this exact format:\n\n",
  "**fileA.js**\n\n```js\n// Entire updated code for fileA\n```\n\n",
  "**fileB.js**\n\n```js\n// Entire updated code for fileB\n```\n\n",
  "Only include the files that need to be updated or created.\n\n",
  "To suggest changes you MUST include the ENTIRE content of the updated file.\n\n",
  'NEVER leave out sections as in "... rest of the code remain the same ...".\n\n',
  "Refactor large files into smaller files in the same directory.\n\n",
  "Delete all unused files, but we need to keep `README.md`. ",
  "Files can be deleted by setting their content to empty, for example:\n\n",
  "**fileToDelete.js**\n\n```\n```\n\n",
  "For D3 logic, make sure it remains idempotent (use data joins), ",
  "and prefer function signatures like `someFunction(selection, options)` ",
  "where `selection` is a D3 selection and `options` is an object.\n\n",
].join("");

function assembleFullPrompt({
  filesContext,
  prompt,
}: {
  filesContext: string;
  prompt: string;
}) {
  return [TASK(prompt), FILES(filesContext), FORMAT].join("\n\n");
}

/**
 * If the LLM outputs empty text for a file, we interpret this
 * as a request to delete the file.
 */
function shouldDeleteFile(file?: VizFile) {
  return file && file.text.trim() === "";
}

/**
 * Get cost and metadata for a generation from OpenRouter.
 */
async function getGenerationMetadata({
  apiKey,
  generationId,
}: {
  apiKey: string;
  generationId: string;
}): Promise<{
  upstreamCostCents: number;
  provider: string;
  inputTokens: number;
  outputTokens: number;
}> {
  const url = `https://openrouter.ai/api/v1/generation?id=${generationId}`;
  const headers = {
    Authorization: `Bearer ${apiKey}`,
  };

  // Retry logic for potential 404 from OpenRouter
  const maxRetries = 10;
  const retryDelay = 1000; // 1 second

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    if (response.ok) {
      const data = await response.json();
      debug && console.log("[getCost] data:", JSON.stringify(data, null, 2));

      const upstreamCostInDollars = data.data.total_cost;
      const upstreamCostCents = upstreamCostInDollars * 100;
      const provider = data.data.provider_name;
      const inputTokens = data.data.tokens_prompt;
      const outputTokens = data.data.tokens_completion;

      return {
        upstreamCostCents,
        provider,
        inputTokens,
        outputTokens,
      };
    } else {
      const text = await response.text();
      debug &&
        console.error(
          `Attempt ${attempt} failed. Status: ${response.status}, response text: ${text}`
        );

      if (attempt < maxRetries) {
        debug && console.log(`Retrying in ${retryDelay / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      } else {
        throw new Error(
          `HTTP error! Status: ${response.status} after ${maxRetries} attempts.`
        );
      }
    }
  }

  // You theoretically never reach here because of the throw above
  throw new Error("Failed to get generation metadata.");
}

export interface PerformAiEditParams {
  prompt: string;
  modelName: string;
  files: VizFiles;
  apiKey: string;
  baseURL: string | undefined; // optional
}

export interface PerformAiEditResult {
  changedFiles: VizFiles;
  openRouterGenerationId: string;
  upstreamCostCents: number;
  provider: string;
  inputTokens: number;
  outputTokens: number;
  promptTemplateVersion: number;
}

/**
 * Core AI logic for:
 * - Building the prompt (including context)
 * - Calling the LLM (ChatOpenAI)
 * - Parsing and merging file changes
 * - Retrieving cost metadata
 */
export async function performAiEdit({
  prompt,
  modelName,
  files,
  apiKey,
  baseURL,
}: PerformAiEditParams): Promise<PerformAiEditResult> {
  // 1. Serialize the existing files into the “markdown code block” format
  const filesContext = serializeMarkdownFiles(
    Object.values(files).map((file) => ({
      name: file.name,
      // Example: truncate large files, etc.
      text: file.text
        .split("\n")
        .slice(
          0,
          file.name.endsWith(".csv") || file.name.endsWith(".json") ? 50 : 500
        )
        .map((line) => line.slice(0, 200))
        .join("\n"),
    }))
  );

  // 2. Assemble the final prompt
  const fullPrompt = assembleFullPrompt({ filesContext, prompt });
  debug && console.log("[performAiEdit] fullPrompt:", fullPrompt);

  // 3. Invoke the model via LangChain’s ChatOpenAI
  const options: ChatOpenAIFields = {
    modelName,
    configuration: {
      apiKey,
      baseURL,
    },
    streaming: false,
  };
  const chatModel = new ChatOpenAI(options);
  const result = await chatModel.invoke(fullPrompt);

  // 4. We parse the output to figure out which files changed
  const parser = new StringOutputParser();
  const resultString = await parser.invoke(result);
  const parsed = parseMarkdownFiles(resultString, "bold");

  // 5. Merge the changes into a new `Files` object
  let changedFiles: VizFiles = Object.keys(files).reduce((acc, fileId) => {
    const original = files[fileId];
    const changedFile = parsed.files.find((f) => f.name === original.name);

    if (shouldDeleteFile(changedFile)) {
      // Exclude from new set
      return acc;
    }

    // If changedFile is present, use it; otherwise use original
    acc[fileId] = {
      ...original,
      text: changedFile ? changedFile.text : original.text,
    };
    return acc;
  }, {} as VizFiles);

  // Handle newly-created files
  parsed.files.forEach((changedFile) => {
    const existingFile = Object.values(changedFiles).find(
      (file) => file.name === changedFile.name
    );
    // If no existing file and not empty => it's a new file
    if (!existingFile && !shouldDeleteFile(changedFile)) {
      const newFileId = generateVizFileId();
      changedFiles[newFileId] = {
        name: changedFile.name,
        text: changedFile.text,
      };
    }
  });

  // 6. Retrieve cost metadata for charging the user
  //    The openRouterGenerationId is stored in `result.lc_kwargs.id` by LangChain
  const openRouterGenerationId = result.lc_kwargs?.id;
  let upstreamCostCents = 0;
  let provider = "";
  let inputTokens = 0;
  let outputTokens = 0;

  if (openRouterGenerationId) {
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
    openRouterGenerationId: openRouterGenerationId ?? "",
    upstreamCostCents,
    provider,
    inputTokens,
    outputTokens,
    promptTemplateVersion: PROMPT_TEMPLATE_VERSION,
  };
}
