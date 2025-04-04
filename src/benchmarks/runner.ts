import { spawnSync } from "child_process";
import puppeteer, { Browser, Page, ConsoleMessage } from "puppeteer"; // Import Browser, Page, ConsoleMessage
import http from "http";
import fs from "fs";
import path from "path";
import { URL } from "url";
import { TestRunResult } from "./types"; // Import TestRunResult

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
  // Check if index.mjs exists
  const entryPoint = path.join(challengeDir, "index.mjs");
  if (!fs.existsSync(entryPoint)) {
    return {
      pass: false,
      output: `Error: Entry point file not found: ${entryPoint}`,
    };
  }

  const child = spawnSync("node", ["index.mjs"], {
    cwd: challengeDir,
    encoding: "utf-8",
    timeout: 10000, // Add a timeout (e.g., 10 seconds)
  });

  if (child.error) {
    return {
      pass: false,
      output: `Execution error: ${child.error.message}`,
    };
  }

  if (child.signal) {
    return {
      pass: false,
      output: `Process terminated by signal: ${child.signal}`,
    };
  }

  return {
    pass: child.status === 0,
    output: child.stdout + (child.stderr ? `\nErrors:\n${child.stderr}` : ""),
  };
}

// Determine content type based on file extension (moved from core.ts)
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

/**
 * Runs visualization test by starting a local server and capturing screenshot
 */
async function runVisualizationTest(
  challengeDir: string
): Promise<TestRunResult> {
  // Start a simple HTTP server
  const server = http.createServer((req, res) => {
    const url = new URL(req.url || "/", `http://${req.headers.host}`);
    let filePath = path.join(
      challengeDir,
      url.pathname === "/" ? "index.html" : decodeURIComponent(url.pathname) // Decode URI component
    );

    // Security check: Prevent accessing files outside challengeDir
    if (!filePath.startsWith(path.resolve(challengeDir))) {
        res.writeHead(403);
        res.end("Forbidden");
        return;
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }

    if (fs.existsSync(filePath)) {
      try {
        const contentType = getContentType(filePath);
        const content = fs.readFileSync(filePath);
        res.writeHead(200, { "Content-Type": contentType });
        res.end(content);
      } catch (err: any) {
        console.error(`Error reading file ${filePath}:`, err);
        res.writeHead(500);
        res.end("Internal Server Error");
      }
    } else {
      res.writeHead(404);
      res.end("File not found");
    }
  });

  // Use a random available port
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as any).port;
  let browser: Browser | null = null; // Use imported Browser type

  try {
    // Launch browser and capture screenshot
    browser = await puppeteer.launch({
        headless: true, // Ensure headless mode
        args: ['--no-sandbox', '--disable-setuid-sandbox'] // Common args for CI/Docker
    });
    const page: Page = await browser.newPage(); // Use imported Page type
    await page.setViewport({ width: 800, height: 600 });

    // Capture console errors from the page
    let pageError: string | null = null;
    page.on('console', (msg: ConsoleMessage) => { // Added ConsoleMessage type
        if (msg.type() === 'error') {
            console.error(`PAGE CONSOLE ERROR: ${msg.text()}`);
            if (!pageError) pageError = msg.text(); // Capture first error
        }
    });
    page.on('pageerror', (err: Error) => { // Added Error type
        console.error(`PAGE RUNTIME ERROR: ${err.message}`);
        if (!pageError) pageError = err.message; // Capture first error
    });


    // Wait for chart to render
    const response = await page.goto(`http://localhost:${port}/index.html`, {
      waitUntil: "networkidle0", // Wait until network is idle
      timeout: 15000, // Increased timeout
    });

    if (!response || !response.ok()) {
        throw new Error(`Failed to load page: Status ${response?.status()}`);
    }

    // Check for specific element indicating successful render
    try {
        await page.waitForSelector("#chart > *", { timeout: 10000 }); // Wait for children in #chart
    } catch (e) {
        // If selector fails, try waiting a bit longer for potential async ops
        await new Promise(resolve => setTimeout(resolve, 2000)); // Use standard setTimeout
        // Try checking again or assume failure
        try {
            await page.waitForSelector("#chart > *", { timeout: 1000 });
        } catch (finalE) {
             throw new Error("Chart element (#chart > *) did not appear within timeout.");
        }
    }

    // Additional wait for animations/transitions if needed
    await new Promise(resolve => setTimeout(resolve, 1000)); // Use standard setTimeout

    // Check if a page error occurred
    if (pageError) {
        throw new Error(`Page console/runtime error: ${pageError}`);
    }

    // Capture screenshot
    const screenshot = await page.screenshot({ encoding: "base64" });

    return {
      pass: true,
      output: "Visualization rendered successfully",
      outputImage: screenshot as string,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Visualization test error:", errorMessage); // Log error
    return {
      pass: false,
      output: errorMessage,
    };
  } finally {
    if (browser && browser.process() != null) { // Check if browser is still connected
        await browser.close();
    }
    server.close();
  }
}

// Example usage (if run directly)
if (require.main === module) {
  (async () => {
    const testDir = process.argv[2];
    const testType = (process.argv[3] || "code") as "code" | "visualization";
    if (!testDir) {
      console.error("Please provide a directory to test.");
      process.exit(1);
    }
    console.log(`Running ${testType} test in directory: ${testDir}`);
    const result = await runTest(testDir, testType);
    console.log("--- Test Result ---");
    console.log("Pass:", result.pass);
    console.log("Output:\n", result.output.trim());
    if (result.outputImage) {
      console.log("Screenshot captured successfully (Base64 data omitted)");
      // Optionally save the image for inspection:
      // fs.writeFileSync('screenshot.png', Buffer.from(result.outputImage, 'base64'));
      // console.log("Screenshot saved to screenshot.png");
    }
    console.log("-------------------");
    process.exit(result.pass ? 0 : 1);
  })();
}
