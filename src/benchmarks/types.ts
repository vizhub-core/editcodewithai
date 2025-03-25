import { VizFiles } from "@vizhub/viz-types";

export interface Challenge {
  name: string;
  prompt: string;
  files: VizFiles;
}

export interface ChallengeResult {
  challenge: string;
  model: string;
  passFail: "pass" | "fail" | "error";
}

export interface TestRunResult {
  status: number | null;
  stdout: string;
  stderr: string;
}
