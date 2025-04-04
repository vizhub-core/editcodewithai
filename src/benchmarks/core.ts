import { LocalFileCache } from "langchain/cache/file_system";
import { createOpenRouterLlmFunction } from "./llm";
import {
  writeChallengeFiles,
  writeResultsToCsv,
  readResultsFromCsv,
  ensureCacheDir,
  saveVisualizationOutput,
} from "./fileUtils";
import { Challenge, ChallengeResult, TestRunResult } from "./types";
import path from "path";
import { spawnSync } from "child_process";
import puppeteer, { Browser, Page } from "puppeteer"; // Import Browser and Page
import http from "http";
import fs from "fs";
import { exec } from "child_process";
import { URL } from "url";
import { performAiEdit } from "..";

// --------------- BENCHMARK RUNNER ---------------

/**
 * Main function: runs the challenges on different models, calls the AI to fill them in,
 * executes each test, and writes pass/fail results to CSV.
 */
export async function runBenchmark(
  challenges: Challenge[],
  models: string[],
  apiKey: string,
  options: {
    cacheEnabled?: boolean;
    outputDir?: string;
  } = {}
): Promise<ChallengeResult[]> {
  const results: ChallengeResult[] = [];
  const cacheDirBase = path.join(process.cwd(), "benchmarks/cache");

  // Setup cache if enabled
  let cache;
  if (options.cacheEnabled) {
    ensureCacheDir(cacheDirBase);
    cache = await LocalFileCache.create(cacheDirBase);
  }

  for (const challenge of challenges) {
    for (const model of models) {
      console.log(`Running ${challenge.name} with ${model}...`);

      try {
        // Create LLM function for this model
        const llmFunction = createOpenRouterLlmFunction(model, apiKey, cache);

        // Ask AI to fill out the placeholder TODOs
        const aiResult = await performAiEdit({
          prompt: challenge.prompt,
          files: challenge.files,
          llmFunction,
          apiKey,
          baseURL: "https://openrouter.ai/api/v1",
        });

        // Write returned files to disk, including LLM response
        const challengeDir = writeChallengeFiles(
          challenge.name,
          model,
          aiResult.changedFiles,
          aiResult.rawResponse
        );

        // Run test based on challenge type
        const testResult = await runTest(
          challengeDir,
          challenge.type || "code"
        );

        // For visualization challenges, save the output image
        if (challenge.type === "visualization" && testResult.outputImage) {
          const imagePath = saveVisualizationOutput(
            challenge.name,
            model,
            testResult.outputImage
          );
          console.log(`Visualization saved to: ${imagePath}`);
        }

        const result: ChallengeResult = {
          challenge: challenge.name,
          model,
          passFail: testResult.pass ? "pass" : "fail",
          testOutput: testResult.output,
          editOutput: aiResult.rawResponse || "",
          duration: 0, // We could track duration if needed
        };

        results.push(result);
      } catch (error) {
        console.error(`Error running ${challenge.name} with ${model}:`, error);
        results.push({
          challenge: challenge.name,
          model,
          passFail: "error",
          testOutput: error instanceof Error ? error.message : String(error),
          editOutput: "",
          duration: 0,
        });
      }
    }
  }

  // Write results to CSV
  const outputPath = options.outputDir
    ? path.join(options.outputDir, "results.csv")
    : "benchmarks/results.csv";
  writeResultsToCsv(results, outputPath);

  return results;
}

// --------------- TEST RUNNERS ---------------

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
  // Start a simple HTTP server
  const server = http.createServer((req, res) => {
    const url = new URL(req.url || "/", "http://localhost");
    let filePath = path.join(
      challengeDir,
      url.pathname === "/" ? "index.html" : url.pathname
    );

    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }

    if (fs.existsSync(filePath)) {
      const contentType = getContentType(filePath);
      const content = fs.readFileSync(filePath);
      res.writeHead(200, { "Content-Type": contentType });
      res.end(content);
    } else {
      res.writeHead(404);
      res.end("File not found");
    }
  });

  // Use a random available port
  await new Promise<void>((resolve) => server.listen(0, resolve)); // Wait for server to listen
  const port = (server.address() as any).port;
  let browser: Browser | null = null; // Use imported Browser type

  try {
    // Launch browser and capture screenshot
    browser = await puppeteer.launch();
    const page: Page = await browser.newPage(); // Use imported Page type
    await page.setViewport({ width: 800, height: 600 });

    // Wait for chart to render
    await page.goto(`http://localhost:${port}/index.html`);
    await page.waitForSelector("#chart", { timeout: 5000 });
    // Replace waitForTimeout with standard setTimeout
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Give D3 time to animate

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
    if (browser && browser.process() != null) {
      // Check if browser is still connected
      await browser.close();
    }
    server.close();
  }
}

