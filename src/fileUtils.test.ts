import { describe, it, expect } from "vitest";
import {
  shouldDeleteFile,
  prepareFilesForPrompt,
  mergeFileChanges,
  parseDiffs,
  applyDiffs,
  Diff,
  parseDiffFenced,
  UdiffHunk,
  parseUdiffs,
  applyUdiffs,
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

describe("diff-fenced utilities", () => {
  describe("parseDiffFenced", () => {
    it("should parse a single valid diff-fenced block", () => {
      const responseText = [
        "```",
        "path/to/file.js",
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
      expect(parseDiffFenced(responseText)).toEqual(expected);
    });
  });
});

describe("udiff utilities", () => {
  describe("parseUdiffs", () => {
    it("should parse a simple udiff with addition and deletion", () => {
      const responseText = [
        "```diff",
        "--- file.js",
        "+++ file.js",
        "@@ -1,3 +1,3 @@",
        " line 1",
        "-line 2",
        "+line two",
        " line 3",
        "```",
      ].join("\n");
      const expected: UdiffHunk[] = [
        {
          fileName: "file.js",
          original: "line 1\nline 2\nline 3",
          updated: "line 1\nline two\nline 3",
        },
      ];
      expect(parseUdiffs(responseText)).toEqual(expected);
    });

    it("should parse a udiff with only additions", () => {
      const responseText = [
        "```diff",
        "--- file.js",
        "+++ file.js",
        "@@ -1,2 +1,3 @@",
        " line 1",
        "+new line",
        " line 2",
        "```",
      ].join("\n");
      const expected: UdiffHunk[] = [
        {
          fileName: "file.js",
          original: "line 1\nline 2",
          updated: "line 1\nnew line\nline 2",
        },
      ];
      expect(parseUdiffs(responseText)).toEqual(expected);
    });

    it("should parse a udiff with only deletions", () => {
      const responseText = [
        "```diff",
        "--- file.js",
        "+++ file.js",
        "@@ -1,3 +1,2 @@",
        " line 1",
        "-line to delete",
        " line 2",
        "```",
      ].join("\n");
      const expected: UdiffHunk[] = [
        {
          fileName: "file.js",
          original: "line 1\nline to delete\nline 2",
          updated: "line 1\nline 2",
        },
      ];
      expect(parseUdiffs(responseText)).toEqual(expected);
    });

    it("should parse multiple hunks for the same file", () => {
      const responseText = [
        "```diff",
        "--- file.js",
        "+++ file.js",
        "@@ -1,3 +1,3 @@",
        " context 1",
        "-delete 1",
        "+add 1",
        "@@ -10,3 +10,3 @@",
        " context 2",
        "-delete 2",
        "+add 2",
        "```",
      ].join("\n");
      const expected: UdiffHunk[] = [
        {
          fileName: "file.js",
          original: "context 1\ndelete 1",
          updated: "context 1\nadd 1",
        },
        {
          fileName: "file.js",
          original: "context 2\ndelete 2",
          updated: "context 2\nadd 2",
        },
      ];
      expect(parseUdiffs(responseText)).toEqual(expected);
    });
  });

  describe("applyUdiffs", () => {
    it("should apply a udiff hunk", () => {
      const files: VizFiles = {
        file1: { name: "file.js", text: " line 1\nline 2\n line 3" },
      };
      const hunks: UdiffHunk[] = [
        {
          fileName: "file.js",
          original: " line 1\nline 2\n line 3",
          updated: " line 1\nline two\n line 3",
        },
      ];
      const updatedFiles = applyUdiffs(files, hunks);
      expect(updatedFiles.file1.text).toBe(" line 1\nline two\n line 3");
    });

    it("should throw an error if original content not found", () => {
      const files: VizFiles = {
        file1: { name: "file.js", text: "some other content" },
      };
      const hunks: UdiffHunk[] = [
        {
          fileName: "file.js",
          original: " line 1\nline 2\n line 3",
          updated: " line 1\nline two\n line 3",
        },
      ];
      expect(() => applyUdiffs(files, hunks)).toThrow(
        "Original content for hunk not found in file: file.js",
      );
    });
  });
});
