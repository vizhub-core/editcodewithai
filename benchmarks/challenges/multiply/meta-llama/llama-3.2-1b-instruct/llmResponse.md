## Your Task

Implement the 'multiply' function to correctly multiply two numbers and pass the unit test in index.mjs.

## Original Files

**index.mjs**

```

import { multiply } from "./functions.mjs";

const result = multiply(6, 7);
if (result !== 42) {
  console.error("Test failed: expected 42, got", result);
  process.exit(1);
}
console.log("Multiply test passed");
process.exit(0);
      
```

**functions.mjs**

```

// TODO: Implement the multiply function
export function multiply(a, b) {
  // TODO
}

// TODO: Add unit test for multiply function
export function multiplyTest() {
  const result = multiply(6, 7);
  if (result !== 42) {
    console.error("Test failed: expected 42, got", result);
    process.exit(1);
  }
  console.log("Multiply test passed");
  process.exit(0);
}

// TODO: Add more unit tests for multiply function
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

Create a new file `index.test.js` in the same directory:

```
// Entire updated code for index.test.js
```

## Unit Test

Add a new test case to `index.test.js`:

```
// Entire updated code for index.test.js
import { multiply } from "./functions.mjs";
import { multiplyTest } from "./functions.mjs";

describe("multiply function", () => {
  it("should multiply two numbers", () => {
    const result = multiply(6, 7);
    expect(result).toBe(42);
  });

  it("should pass unit test", () => {
    multiplyTest();
  });
});
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

**index.test.js**

```
// Entire updated code for index.test.js
```

**index.test.js**

```
// Entire updated code for index.test.js
import { multiply } from "./functions.mjs";
import { multiplyTest } from "./functions.mjs";

describe("multiply function", () => {
  it("should multiply two numbers", () => {
    const result = multiply(6, 7);
    expect(result).toBe(42);
  });

  it("should pass unit test", () => {
    multiplyTest();
  });
});
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

**index.test.js**

```
// Entire updated code for index.test.js
```

**index.test.js**

```
// Entire updated code for index.test.js
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

**index.test.js**

```
// Entire updated code for index.test.js
```

**index.test.js**

```
// Entire updated code for index.test.js
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

**index.test.js**

```
// Entire updated code for index.test.js
```

**index.test.js**

```
// Entire updated code for index.test.js
```