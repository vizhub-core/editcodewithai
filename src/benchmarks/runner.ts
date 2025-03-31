import { spawnSync } from "child_process";
import { TestRunResult } from "./types";
import puppeteer from "puppeteer";
import express from "express";
import path from "path";

/**
 * Runs the appropriate test based on challenge type
 */
export async function runTest(
  challengeDir: string,
  type: "code" | "visualization" = "code"
): Promise<TestRunResult> {
  if (type === "visualization") {
    return runVisualizationTest(challengeDir);
  }
  return runCodeTest(challengeDir);
}

/**
 * Runs code-based test using Node
 */
function runCodeTest(challengeDir: string): TestRunResult {
  const child = spawnSync("node", ["index.mjs"], {
    cwd: challengeDir,
    encoding: "utf-8",
  });

  return {
    pass: child.status === 0,
    output: child.stdout + (child.stderr ? `\nErrors:\n${child.stderr}` : ""),
  };
}

/**
 * Runs visualization test by starting a local server and capturing screenshot
 */
async function runVisualizationTest(
  challengeDir: string
): Promise<TestRunResult> {
  // Start express server
  const app = express();
  app.use(express.static(challengeDir));
  const server = app.listen(0); // Random port
  const port = (server.address() as any).port;

  try {
    // Launch browser and capture screenshot
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 800, height: 600 });

    // Wait for chart to render
    await page.goto(`http://localhost:${port}/index.html`);
    await page.waitForSelector("#chart");
    await page.waitForTimeout(1000); // Give D3 time to animate

    // Capture screenshot
    const screenshot = await page.screenshot({ encoding: "base64" });

    await browser.close();

    return {
      pass: true,
      output: "Visualization rendered successfully",
      outputImage: screenshot as string,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      pass: false,
      output: errorMessage,
    };
  } finally {
    server.close();
  }
}

/**
 * Logs the test result to the console
 */
function logTestResult(challengeDir: string, result: TestRunResult): void {
  console.log(`--- Running test in ${challengeDir} ---`);
  console.log("Output:\n", result.output.trim());
  console.log("Pass:", result.pass);
  if (result.outputImage) {
    console.log("Screenshot captured successfully\n");
  }
}
