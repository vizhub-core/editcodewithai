import { reverseString } from "./functions.mjs";

const input = "OpenAI";
const expected = "AIenpO";

const result = reverseString(input);
if (result !== expected) {
  console.error("Test failed: expected", expected, "but got", result);
  process.exit(1);
}
console.log("reverseString test passed");
process.exit(0);