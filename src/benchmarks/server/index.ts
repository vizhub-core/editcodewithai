import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";
import { readResultsFromCsv, writeResultsToCsv } from "../fileUtils";
import { ChallengeResult } from "../types";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../../../benchmarks")));

// Routes
app.get("/api/results", (req: Request, res: Response) => {
  try {
    const results = readResultsFromCsv();
    res.json(results);
  } catch (error) {
    console.error("Error reading results:", error);
    res.status(500).json({ error: "Failed to read results" });
  }
});

app.post("/api/results", (req: Request, res: Response) => {
  try {
    const newResults = req.body as ChallengeResult[];
    if (!Array.isArray(newResults)) {
      return res
        .status(400)
        .json({ error: "Expected an array of challenge results" });
    }

    // Combine with existing results
    const existingResults = readResultsFromCsv();

    // Update existing results or add new ones
    const updatedResults = [...existingResults];

    for (const newResult of newResults) {
      const index = updatedResults.findIndex(
        (r) =>
          r.challenge === newResult.challenge && r.model === newResult.model
      );

      if (index !== -1) {
        updatedResults[index] = { ...updatedResults[index], ...newResult };
      } else {
        updatedResults.push(newResult);
      }
    }

    writeResultsToCsv(updatedResults);
    res.json({ success: true, count: newResults.length });
  } catch (error) {
    console.error("Error updating results:", error);
    res.status(500).json({ error: "Failed to update results" });
  }
});

// Get challenges from benchmarks directory
app.get("/api/challenges", (req: Request, res: Response) => {
  try {
    const results = readResultsFromCsv();
    const challenges = [...new Set(results.map((r) => r.challenge))];
    res.json(challenges);
  } catch (error) {
    console.error("Error fetching challenges:", error);
    res.status(500).json({ error: "Failed to fetch challenges" });
  }
});

// Get models from benchmarks directory
app.get("/api/models", (req: Request, res: Response) => {
  try {
    const results = readResultsFromCsv();
    const models = [...new Set(results.map((r) => r.model))];
    res.json(models);
  } catch (error) {
    console.error("Error fetching models:", error);
    res.status(500).json({ error: "Failed to fetch models" });
  }
});

// Start server
export function startServer() {
  return app.listen(PORT, () => {
    console.log(`Benchmark server running at http://localhost:${PORT}`);
  });
}

// If this file is run directly
if (require.main === module) {
  startServer();
}

export default app;
