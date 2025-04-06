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
        file.name.endsWith(".csv") || file.name.endsWith(".json") ? 50 : 500
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
  parsedFiles: FileCollection
): VizFiles {
  // Start with existing files
  let changedFiles: VizFiles = Object.keys(originalFiles).reduce(
    (acc, fileId) => {
      const original = originalFiles[fileId];
      const changedText = parsedFiles[original.name];
      const changedFile = changedText !== undefined ? { name: original.name, text: changedText } : undefined;

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
  Object.entries(parsedFiles).forEach(([fileName, fileText]) => {
    const existingFile = Object.values(changedFiles).find(
      (file) => file.name === fileName
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
