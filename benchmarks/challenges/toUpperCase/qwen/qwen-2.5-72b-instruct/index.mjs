import { toUpperCase } from "./functions.mjs";

const input = "hello";
const result = toUpperCase(input);
if (result !== "HELLO") {
  console.error("Test failed: expected 'HELLO', got", result);
  process.exit(1);
}
console.log("toUpperCase test passed");
process.exit(0);