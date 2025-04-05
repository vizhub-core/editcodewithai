import { VizFiles } from "@vizhub/viz-types";

export interface Challenge {
  name: string;
  prompt: string;
  files: VizFiles;
  type?: "code" | "visualization";
  sampleData?: string;
}

export interface ChallengeResult {
  challenge: string;
  model: string;
  passFail: "pass" | "fail" | "error";
  testOutput?: string;
  editOutput?: string;
  duration?: number;
  humanGrade?: {
    grade: 0 | 1 | 2 | 3 | 4 | 5;
    aesthetics?: 0 | 1 | 2 | 3 | 4 | 5;
    notes?: string;
    reviewedBy: string;
    reviewedAt: string;
  };
  type?: "code" | "visualization";
}

export interface TestRunResult {
  pass: boolean;
  output: string;
  outputImage?: string;
}

// Note: This PerformAiEditParams might be specific to the benchmark runner context
// if it differs significantly from the one in src/types.ts
export interface PerformAiEditParams {
  files: VizFiles;
  prompt: string;
  model: string; // Model is required here, unlike the general one
  apiKey: string;
  cache?: any; // Consider using a more specific type if possible
  baseURL?: string; // Added baseURL
}

// Note: This PerformAiEditResult might be specific to the benchmark runner context
export interface PerformAiEditResult {
  outputDir: string; // Specific to benchmark runner's file writing
  output: string; // Likely the raw LLM response or edit output
  duration: number;
  changedFiles: VizFiles; // Added changedFiles
  rawResponse?: string; // Added rawResponse
}
