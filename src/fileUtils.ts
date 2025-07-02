import { VizFiles, VizFile, FileCollection } from "@vizhub/viz-types";
import { generateVizFileId } from "@vizhub/viz-utils";

/**
 * If the LLM outputs empty text for a file, we interpret this
 * as a request to delete the file.
 */
export function shouldDeleteFile(file?: VizFile) {
  if (!file) return false;
  return file.text.trim() === "";
}

/**
 * Processes files for the prompt by truncating large files
 */
export function prepareFilesForPrompt(files: VizFiles): FileCollection {
  const result: FileCollection = {};

  Object.values(files).forEach((file) => {
    // Example: truncate large files, etc.
    result[file.name] = file.text
      .split("\n")
      .slice(
        0,
        file.name.endsWith(".csv") || file.name.endsWith(".json") ? 50 : 500,
      )
      .map((line) => line.slice(0, 200))
      .join("\n");
  });

  return result;
}

/**
 * Merges original files with changes from the LLM
 */
export function mergeFileChanges(
  originalFiles: VizFiles,
  parsedFiles: FileCollection,
): VizFiles {
  // Start with existing files
  let changedFiles: VizFiles = Object.keys(originalFiles).reduce(
    (acc, fileId) => {
      const original = originalFiles[fileId];
      const changedText = parsedFiles[original.name];
      const changedFile =
        changedText !== undefined
          ? { name: original.name, text: changedText }
          : undefined;

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
    },
    {} as VizFiles,
  );

  // Handle newly-created files
  Object.entries(parsedFiles).forEach(([fileName, fileText]) => {
    const existingFile = Object.values(changedFiles).find(
      (file) => file.name === fileName,
    );
    // If no existing file and not empty => it's a new file
    if (!existingFile && fileText.trim() !== "") {
      const newFileId = generateVizFileId();
      changedFiles[newFileId] = {
        name: fileName,
        text: fileText,
      };
    }
  });

  return changedFiles;
}

export interface Diff {
  fileName: string;
  search: string;
  replace: string;
}

export function parseDiffs(responseText: string): Diff[] {
  const diffs: Diff[] = [];
  // This regex captures the file path, and the content of the SEARCH and REPLACE blocks.
  const diffRegex =
    /^(.+)\n```\n<<<<<<< SEARCH\n([\s\S]*?)\n=======\n([\s\S]*?)\n>>>>>>> REPLACE\n```/gm;

  const matches = responseText.matchAll(diffRegex);

  for (const match of matches) {
    const [_, fileName, search, replace] = match;
    diffs.push({
      fileName: fileName.trim(),
      search,
      replace,
    });
  }

  return diffs;
}

export function applyDiffs(originalFiles: VizFiles, diffs: Diff[]): VizFiles {
  // Create a mutable copy of the files to avoid side effects.
  const changedFiles: VizFiles = JSON.parse(JSON.stringify(originalFiles));

  for (const diff of diffs) {
    const fileId = Object.keys(changedFiles).find(
      (id) => changedFiles[id].name === diff.fileName,
    );

    if (!fileId) {
      throw new Error(`File not found: ${diff.fileName}`);
    }

    const file = changedFiles[fileId];
    if (!file.text.includes(diff.search)) {
      throw new Error(`Search block not found in file: ${diff.fileName}`);
    }

    // Replace only the first occurrence, which is the standard behavior of string.replace.
    file.text = file.text.replace(diff.search, diff.replace);
  }

  return changedFiles;
}
