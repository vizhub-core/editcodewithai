**functions.mjs**

```js
// Entire updated code for functions.mjs
export function reverseString(str) {
  return str.split('').reverse().join('');
}
```

**index.mjs**

```js
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

**README.md**

```md
# Project

This project contains a simple function to reverse a string.

## Files

- `functions.mjs`: Contains the `reverseString` function.
- `index.mjs`: Contains the test for the `reverseString` function.

## Usage

To run the test, simply execute the `index.mjs` file.

```sh
node index.mjs
```

If the test passes, it will print "reverseString test passed". If it fails, it will print an error message.
```