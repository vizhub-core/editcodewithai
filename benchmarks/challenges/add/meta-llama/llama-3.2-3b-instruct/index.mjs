// Entire updated code for index.mjs
import { add } from "./functions.mjs";

// A simple test:
const result = add(3, 4);
if (result !== 7) {
  console.error("Test failed: expected 7, got", result);
  process.exit(1);
}
console.log("Add test passed");
process.exit(0);