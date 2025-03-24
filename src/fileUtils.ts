import { VizFiles, VizFile } from "@vizhub/viz-types";
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
export function prepareFilesForPrompt(files: VizFiles) {
  return Object.values(files).map((file) => ({
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
  }));
}

/**
 * Merges original files with changes from the LLM
 */
export function mergeFileChanges(
  originalFiles: VizFiles,
  parsedFiles: { name: string; text: string }[]
): VizFiles {
  // Start with existing files
  let changedFiles: VizFiles = Object.keys(originalFiles).reduce(
    (acc, fileId) => {
      const original = originalFiles[fileId];
      const changedFile = parsedFiles.find((f) => f.name === original.name);

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
    {} as VizFiles
  );

  // Handle newly-created files
  parsedFiles.forEach((changedFile) => {
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

  return changedFiles;
}
