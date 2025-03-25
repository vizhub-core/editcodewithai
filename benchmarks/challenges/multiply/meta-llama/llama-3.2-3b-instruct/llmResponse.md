**functions.mjs**

```javascript
/**
 * Multiplies two numbers.
 *
 * @param {number} a The first number.
 * @param {number} b The second number.
 * @returns {number} The product of a and b.
 */
export function multiply(a, b) {
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