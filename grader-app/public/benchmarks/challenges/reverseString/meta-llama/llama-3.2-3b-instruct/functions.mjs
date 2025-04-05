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