// Implement the reverseString function that reverses the given string.
export function reverseString(str) {
  // Convert the string to an array of characters.
  const charArray = str.split('');
  
  // Reverse the array of characters.
  const reversedCharArray = charArray.reverse();
  
  // Join the array back into a string.
  const reversedString = reversedCharArray.join('');
  
  // Return the reversed string.
  return reversedString;
}