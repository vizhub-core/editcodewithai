## Your Task

Implement the `toUpperCase` function in `functions.mjs` that returns the given string in uppercase.

## Original Files

**index.mjs**

```

import { toUpperCase } from "./functions.mjs";

const input = "hello";
const result = toUpperCase(input);
if (result !== "HELLO") {
  console.error(`Test failed: expected 'HELLO', got '${result}'`);
  process.exit(1);
}
console.log("toUpperCase test passed");
process.exit(0);
      
```

**functions.mjs**

```
// TODO: Implement the toUpperCase function
export function toUpperCase(str) {
  // Your implementation here
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

To refactor large files into smaller files in the same directory, we will create a new file `toUpperCase.js` in the same directory as `functions.mjs`.

**toUpperCase.js**

```javascript
// Entire updated code for fileA
```

**index.mjs**

```
import { toUpperCase } from "./toUpperCase.js";

const input = "hello";
const result = toUpperCase(input);
if (result !== "HELLO") {
  console.error(`Test failed: expected 'HELLO', got '${result}'`);
  process.exit(1);
}
console.log("toUpperCase test passed");
process.exit(0);
      
```

**functions.mjs**

```javascript
// Entire updated code for fileB
```

**toUpperCase.js**

```javascript
// Entire updated code for fileA
```

## Formatting Instructions

Refactor large files into smaller files in the same directory.

Delete all unused files, but we need to keep `README.md`. Files can be deleted by setting their content to empty, for example:

**fileToDelete.js**

```
```

For D3 logic, make sure it remains idempotent (use data joins), and prefer function signatures like `someFunction(selection, options)` where `selection` is a D3 selection and `options` is an object.