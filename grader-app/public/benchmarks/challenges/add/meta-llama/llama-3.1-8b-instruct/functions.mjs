export function add(a, b) {
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new TypeError('Both inputs must be numbers');
  }
  return a + b; // Correctly add two numbers using the + operator
}