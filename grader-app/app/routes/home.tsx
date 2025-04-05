import { useState, useEffect } from "react";
import { csvParse } from "d3-dsv";
import type { Route } from "./+types/home";
import { GradeResult } from "../components/GradeResult";
import type { Result } from "../types/result";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Grade Result Player" },
    {
      name: "description",
      content: "Grade AI-generated visualizations",
    },
  ];
}

export default function Home() {
  const [results, setResults] = useState<Result[]>([]);
  const [reviewer, setReviewer] = useState("");

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const response = await fetch(
        "/benchmarks/results/results.csv"
      );
      const text = await response.text();
      const data = csvParse(text);
      console.log(data);
      const parsedResults = data
        .map((row) => ({
          challenge: row.challenge,
          model: row.model,
          type: row.type,
          passFail: row.passFail,
          technical: row.grade
            ? Number(row.grade)
            : undefined,
          aesthetics: row.aesthetics
            ? Number(row.aesthetics)
            : undefined,
          reviewedBy: row.reviewedBy,
          reviewedAt: row.reviewedAt,
          notes: row.notes,
        }))
        .filter(
          (result) => result.type === "visualization"
        );
      setResults(parsedResults);
    } catch (error) {
      console.error("Failed to load results:", error);
    }
  };

  const handleGradeChange = (
    index: number,
    type: "technical" | "aesthetics",
    value: number
  ) => {
    setResults((prev) => {
      const newResults = [...prev];
      newResults[index] = {
        ...newResults[index],
        [type]: value,
      };
      return newResults;
    });
    saveResults();
  };

  const handleNotesChange = (
    index: number,
    notes: string
  ) => {
    setResults((prev) => {
      const newResults = [...prev];
      newResults[index] = { ...newResults[index], notes };
      return newResults;
    });
    saveResults();
  };

  const saveResults = async () => {
    const reviewerName = reviewer || "anonymous";
    let csv =
      "challenge,model,passFail,grade,aesthetics,reviewedBy,reviewedAt,notes\n";

    results.forEach((r) => {
      csv +=
        [
          r.challenge,
          r.model,
          r.passFail,
          r.technical || "",
          r.aesthetics || "",
          reviewerName,
          new Date().toISOString(),
          `"${(r.notes || "").replace(/"/g, '""')}"`,
        ].join(",") + "\n";
    });

    try {
      const response = await fetch(
        "benchmarks/results.csv",
        {
          method: "PUT",
          body: csv,
        }
      );
      if (!response.ok) throw new Error("Failed to save");
    } catch (e) {
      console.error("Failed to save results:", e);
      console.error("Failed to save results to server");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="header mb-8">
        <h1 className="text-2xl font-bold">
          Grade Result Player
        </h1>
        <input
          type="text"
          className="reviewer-input"
          placeholder="Reviewer name"
          value={reviewer}
          onChange={(e) => setReviewer(e.target.value)}
        />
      </div>

      <div
        id="results"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4"
      >
        {results.map((result, index) => (
          <GradeResult
            key={`${result.challenge}-${result.model}`}
            result={result}
            index={index}
            onGradeChange={handleGradeChange}
            onNotesChange={handleNotesChange}
          />
        ))}
      </div>

      <div className="keyboard-tips">
        1-5: Technical Grade
        <br />
        Shift + 1-5: Aesthetics
        <br />
        Tab: Next Result
      </div>
    </div>
  );
}
