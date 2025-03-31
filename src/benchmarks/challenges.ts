import { VizFiles } from "@vizhub/viz-types";
import { Challenge } from "./types";

// Challenges definition. Each has multiple files (some with TODO).
// "index.mjs" includes the test code that calls process.exit(1) if it fails.
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
      "Implement the 'add' function to correctly add two numbers (a+b) and pass the test in index.mjs.",
    files: {
      file1: {
        name: "index.mjs",
        text: `
import { add } from "./functions.mjs";

// A simple test:
const result = add(3, 4);
if (result !== 7) {
  console.error("Test failed: expected 7, got", result);
  process.exit(1);
}
console.log("Add test passed");
process.exit(0);
        `,
      },
      file2: {
        name: "functions.mjs",
        text: `
// TODO: Implement the add function
export function add(a, b) {
  // TODO
}
        `,
      },
    },
  },
  {
    name: "multiply",
    prompt:
      "Implement the 'multiply' function to correctly multiply two numbers and pass the unit test in index.mjs.",
    files: {
      file1: {
        name: "index.mjs",
        text: `
import { multiply } from "./functions.mjs";

const result = multiply(6, 7);
if (result !== 42) {
  console.error("Test failed: expected 42, got", result);
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
  // TODO
}
      `,
      },
    },
  },
  {
    name: "square",
    prompt: "Implement the 'square' function that returns x*x.",
    files: {
      file1: {
        name: "index.mjs",
        text: `
import { square } from "./functions.mjs";

const input = 5;
const result = square(input);
if (result !== 25) {
  console.error("Test failed: expected 25, got", result);
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
  // TODO
}
      `,
      },
    },
  },
  {
    name: "toUpperCase",
    prompt:
      "Implement the toUpperCase function that returns the given string in uppercase.",
    files: {
      file1: {
        name: "index.mjs",
        text: `
import { toUpperCase } from "./functions.mjs";

const input = "hello";
const result = toUpperCase(input);
if (result !== "HELLO") {
  console.error("Test failed: expected 'HELLO', got", result);
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
  // TODO
}
      `,
      },
    },
  },
  {
    name: "reverseString",
    prompt:
      "Implement the reverseString function that reverses the given string.",
    files: {
      file1: {
        name: "index.mjs",
        text: `
import { reverseString } from "./functions.mjs";

const input = "OpenAI";
const expected = "IAnepO";

const result = reverseString(input);
if (result !== expected) {
  console.error("Test failed: expected", expected, "but got", result);
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
  // TODO
}
      `,
      },
    },
  },
  {
    name: "stockPriceChart",
    type: "visualization",
    prompt:
      "Create a bar chart showing AAPL stock prices over time. The chart should:\n" +
      "1. Use D3.js for visualization\n" +
      "2. Have proper axes with labels\n" +
      "3. Use a pleasing color scheme\n" +
      "4. Include a title\n" +
      "5. Show price values on top of each bar\n" +
      "Parse the CSV data from the 'data.csv' file and create an HTML file that renders the visualization.",
    sampleData: stockData,
    files: {
      file1: {
        name: "index.html",
        text: `<!DOCTYPE html>
<html>
<head>
  <title>Stock Price Visualization</title>
  <script src="https://d3js.org/d3.v7.min.js"></script>
  <!-- TODO: Add your styles and chart implementation -->
</head>
<body>
  <div id="chart"></div>
  <script>
    // TODO: Implement the bar chart using D3.js
    // The data will be loaded from data.csv
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