// Determine content type based on file extension
function getContentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".html":
      return "text/html";
    case ".js":
    case ".mjs": // Added .mjs
      return "text/javascript";
    case ".css":
      return "text/css";
    case ".json":
      return "application/json";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".svg":
      return "image/svg+xml";
    case ".csv": // Added .csv
      return "text/csv";
    default:
      return "text/plain";
  }
}

// --------------- GRADER SERVER ---------------

/**
 * Creates a simple HTTP server for the grader UI
 */
export function createGraderServer(): http.Server {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url || "/", `http://localhost`);
    const pathname = url.pathname;

    // Handle API endpoints
    if (pathname.startsWith("/api/")) {
      handleApiRequest(pathname, req, res);
      return;
    }

    // Serve static files
    let filePath = path.join(process.cwd(), "benchmarks", url.pathname);

    // Default to GradeResultPlayer.html
    if (pathname === "/") {
      filePath = path.join(process.cwd(), "GradeResultPlayer.html");
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }

    if (fs.existsSync(filePath)) {
      const contentType = getContentType(filePath);
      const content = fs.readFileSync(filePath);
      res.writeHead(200, { "Content-Type": contentType });
      res.end(content);
    } else {
      res.writeHead(404);
      res.end("File not found");
    }
  });

  return server;
}

/**
 * Handle API requests
 */
function handleApiRequest(
  pathname: string,
  req: http.IncomingMessage,
  res: http.ServerResponse
) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle OPTIONS request for CORS preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  try {
    switch (pathname) {
      case "/api/results":
        if (req.method === "GET") {
          const results = readResultsFromCsv();
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(results));
        } else if (req.method === "POST") {
          let body = "";
          req.on("data", (chunk) => {
            body += chunk.toString();
          });

          req.on("end", () => {
            try {
              const newResults = JSON.parse(body) as ChallengeResult[];
              if (!Array.isArray(newResults)) {
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end(
                  JSON.stringify({
                    error: "Expected an array of challenge results",
                  })
                );
                return;
              }

              // Update existing results
              const existingResults = readResultsFromCsv();
              const updatedResults = [...existingResults];

              for (const newResult of newResults) {
                const index = updatedResults.findIndex(
                  (r) =>
                    r.challenge === newResult.challenge &&
                    r.model === newResult.model
                );

                if (index !== -1) {
                  updatedResults[index] = {
                    ...updatedResults[index],
                    ...newResult,
                  };
                } else {
                  updatedResults.push(newResult);
                }
              }

              writeResultsToCsv(updatedResults);
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(
                JSON.stringify({ success: true, count: newResults.length })
              );
            } catch (error) {
              res.writeHead(400, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: "Invalid JSON data" }));
            }
          });
        } else {
          res.writeHead(405, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Method not allowed" }));
        }
        break;

      case "/api/challenges":
        if (req.method === "GET") {
          const results = readResultsFromCsv();
          const challenges = [...new Set(results.map((r) => r.challenge))];
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(challenges));
        } else {
          res.writeHead(405, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Method not allowed" }));
        }
        break;

      case "/api/models":
        if (req.method === "GET") {
          const results = readResultsFromCsv();
          const models = [...new Set(results.map((r) => r.model))];
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(models));
        } else {
          res.writeHead(405, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Method not allowed" }));
        }
        break;

      default:
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Endpoint not found" }));
    }
  } catch (error) {
    console.error("API error:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
}

/**
 * Start the grader server and open the UI in the browser
 */
export function startGraderUI(
  port: number = 3001,
  challenge?: string
): http.Server {
  const server = createGraderServer();

  server.listen(port, () => {
    console.log(`Grader UI server running at http://localhost:${port}`);

    // Build URL with optional challenge parameter
    let graderUrl = `http://localhost:${port}/`;
    if (challenge) {
      graderUrl += `?challenge=${encodeURIComponent(challenge)}`;
    }

    console.log(`Opening grader UI at ${graderUrl}`);

    // Open in the default browser
    switch (process.platform) {
      case "darwin":
        exec(`open "${graderUrl}"`);
        break;
      case "win32":
        exec(`start "${graderUrl}"`);
        break;
      default:
        exec(`xdg-open "${graderUrl}"`);
    }
  });

  return server;
}
