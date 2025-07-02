import { describe, it, expect } from "vitest";
import {
  shouldDeleteFile,
  prepareFilesForPrompt,
  mergeFileChanges,
  parseDiffs,
  applyDiffs,
  Diff,
} from "./fileUtils";
import { VizFiles, FileCollection } from "@vizhub/viz-types";

describe("fileUtils", () => {
  describe("shouldDeleteFile", () => {
    it("should return true for empty file content", () => {
      expect(shouldDeleteFile({ name: "test.js", text: "" })).toBe(true);
      expect(shouldDeleteFile({ name: "test.js", text: "  " })).toBe(true);
      expect(shouldDeleteFile({ name: "test.js", text: "\n" })).toBe(true);
    });

    it("should return false for non-empty file content", () => {
      expect(
        shouldDeleteFile({ name: "test.js", text: "console.log('hi');" }),
      ).toBe(false);
    });

    it("should return false for undefined file", () => {
      expect(shouldDeleteFile(undefined)).toBe(false);
    });
  });

  describe("prepareFilesForPrompt", () => {
    it("should truncate large files", () => {
      const files: VizFiles = {
        file1: {
          name: "large.js",
          text: Array(1000).fill("console.log('line');").join("\n"),
        },
      };

      const result = prepareFilesForPrompt(files);
      expect(result["large.js"]).toBeDefined();
      expect(result["large.js"].split("\n").length).toBe(500); // Truncated to 500 lines
    });

    it("should truncate CSV and JSON files more aggressively", () => {
      const files: VizFiles = {
        file1: {
          name: "data.csv",
          text: Array(100).fill("a,b,c").join("\n"),
        },
        file2: {
          name: "data.json",
          text: Array(100).fill('{"key": "value"}').join("\n"),
        },
      };

      const result = prepareFilesForPrompt(files);

      expect(result["data.csv"].split("\n").length).toBe(50); // Truncated to 50 lines
      expect(result["data.json"].split("\n").length).toBe(50); // Truncated to 50 lines
    });

    it("should truncate long lines", () => {
      const files: VizFiles = {
        file1: {
          name: "longline.js",
          text: "console.log('" + "x".repeat(500) + "');",
        },
      };

      const result = prepareFilesForPrompt(files);
      expect(result["longline.js"].length).toBeLessThan(201); // Truncated to 200 chars
    });
  });

  describe("mergeFileChanges", () => {
    it("should keep unchanged files", () => {
      const originalFiles: VizFiles = {
        file1: { name: "unchanged.js", text: "console.log('original');" },
      };
      const parsedFiles: FileCollection = {};

      const result = mergeFileChanges(originalFiles, parsedFiles);
      expect(result).toEqual(originalFiles);
    });

    it("should update changed files", () => {
      const originalFiles: VizFiles = {
        file1: { name: "changed.js", text: "console.log('original');" },
      };
      const parsedFiles: FileCollection = {
        "changed.js": "console.log('updated');",
      };

      const result = mergeFileChanges(originalFiles, parsedFiles);
      expect(result.file1.text).toBe("console.log('updated');");
    });

    it("should delete files with empty content", () => {
      const originalFiles: VizFiles = {
        file1: { name: "keep.js", text: "console.log('keep');" },
        file2: { name: "delete.js", text: "console.log('delete');" },
      };
      const parsedFiles: FileCollection = {
        "delete.js": "",
      };

      const result = mergeFileChanges(originalFiles, parsedFiles);
      expect(Object.keys(result)).toHaveLength(1);
      expect(result.file1).toBeDefined();
      expect(result.file2).toBeUndefined();
    });

    it("should add new files", () => {
      const originalFiles: VizFiles = {
        file1: { name: "existing.js", text: "console.log('existing');" },
      };
      const parsedFiles: FileCollection = {
        "new.js": "console.log('new');",
      };

      const result = mergeFileChanges(originalFiles, parsedFiles);
      expect(Object.keys(result)).toHaveLength(2);

      const newFile = Object.values(result).find((f) => f.name === "new.js");
      expect(newFile).toBeDefined();
      expect(newFile?.text).toBe("console.log('new');");
    });

    it("should handle multiple operations at once", () => {
      const originalFiles: VizFiles = {
        file1: { name: "keep.js", text: "console.log('keep');" },
        file2: { name: "update.js", text: "console.log('original');" },
        file3: { name: "delete.js", text: "console.log('delete');" },
      };
      const parsedFiles: FileCollection = {
        "update.js": "console.log('updated');",
        "delete.js": "",
        "new.js": "console.log('new');",
      };

      const result = mergeFileChanges(originalFiles, parsedFiles);

      // Check kept file
      expect(result.file1.text).toBe("console.log('keep');");

      // Check updated file
      expect(result.file2.text).toBe("console.log('updated');");

      // Check deleted file
      expect(result.file3).toBeUndefined();

      // Check new file
      const newFile = Object.values(result).find((f) => f.name === "new.js");
      expect(newFile).toBeDefined();
      expect(newFile?.text).toBe("console.log('new');");
    });
  });
});

