**functions.mjs**

```javascript
/**
 * Returns the square of a given number.
 *
 * @param {number} x - The number to be squared.
 * @returns {number} The square of x.
 */
export function square(x) {
  return x * x;
}
```

**index.mjs**

```javascript
import { square } from "./functions.mjs";

const input = 5;
const result = square(input);
if (result !== 25) {
  console.error("Test failed: expected 25, got", result);
  process.exit(1);
}
console.log("Square test passed");
process.exit(0);
```