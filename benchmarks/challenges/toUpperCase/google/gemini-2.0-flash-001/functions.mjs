// TODO: Implement the toUpperCase function
export function toUpperCase(str) {
  if (typeof str !== 'string') {
    return ''; // Or throw an error, depending on desired behavior for non-string input
  }
  return str.toUpperCase();
}