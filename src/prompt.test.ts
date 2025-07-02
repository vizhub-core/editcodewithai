import { describe, it, expect } from "vitest";
import { assembleFullPrompt, PROMPT_TEMPLATE_VERSION } from "./prompt";

describe("prompt", () => {
  describe("assembleFullPrompt", () => {
    it("should combine task, files context, and 'whole' formatting instructions by default", () => {
      const prompt = "Update the code";
      const filesContext = "**file.js**\n```js\nconsole.log('hello');\n```";

      const result = assembleFullPrompt({ filesContext, prompt });

      // Check that all parts are included
      expect(result).toContain("## Your Task");
      expect(result).toContain("Update the code");
      expect(result).toContain("## Original Files");
      expect(result).toContain(filesContext);
      expect(result).toContain("## Formatting Instructions");
      expect(result).toContain(
        "To suggest changes you MUST include the ENTIRE content of the updated file.",
      );
    });

    it("should use diff format instructions when specified", () => {
      const prompt = "Fix bugs";
      const filesContext = "**test.js**\n```js\nlet x = 1;\n```";

      const result = assembleFullPrompt({
        filesContext,
        prompt,
        editFormat: "diff",
      });

      expect(result).toContain("<<<<<<< SEARCH");
      expect(result).not.toContain(
        "To suggest changes you MUST include the ENTIRE content of the updated file.",
      );
    });

    it("should maintain the correct order of sections", () => {
      const prompt = "Fix bugs";
      const filesContext = "**test.js**\n```js\nlet x = 1;\n```";

      const result = assembleFullPrompt({ filesContext, prompt });
      const sections = result.split("\n\n");

      // Task should come before Files, which should come before Format
      const taskIndex = sections.findIndex((s) => s.includes("## Your Task"));
      const filesIndex = sections.findIndex((s) =>
        s.includes("## Original Files"),
      );
      const formatIndex = sections.findIndex((s) =>
        s.includes("## Formatting Instructions"),
      );

      expect(taskIndex).toBeLessThan(filesIndex);
      expect(filesIndex).toBeLessThan(formatIndex);
    });
  });

  it("should export a prompt template version", () => {
    expect(PROMPT_TEMPLATE_VERSION).toBe(1);
  });
});
