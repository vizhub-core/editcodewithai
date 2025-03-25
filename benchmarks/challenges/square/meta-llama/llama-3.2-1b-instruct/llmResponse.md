I can help you update the files as per the instructions. Here are the updated files:

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

**functions.mjs**

```javascript
// Entire updated code for fileA
export function square(x) {
  return x * x;
}
```

**index.js**

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

**functions.js**

```javascript
// Entire updated code for fileA
export function square(x) {
  return x * x;
}
```

**index.md**

```markdown
# Square Function

This function takes an input and returns its square.

## Test

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

## Usage

```javascript
import { square } from "./functions.mjs";
console.log(square(5)); // Output: 25
```

**README.md**

```markdown
# Square Function

A simple JavaScript function that returns the square of a given input.

## Usage

```javascript
import { square } from "./functions.mjs";
console.log(square(5)); // Output: 25
```

## Test

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