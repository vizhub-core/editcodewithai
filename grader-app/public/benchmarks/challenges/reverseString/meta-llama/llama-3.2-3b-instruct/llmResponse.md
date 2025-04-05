**functions.mjs**

```javascript
/**
 * Reverses the given string.
 *
 * @param {string} str - The input string to be reversed.
 * @returns {string} The reversed string.
 */
export function reverseString(str) {
  // Use the Array.prototype.reverse() method to reverse the string
  // and then use the Array.prototype.join() method to concatenate the characters back into a string.
  return [...str].reverse().join('');
}
```

**index.mjs**

```javascript
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