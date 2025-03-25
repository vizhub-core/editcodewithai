## Your Task

Implement the `toUpperCase` function that returns the given string in uppercase.

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

**functions.mjs**

```javascript
// TODO: Implement the toUpperCase function
export function toUpperCase(str) {
  return str.toUpperCase();
}
```

## Formatting Instructions

Suggest changes to the original files using this exact format:

**fileA.js**

```javascript
// Entire updated code for fileA
```

**fileB.js**

```javascript
// Entire updated code for fileB
```

## Refactoring

To refactor large files into smaller files in the same directory, we can create a new file `uppercase.js` with the following content:

```javascript
// fileA.js
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

```javascript
// fileB.js
import { toUpperCase } from "./uppercase.js";

const input = "hello";
const result = toUpperCase(input);
if (result !== "HELLO") {
  console.error("Test failed: expected 'HELLO', got", result);
  process.exit(1);
}
console.log("toUpperCase test passed");
process.exit(0);
```

**uppercase.js**

```javascript
// Entire updated code for uppercase.js
```

## Deleting Unused Files

**fileToDelete.js**

```javascript
// Entire updated code for fileToDelete.js
```

## D3 Logic

For D3 logic, make sure it remains idempotent (use data joins), and prefer function signatures like `someFunction(selection, options)` where `selection` is a D3 selection and `options` is an object.