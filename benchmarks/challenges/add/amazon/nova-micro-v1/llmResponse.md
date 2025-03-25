**functions.mjs**

```js
// Entire updated code for functions.mjs
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
  console.error("Test failed: expected 7, got", result);
  process.exit(1);
}
console.log("Add test passed");
process.exit(0);
```

No changes are needed to `index.mjs` since it already correctly imports and tests the `add` function. The only change is in `functions.mjs` where the `add` function is implemented.