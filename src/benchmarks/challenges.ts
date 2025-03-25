import { VizFiles } from "@vizhub/viz-types";
import { Challenge } from "./types";

// Challenges definition. Each has multiple files (some with TODO).
// "index.mjs" includes the test code that calls process.exit(1) if it fails.
export const challenges: Challenge[] = [
  {
    name: "add",
    prompt: "Implement the 'add' function to correctly add two numbers (a+b) and pass the test in index.mjs.",
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
    prompt: "Implement the 'multiply' function to correctly multiply two numbers and pass the unit test in index.mjs.",
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
    prompt: "Implement the toUpperCase function that returns the given string in uppercase.",
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
    prompt: "Implement the reverseString function that reverses the given string.",
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
];
