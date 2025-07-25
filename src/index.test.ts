import { describe, it, expect, vi, beforeEach } from "vitest";
import { performAiEdit, FORMAT_INSTRUCTIONS } from "./index";
import { VizFiles } from "@vizhub/viz-types";
import { LlmFunction } from "./types";

// Mock LLM function
const mockLlmFunction: LlmFunction = vi.fn().mockResolvedValue({
  content: `**test.js**

\`\`\`js
console.log('updated');
\`\`\`
`,
  generationId: "test-generation-id",
});

// Mock the fetch function for cost metadata
const mockFetch = vi.fn().mockResolvedValue({
  ok: true,
  json: () =>
    Promise.resolve({
      data: {
        total_cost: 0.01,
        provider_name: "test-provider",
        tokens_prompt: 100,
        tokens_completion: 50,
      },
    }),
});
global.fetch = mockFetch;

describe("performAiEdit", () => {
  const mockFiles: VizFiles = {
    file1: {
      name: "test.js",
      text: 'console.log("original");',
    },
  };

  const defaultParams = {
    prompt: "Update the code",
    files: mockFiles,
    llmFunction: mockLlmFunction,
    apiKey: "test-key",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should process files and return expected result with 'whole' format", async () => {
    const result = await performAiEdit({
      ...defaultParams,
      editFormat: "whole",
    });

    expect(result).toMatchObject({
      openRouterGenerationId: "test-generation-id",
      upstreamCostCents: 1,
      provider: "test-provider",
      inputTokens: 100,
      outputTokens: 50,
      promptTemplateVersion: 1,
    });

    // Verify file content was updated
    expect(result.changedFiles["file1"].text).toBe("console.log('updated');");
  });

  it("should apply changes correctly with 'diff' format", async () => {
    const mockDiffLlmFunction: LlmFunction = vi.fn().mockResolvedValue({
      content: [
        "test.js",
        "```",
        "<<<<<<< SEARCH",
        'console.log("original");',
        "=======",
        'console.log("updated via diff");',
        ">>>>>>> REPLACE",
        "```",
      ].join("\n"),
      generationId: "test-diff-generation-id",
    });

    const result = await performAiEdit({
      ...defaultParams,
      llmFunction: mockDiffLlmFunction,
      editFormat: "diff",
    });

    expect(result.changedFiles["file1"].text).toBe(
      'console.log("updated via diff");',
    );
  });

  it("should apply changes correctly with 'diff-fenced' format", async () => {
    const mockDiffLlmFunction: LlmFunction = vi.fn().mockResolvedValue({
      content: [
        "```",
        "test.js",
        "<<<<<<< SEARCH",
        'console.log("original");',
        "=======",
        'console.log("updated via diff-fenced");',
        ">>>>>>> REPLACE",
        "```",
      ].join("\n"),
      generationId: "test-diff-fenced-id",
    });

    const result = await performAiEdit({
      ...defaultParams,
      llmFunction: mockDiffLlmFunction,
      editFormat: "diff-fenced",
    });

    expect(result.changedFiles["file1"].text).toBe(
      'console.log("updated via diff-fenced");',
    );
  });

  it("should apply changes correctly with 'udiff' format", async () => {
    const mockLlmFunction: LlmFunction = vi.fn().mockResolvedValue({
      content: [
        "```diff",
        "--- test.js",
        "+++ test.js",
        "@@ -1 +1 @@",
        '-console.log("original");',
        '+console.log("updated via udiff");',
        "```",
      ].join("\n"),
      generationId: "test-udiff-id",
    });
    const result = await performAiEdit({
      ...defaultParams,
      llmFunction: mockLlmFunction,
      editFormat: "udiff",
    });
    expect(result.changedFiles["file1"].text).toBe(
      'console.log("updated via udiff");',
    );
  });

  it("should handle file deletion when empty content is returned", async () => {
    // Mock LLM function to return empty content for a file
    const mockDeleteLlmFunction: LlmFunction = vi.fn().mockResolvedValue({
      content: `**test.js**

\`\`\`js

\`\`\`
`,
      generationId: "test-generation-id",
    });

    const result = await performAiEdit({
      ...defaultParams,
      llmFunction: mockDeleteLlmFunction,
    });

    expect(Object.keys(result.changedFiles)).toHaveLength(0);
  });

  it("should handle new file creation", async () => {
    // Mock LLM function to return a new file
    const mockCreateLlmFunction: LlmFunction = vi.fn().mockResolvedValue({
      content: `**new-file.js**

\`\`\`js
console.log('new file');
\`\`\`
`,
      generationId: "test-generation-id",
    });

    const result = await performAiEdit({
      ...defaultParams,
      llmFunction: mockCreateLlmFunction,
    });

    const newFile = Object.values(result.changedFiles).find(
      (f) => f.name === "new-file.js",
    );
    expect(newFile).toBeDefined();
    expect(newFile?.text).toBe("console.log('new file');");
  });
});

describe("FORMAT_INSTRUCTIONS", () => {
  it("should be exported and contain all edit formats", () => {
    expect(FORMAT_INSTRUCTIONS).toBeDefined();
    expect(typeof FORMAT_INSTRUCTIONS).toBe("object");

    // Check that all expected edit formats are present
    expect(FORMAT_INSTRUCTIONS).toHaveProperty("whole");
    expect(FORMAT_INSTRUCTIONS).toHaveProperty("diff");
    expect(FORMAT_INSTRUCTIONS).toHaveProperty("diff-fenced");
    expect(FORMAT_INSTRUCTIONS).toHaveProperty("udiff");

    // Check that each format has string instructions
    expect(typeof FORMAT_INSTRUCTIONS.whole).toBe("string");
    expect(typeof FORMAT_INSTRUCTIONS.diff).toBe("string");
    expect(typeof FORMAT_INSTRUCTIONS["diff-fenced"]).toBe("string");
    expect(typeof FORMAT_INSTRUCTIONS.udiff).toBe("string");

    // Verify the instructions contain expected content
    expect(FORMAT_INSTRUCTIONS.whole).toContain("Formatting Instructions");
    expect(FORMAT_INSTRUCTIONS.diff).toContain("search/replace block format");
    expect(FORMAT_INSTRUCTIONS["diff-fenced"]).toContain(
      "file path inside the fence",
    );
    expect(FORMAT_INSTRUCTIONS.udiff).toContain("unified diff format");
  });
});
