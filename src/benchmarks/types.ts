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
}

export interface TestRunResult {
  pass: boolean;
  output: string;
  outputImage?: string;
}

export interface PerformAiEditParams {
  files: VizFiles;
  prompt: string;
  model: string;
  apiKey: string;
  cache?: any;
}

export interface PerformAiEditResult {
  outputDir: string;
  output: string;
  duration: number;
}
