import { useState } from "react";
import type { Result } from "../types/result";

interface Props {
  result: Result;
  index: number;
  onGradeChange: (index: number, type: "technical" | "aesthetics", value: number) => void;
  onNotesChange: (index: number, notes: string) => void;
}

export function GradeResult({ result, index, onGradeChange, onNotesChange }: Props) {
  return (
    <div className="result-card" tabIndex={0}>
      <div className="meta">
        <span>{result.challenge} - {result.model} ({result.passFail})</span>
      </div>

      <div className="viz-container">
        <img src={`/benchmarks/visualizations/${result.challenge}/${result.model}/output.png`} alt="Visualization" />
      </div>

      <div className="grade-controls">
        {['technical', 'aesthetics'].map((type) => (
          <div key={type} className="grade-group">
            <label>{type.charAt(0).toUpperCase() + type.slice(1)}:</label>
            <div className="grade-buttons">
              {[0, 1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  className={`grade-btn ${result[type as keyof Result] === n ? 'selected' : ''}`}
                  onClick={() => onGradeChange(index, type as "technical" | "aesthetics", n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <textarea
        className="notes"
        placeholder="Notes..."
        value={result.notes || ''}
        onChange={(e) => onNotesChange(index, e.target.value)}
      />
    </div>
  );
}
