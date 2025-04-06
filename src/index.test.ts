import { describe, it, expect, vi, beforeEach } from "vitest";
import { performAiEdit } from "./index";
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

  it("should process files and return expected result", async () => {
    const result = await performAiEdit(defaultParams);

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
