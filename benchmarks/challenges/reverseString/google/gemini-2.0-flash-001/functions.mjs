// TODO: Implement the reverseString function
export function reverseString(str) {
  if (!str) {
    return "";
  }
  return str.split("").reverse().join("");
}