describe("diff utilities", () => {
  describe("parseDiffs", () => {
    it("should parse a single valid diff block", () => {
      const responseText = [
        "path/to/file.js",
        "```",
        "<<<<<<< SEARCH",
        "const x = 1;",
        "=======",
        "const x = 2;",
        ">>>>>>> REPLACE",
        "```",
      ].join("\n");
      const expected: Diff[] = [
        {
          fileName: "path/to/file.js",
          search: "const x = 1;",
          replace: "const x = 2;",
        },
      ];
      expect(parseDiffs(responseText)).toEqual(expected);
    });

    it("should parse multiple diff blocks", () => {
      const responseText = [
        "file1.js",
        "```",
        "<<<<<<< SEARCH",
        "hello",
        "=======",
        "world",
        ">>>>>>> REPLACE",
        "```",
        "",
        "file2.js",
        "```",
        "<<<<<<< SEARCH",
        "foo",
        "=======",
        "bar",
        ">>>>>>> REPLACE",
        "```",
      ].join("\n");
      const expected: Diff[] = [
        { fileName: "file1.js", search: "hello", replace: "world" },
        { fileName: "file2.js", search: "foo", replace: "bar" },
      ];
      expect(parseDiffs(responseText)).toEqual(expected);
    });

    it("should handle multiline search and replace", () => {
      const searchBlock = `function hello() {\n  console.log("hello");\n}`;
      const replaceBlock = `function goodbye() {\n  console.log("goodbye");\n}`;
      const responseText = [
        "path/to/file.js",
        "```",
        "<<<<<<< SEARCH",
        searchBlock,
        "=======",
        replaceBlock,
        ">>>>>>> REPLACE",
        "```",
      ].join("\n");
      const expected: Diff[] = [
        {
          fileName: "path/to/file.js",
          search: searchBlock,
          replace: replaceBlock,
        },
      ];
      expect(parseDiffs(responseText)).toEqual(expected);
    });

    it("should return an empty array for invalid format", () => {
      const invalidDiff = "this is not a diff";
      expect(parseDiffs(invalidDiff)).toEqual([]);
    });
  });

  describe("applyDiffs", () => {
    it("should apply a diff to the correct file", () => {
      const files: VizFiles = {
        file1: { name: "path/to/file.js", text: "const x = 1;" },
        file2: { name: "another/file.js", text: "const y = 1;" },
      };
      const diffs: Diff[] = [
        {
          fileName: "path/to/file.js",
          search: "const x = 1;",
          replace: "const x = 2;",
        },
      ];
      const updatedFiles = applyDiffs(files, diffs);
      expect(updatedFiles.file1.text).toBe("const x = 2;");
      expect(updatedFiles.file2.text).toBe("const y = 1;");
    });

    it("should throw an error if file not found", () => {
      const files: VizFiles = {
        file1: { name: "path/to/file.js", text: "const x = 1;" },
      };
      const diffs: Diff[] = [
        {
          fileName: "nonexistent.js",
          search: "const x = 1;",
          replace: "const x = 2;",
        },
      ];
      expect(() => applyDiffs(files, diffs)).toThrow(
        "File not found: nonexistent.js",
      );
    });

    it("should throw an error if search block not found", () => {
      const files: VizFiles = {
        file1: { name: "path/to/file.js", text: "const x = 1;" },
      };
      const diffs: Diff[] = [
        {
          fileName: "path/to/file.js",
          search: "const y = 1;",
          replace: "const y = 2;",
        },
      ];
      expect(() => applyDiffs(files, diffs)).toThrow(
        "Search block not found in file: path/to/file.js",
      );
    });
  });
});
