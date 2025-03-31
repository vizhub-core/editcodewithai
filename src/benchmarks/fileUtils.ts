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
  let csv =
    "challenge,model,passFail,grade,aesthetics,reviewedBy,reviewedAt,notes\n";
  for (const r of results) {
    csv += `${r.challenge},${r.model},${r.passFail},`;
    // Add human grading fields if they exist
    if (r.humanGrade) {
      csv += `${r.humanGrade.grade},`;
      csv += `${r.humanGrade.aesthetics || ""},`;
      csv += `${r.humanGrade.reviewedBy},`;
      csv += `${r.humanGrade.reviewedAt},`;
      csv += `"${(r.humanGrade.notes || "").replace(/"/g, '""')}"`;
    } else {
      csv += ",,,,"; // Empty columns for ungraded entries
    }
    csv += "\n";
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

// Add function to save visualization outputs
export function saveVisualizationOutput(
  challengeName: string,
  model: string,
  imageData: string
): string {
  const outputDir = path.join(
    "benchmarks",
    "visualizations",
    challengeName,
    model
  );
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, "output.png");
  fs.writeFileSync(outputPath, Buffer.from(imageData, "base64"));

  return outputPath;
}

/**
 * Reads results from the CSV file
 */
export function readResultsFromCsv(
  filePath: string = "benchmarks/results.csv"
): ChallengeResult[] {
  if (!fs.existsSync(filePath)) {
    return [];
  }

  const csvContent = fs.readFileSync(filePath, "utf-8");
  const lines = csvContent.split("\n").filter((line) => line.trim());
  const headers = lines[0].split(",");

  return lines.slice(1).map((line) => {
    const values = line.split(",");
    const result: ChallengeResult = {
      challenge: values[0],
      model: values[1],
      passFail: values[2] as "pass" | "fail" | "error",
    };

    // Check if human grading data exists
    if (values[3]) {
      const grade = parseInt(values[3]);
      const aesthetics = values[4] ? parseInt(values[4]) : undefined;

      result.humanGrade = {
        grade: (grade >= 0 && grade <= 5 ? grade : 0) as 0 | 1 | 2 | 3 | 4 | 5,
        aesthetics:
          aesthetics !== undefined
            ? ((aesthetics >= 0 && aesthetics <= 5 ? aesthetics : 0) as
                | 0
                | 1
                | 2
                | 3
                | 4
                | 5)
            : undefined,
        reviewedBy: values[5],
        reviewedAt: values[6],
        notes: values[7]?.replace(/""/g, '"')?.replace(/^"|"$/g, ""),
      };
    }

    return result;
  });
}
