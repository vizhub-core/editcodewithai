import { spawnSync } from "child_process";
import { TestRunResult } from "./types";

/**
 * Runs "index.mjs" for a given challenge directory with Node and returns exit code.
 */
export function runNodeTest(challengeDir: string): number {
  const result = runNodeProcess(challengeDir);
  logTestResult(challengeDir, result);
  return result.status ?? 1; // If status is null, consider that a failure
}

/**
 * Executes the Node.js process for a test
 */
function runNodeProcess(challengeDir: string): TestRunResult {
  const child = spawnSync("node", ["index.mjs"], {
    cwd: challengeDir,
    encoding: "utf-8",
  });
  
  return {
    status: child.status,
    stdout: child.stdout,
    stderr: child.stderr
  };
}

/**
 * Logs the test result to the console
 */
function logTestResult(challengeDir: string, result: TestRunResult): void {
  console.log(`--- Running test in ${challengeDir} ---`);
  console.log("stdout:\n", result.stdout.trim());
  console.log("stderr:\n", result.stderr.trim());
  console.log("exit code:", result.status, "\n");
}
