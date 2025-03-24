import { VizFiles } from "@vizhub/viz-types";

export type LlmFunction = (prompt: string) => Promise<{
  content: string;
  generationId?: string;
}>;

export interface PerformAiEditParams {
  prompt: string;
  files: VizFiles;
  llmFunction: LlmFunction;
  apiKey?: string;
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
