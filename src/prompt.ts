import type { EditFormat } from "./types";

// Versions of the prompt template.
export const PROMPT_TEMPLATE_VERSION = 1;

// Template pieces
const TASK = (prompt: string) => `## Your Task\n\n${prompt}`;
const FILES = (filesContext: string) => `## Original Files\n\n${filesContext}`;

const FORMAT_INSTRUCTIONS: Record<EditFormat, string> = {
  whole: [
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
  ].join(""),
  diff: [
    "## Formatting Instructions\n\n",
    "Suggest changes to the original files using this search/replace block format:\n\n",
    "path/to/filename.ext\n",
    "```\n",
    "<<<<<<< SEARCH\n",
    "// code to be replaced\n",
    "=======\n",
    "// new code\n",
    ">>>>>>> REPLACE\n",
    "```\n",
  ].join(""),
  "diff-fenced": [
    "## Formatting Instructions\n\n",
    "Suggest changes to the original files using this search/replace block format with the file path inside the fence:\n\n",
    "```\n",
    "path/to/filename.ext\n",
    "<<<<<<< SEARCH\n",
    "// code to be replaced\n",
    "=======\n",
    "// new code\n",
    ">>>>>>> REPLACE\n",
    "```\n",
  ].join(""),
  udiff: [
    "## Formatting Instructions\n\n",
    "Suggest changes to the original files using the unified diff format:\n\n",
    "```diff\n",
    "--- path/to/filename.ext\n",
    "+++ path/to/filename.ext\n",
    "@@ ... @@\n",
    "-// line to be removed\n",
    "+// line to be added\n",
    "```\n",
  ].join(""),
};

/**
 * Assembles the full prompt by combining task, files context, and formatting instructions
 */
export function assembleFullPrompt({
  filesContext,
  prompt,
  editFormat = "whole",
}: {
  filesContext: string;
  prompt: string;
  editFormat?: EditFormat;
}) {
  const FORMAT = FORMAT_INSTRUCTIONS[editFormat];
  return [TASK(prompt), FILES(filesContext), FORMAT].join("\n\n");
}
