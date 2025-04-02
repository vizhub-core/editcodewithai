**functions.mjs**

```js
// Implement the add function
export function add(a, b) {
  return a + b;
}
```

**index.mjs**

```js
import { add } from "./functions.mjs";

// A simple test:
const result = add(3, 4);
if (result !== 7) {
  console.error(`Test failed: expected 7, got ${result}`);
  process.exit(1); // Exit with error code
}
console.log("Add test passed");
process.exit(0); // Exit successfully
```