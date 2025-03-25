**functions.mjs**
```javascript
// Implement the multiply function
export function multiply(a, b) {
  // Take two numbers and return their product
  return a * b;
}
```
**index.mjs**
```javascript
import { multiply } from "./functions.mjs";

const result = multiply(6, 7);
if (result !== 42) {
  console.error("Test failed: expected 42, got", result);
  process.exit(1);
}
console.log("Multiply test passed");
process.exit(0);
```