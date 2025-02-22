/**
 * Utility for generating unique codes
 * Uses a combination of uppercase letters and numbers for better readability
 */

const { customAlphabet } = require('nanoid');

/**
 * Generates a unique code using a custom alphabet
 * @param length Length of the code to generate
 * @returns Generated code
 */
export const generateUniqueCode = (length: number): string => {
  // Use only uppercase letters and numbers for better readability
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const nanoid = customAlphabet(alphabet, length);
  return nanoid();
};
