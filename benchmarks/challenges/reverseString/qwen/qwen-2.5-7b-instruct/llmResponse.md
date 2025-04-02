**functions.mjs**

```js
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
  console.error(`Test failed: expected '${expected}', but got '${result}'`);
  process.exit(1);
}
console.log("reverseString test passed");
process.exit(0);
```