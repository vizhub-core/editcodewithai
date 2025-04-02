import { VizFiles } from "@vizhub/viz-types";
import { Challenge } from "./types";

const stockData = `date,symbol,price
2000-01-01,AAPL,100
2000-02-01,AAPL,120
2000-03-01,AAPL,115
2000-04-01,AAPL,140
2000-05-01,AAPL,135
2000-06-01,AAPL,160
2000-07-01,AAPL,165
2000-08-01,AAPL,170
2000-09-01,AAPL,155
2000-10-01,AAPL,180
2000-11-01,AAPL,190
2000-12-01,AAPL,200`;

export const challenges: Challenge[] = [
  {
    name: "add",
    prompt:
      "Implement the 'add' function in functions.mjs to correctly add two numbers (a+b) and pass the test in index.mjs.",
    files: {
      file1: {
        name: "index.mjs",
        text: `
import { add } from "./functions.mjs";

// A simple test:
const result = add(3, 4);
if (result !== 7) {
  console.error(\`Test failed: expected 7, got \${result}\`);
  process.exit(1); // Exit with error code
}
console.log("Add test passed");
process.exit(0); // Exit successfully
        `,
      },
      file2: {
        name: "functions.mjs",
        text: `
// TODO: Implement the add function
export function add(a, b) {
  // Your implementation here
}
        `,
      },
    },
  },
  {
    name: "multiply",
    prompt:
      "Implement the 'multiply' function in functions.mjs to correctly multiply two numbers and pass the unit test in index.mjs.",
    files: {
      file1: {
        name: "index.mjs",
        text: `
import { multiply } from "./functions.mjs";

const result = multiply(6, 7);
if (result !== 42) {
  console.error(\`Test failed: expected 42, got \${result}\`);
  process.exit(1);
}
console.log("Multiply test passed");
process.exit(0);
      `,
      },
      file2: {
        name: "functions.mjs",
        text: `
// TODO: Implement the multiply function
export function multiply(a, b) {
  // Your implementation here
}
      `,
      },
    },
  },
  {
    name: "square",
    prompt: "Implement the 'square' function in functions.mjs that returns x*x.",
    files: {
      file1: {
        name: "index.mjs",
        text: `
import { square } from "./functions.mjs";

const input = 5;
const result = square(input);
if (result !== 25) {
  console.error(\`Test failed: expected 25, got \${result}\`);
  process.exit(1);
}
console.log("Square test passed");
process.exit(0);
      `,
      },
      file2: {
        name: "functions.mjs",
        text: `
// TODO: Implement the square function
export function square(x) {
  // Your implementation here
}
      `,
      },
    },
  },
  {
    name: "toUpperCase",
    prompt:
      "Implement the toUpperCase function in functions.mjs that returns the given string in uppercase.",
    files: {
      file1: {
        name: "index.mjs",
        text: `
import { toUpperCase } from "./functions.mjs";

const input = "hello";
const result = toUpperCase(input);
if (result !== "HELLO") {
  console.error(\`Test failed: expected 'HELLO', got '\${result}'\`);
  process.exit(1);
}
console.log("toUpperCase test passed");
process.exit(0);
      `,
      },
      file2: {
        name: "functions.mjs",
        text: `
// TODO: Implement the toUpperCase function
export function toUpperCase(str) {
  // Your implementation here
}
      `,
      },
    },
  },
  {
    name: "reverseString",
    prompt:
      "Implement the reverseString function in functions.mjs that reverses the given string.",
    files: {
      file1: {
        name: "index.mjs",
        text: `
import { reverseString } from "./functions.mjs";

const input = "OpenAI";
const expected = "IAnepO"; // Corrected expected output

const result = reverseString(input);
if (result !== expected) {
  console.error(\`Test failed: expected '\${expected}', but got '\${result}'\`);
  process.exit(1);
}
console.log("reverseString test passed");
process.exit(0);
      `,
      },
      file2: {
        name: "functions.mjs",
        text: `
// TODO: Implement the reverseString function
export function reverseString(str) {
  // Your implementation here
}
      `,
      },
    },
  },
  {
    name: "stockPriceChart",
    type: "visualization",
    prompt:
      "Create a bar chart showing AAPL stock prices over time using D3.js. The chart should:\n" +
      "1. Be implemented in index.html using D3.js (v7+).\n" +
      "2. Load data from data.csv.\n" +
      "3. Render SVG bars inside the #chart div.\n" +
      "4. Include X (time) and Y (price) axes with labels.\n" +
      "5. Use a time scale for the X-axis and a linear scale for the Y-axis.\n" +
      "6. Add a title to the chart (e.g., 'AAPL Stock Price Over Time').\n" +
      "7. Display the price value as text on top of or near each bar.\n" +
      "8. Ensure the visualization is responsive or fits within an 800x600 viewport.\n" +
      "9. Add basic styling (e.g., bar color, axis appearance) either in a <style> tag or inline.",
    sampleData: stockData,
    files: {
      file1: {
        name: "index.html",
        text: `<!DOCTYPE html>
<html>
<head>
  <title>Stock Price Visualization</title>
  <script src="https://d3js.org/d3.v7.min.js"></script>
  <style>
    /* TODO: Add basic CSS styling for the chart, axes, labels, title */
    body { font-family: sans-serif; }
    .bar { fill: steelblue; }
    .bar-label { fill: black; text-anchor: middle; font-size: 10px; }
    .axis path, .axis line { fill: none; stroke: #000; shape-rendering: crispEdges; }
    .axis text { font-size: 11px; }
    .chart-title { font-size: 16px; font-weight: bold; text-anchor: middle; }
  </style>
</head>
<body>
  <div id="chart"></div>
  <script type="module"> // Use type="module" for potential imports if refactored
    // TODO: Implement the bar chart using D3.js
    // 1. Set up SVG dimensions and margins
    // 2. Load data from data.csv using d3.csv
    // 3. Parse data (dates and prices)
    // 4. Create scales (X: time, Y: linear)
    // 5. Create axes
    // 6. Create SVG container and append axes
    // 7. Create bars based on data
    // 8. Add labels on top of bars
    // 9. Add a title

    const margin = {top: 40, right: 30, bottom: 40, left: 60};
    const width = 800 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    const svg = d3.select("#chart")
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", \`translate(\${margin.left},\${margin.top})\`);

    // --- Your D3 code starts here ---

    // Example: Loading data (replace with full implementation)
    d3.csv("data.csv").then(data => {
      console.log("Data loaded:", data); // Log loaded data

      // Implement parsing, scales, axes, bars, labels, title here...

      // Placeholder: Add a title
      svg.append("text")
         .attr("class", "chart-title")
         .attr("x", width / 2)
         .attr("y", 0 - (margin.top / 2))
         .text("AAPL Stock Price Over Time (Implementation Pending)");

      // Make sure something is added to the #chart div for the test runner
      svg.append("rect")
         .attr("width", 50)
         .attr("height", 50)
         .attr("fill", "lightgray")
         .attr("x", 10)
         .attr("y", 10);
      console.log("Placeholder added to SVG.");


    }).catch(error => {
      console.error("Error loading or processing data:", error);
      // Display error message in the chart area
       svg.append("text")
         .attr("x", width / 2)
         .attr("y", height / 2)
         .attr("text-anchor", "middle")
         .text("Error loading data. Check console.");
    });

    // --- Your D3 code ends here ---

  </script>
</body>
</html>`,
      },
      file2: {
        name: "data.csv",
        text: stockData,
      },
    },
  },
];
