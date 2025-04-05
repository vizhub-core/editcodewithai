// Import the updated multiply function from functions.mjs
import { multiply } from "./functions.mjs";

// Test the multiply function
const result = multiply(6, 7);
if (result !== 42) {
  console.error(`Test failed: expected 42, got ${result}`);
  process.exit(1);
}
console.log("Multiply test passed");
process.exit(0);