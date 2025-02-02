// cards.js
const fs = require('fs');
const { shuffle } = require('lodash');

/**
 * Loads all words from a text file (one per line), returning an array of unique words
 *
 * @param {string} filePath - Path to the .txt file
 * @returns {string[]} - Array of words
 */
function loadWordList(filePath) {
  const fileData = fs.readFileSync(filePath, 'utf8');

  // Split on line breaks, trim, lowercase, and filter out empty lines
  const rawWords = fileData.split(/\r?\n/).map(line => line.trim().toLowerCase());
  const filtered = rawWords.filter(Boolean); // remove any empty lines

  // remove duplicates by converting to a Set, then back to an array
  const uniqueWords = Array.from(new Set(filtered));

  return uniqueWords;
}

/**
 * Selects a set of N random words from the provided array
 * Doesn't remove them from the array nor require a Set
 * 
 * @param {string[]} words - Full array of words
 * @param {number} count - How many random words to pick (default 5)
 * @returns {string[]} - The chosen words
 */
function pickRandomWords(words, count = 5) {
  if (words.length < count) {
    throw new Error(`Not enough words to pick from! Need ${count}, got ${words.length}.`);
  }
  const shuffled = shuffle(words);
  return shuffled.slice(0, count);
}

module.exports = {
  loadWordList,
  pickRandomWords
};
