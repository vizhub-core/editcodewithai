**functions.mjs**

```javascript
/**
 * Returns the given string in uppercase.
 *
 * @param {string} str - The input string to convert to uppercase.
 * @returns {string} The input string in uppercase.
 */
export function toUpperCase(str) {
  return str.toUpperCase();
}
```

**index.mjs**

```javascript
import { toUpperCase } from "./functions.mjs";

const input = "hello";
const result = toUpperCase(input);
if (result !== "HELLO") {
  console.error("Test failed: expected 'HELLO', got", result);
  process.exit(1);
}
console.log("toUpperCase test passed");
process.exit(0);
```