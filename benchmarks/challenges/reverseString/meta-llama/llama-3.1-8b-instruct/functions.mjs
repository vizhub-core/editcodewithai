/**
 * Reverses the given string.
 * 
 * @param {string} str The input string.
 * @returns {string} The reversed string.
 */
export function reverseString(str) {
  // Initialize an empty string to store the reversed string.
  let reversed = "";

  // Loop through the input string from the end to the start.
  for (let i = str.length - 1; i >= 0; i--) {
    // Append the current character to the reversed string.
    reversed += str[i];
  }

  // Return the reversed string.
  return reversed;
}