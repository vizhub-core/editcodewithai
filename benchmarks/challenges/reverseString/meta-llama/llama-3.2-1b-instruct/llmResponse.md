## Your Task

Implement the reverseString function in functions.mjs that reverses the given string.

## Original Files

**index.mjs**

```

import { reverseString } from "./functions.mjs";

const input = "OpenAI";
const expected = "IAnepO"; // Corrected expected output

const result = reverseString(input);
if (result !== expected) {
  console.error(`Test failed: expected '${expected}', but got '${result}'`);
  process.exit(1);
}
console.log("reverseString test passed");
process.exit(0);
      
```

**functions.mjs**

```
// TODO: Implement the reverseString function
export function reverseString(str) {
  // Your implementation here
}

// TODO: Implement the reverseString function
export function reverseString(str) {
  // Your implementation here
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

Create a new file `reverseString.js` in the same directory as `index.mjs` and `functions.mjs`:

**reverseString.js**

```javascript
// Entire updated code for reverseString.js
export function reverseString(str) {
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

Delete the `reverseString` function from `index.mjs` and `functions.mjs` as it is not being used:

**index.mjs**

```
// Entire updated code for index.mjs
```

**functions.mjs**

```
// Entire updated code for functions.mjs
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

Create a new file `reverseString.test.js` in the same directory as `index.mjs` and `functions.mjs`:

**reverseString.test.js**

```javascript
// Entire updated code for reverseString.test.js
import { reverseString } from "./functions.mjs";

const input = "OpenAI";
const expected = "IAnepO"; // Corrected expected output

const result = reverseString(input);
if (result !== expected) {
  console.error(`Test failed: expected '${expected}', but got '${result}'`);
  process.exit(1);
}
console.log("reverseString test passed");
process.exit(0);
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

**reverseString.test.js**

```
// Entire updated code for reverseString.test.js
```

## Refactoring

Delete the `reverseString` function from `index.mjs` and `reverseString.test.js` as it is not being used:

**index.mjs**

```
// Entire updated code for index.mjs
```

**reverseString.test.js**

```
// Entire updated code for reverseString.test.js
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

**reverseString.test.js**

```
// Entire updated code for reverseString.test.js
```