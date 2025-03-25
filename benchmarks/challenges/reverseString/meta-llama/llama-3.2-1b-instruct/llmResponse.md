## Your Task

Implement the reverseString function that reverses the given string.

## Original Files

**index.mjs**

```

import { reverseString } from "./functions.mjs";

const input = "OpenAI";
const expected = "IAnepO";

const result = reverseString(input);
if (result !== expected) {
  console.error("Test failed: expected", expected, "but got", result);
  process.exit(1);
}
console.log("reverseString test passed");
process.exit(0);
      
```

**functions.mjs**

```
// TODO: Implement the reverseString function
export function reverseString(str) {
  // TODO
  return str.split("").reverse().join("");
}
```

## Formatting Instructions

Suggest changes to the original files using this exact format:

**index.mjs**

```
// Entire updated code for index.mjs
```

**functions.mjs**

```
// Entire updated code for functions.mjs
```

## Refactoring

The `reverseString` function in `functions.mjs` is now implemented as a simple string reversal using `split("")`, `reverse()`, and `join("")`. This implementation is efficient and easy to understand.

## Formatting Instructions

Refactor the `index.mjs` file to include the entire updated code for `reverseString` function.

**index.mjs**

```
// Entire updated code for index.mjs
import { reverseString } from "./functions.mjs";

const input = "OpenAI";
const expected = "IAnepO";

const result = reverseString(input);
if (result !== expected) {
  console.error("Test failed: expected", expected, "but got", result);
  process.exit(1);
}
console.log("reverseString test passed");
process.exit(0);
```