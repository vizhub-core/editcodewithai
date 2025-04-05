**functions.mjs**

```js
export function square(x) {
  return x * x;
}
```

This implementation simply takes the input `x` and multiplies it by itself to return the square of the number. It matches the requirements of the test case in `index.mjs`, which checks that `square(5)` returns `25`.

The function is:
- Exported so it can be imported in `index.mjs`
- Takes a single parameter `x`
- Returns `x * x`, which squares the input number
- Concise and directly solves the problem