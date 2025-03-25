import { VizFiles } from "@vizhub/viz-types";
import fs from "fs";
import path from "path";
import { ChallengeResult } from "./types";

/**
 * Writes the files for a given challenge into a folder named after challenge.name + model
 * e.g. "benchmarks/challenges/add/gpt4" to keep them separate per model.
 */
export function writeChallengeFiles(
  challengeName: string,
  model: string,
  changedFiles: VizFiles,
  llmResponse?: string
): string {
  const challengeDir = path.join(
    "benchmarks",
    "challenges",
    challengeName,
    model
  );

  if (!fs.existsSync(challengeDir)) {
    fs.mkdirSync(challengeDir, { recursive: true });
  }

  Object.keys(changedFiles).forEach((fileKey) => {
    const { name, text } = changedFiles[fileKey];
    const filePath = path.join(challengeDir, name);
    fs.writeFileSync(filePath, text, "utf-8");
  });

  // Write the LLM response to a file if provided
  if (llmResponse) {
    const responsePath = path.join(challengeDir, "llmResponse.md");
    fs.writeFileSync(responsePath, llmResponse, "utf-8");
  }

  return challengeDir;
}

/**
 * Writes results to a CSV file
 */
export function writeResultsToCsv(
  results: ChallengeResult[],
  filePath: string = "benchmarks/results.csv"
): string {
  let csv = "challenge,model,passFail\n";
  for (const r of results) {
    csv += `${r.challenge},${r.model},${r.passFail}\n`;
  }

  // Ensure benchmarks directory exists
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(filePath, csv, "utf-8");
  return csv;
}

/**
 * Ensures a cache directory exists
 */
export function ensureCacheDir(cacheDirBase: string): void {
  if (!fs.existsSync(cacheDirBase)) {
    fs.mkdirSync(cacheDirBase, { recursive: true });
  }
}
