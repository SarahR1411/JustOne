const fetch = require('node-fetch');
const porterStemmer = require('talisman/stemmers/porter');
const metaphone = require('talisman/phonetics/metaphone');

/**
 * EQUALS: removes clues
 */
function EQUALS(CLUES) {
  const seen = new Set();
  const filteredClues = {};
  const removedClues = [];

  for (const [playerId, clue] of Object.entries(CLUES)) {
    if (!seen.has(clue)) {
      seen.add(clue);
      filteredClues[playerId] = clue;
    } else {
      removedClues.push(clue);
    }
  }

  return { filteredClues, removedClues };
}

/**
 * MYSTERY_WORD: removes clue that matches the secret word exactly
 */
function MYSTERY_WORD(CLUES, mysteryWord) {
  const filteredClues = {};
  const removedClues = [];

  for (const [playerId, clue] of Object.entries(CLUES)) {
    if (clue !== mysteryWord) {
      filteredClues[playerId] = clue;
    } else {
      removedClues.push(clue);
    }
  }

  return { filteredClues, removedClues };
}

/**
 * FAMILY: same start/end substring or same Porter stem
 */
function FAMILY(CLUES, mysteryWord) {
  const filteredClues = {};
  const removedClues = [];

  for (const [playerId, clue] of Object.entries(CLUES)) {
    const shortCheck =
      clue.length >= 3 &&
      mysteryWord.length >= 3 &&
      (clue.startsWith(mysteryWord.slice(0, 3)) ||
       clue.endsWith(mysteryWord.slice(-3)));

    const stemCheck = porterStemmer(clue) === porterStemmer(mysteryWord);

    if (shortCheck || stemCheck) {
      removedClues.push(clue); // Mark for removal
    } else {
      filteredClues[playerId] = clue;
    }
  }

  return { filteredClues, removedClues };
}

async function isWordValid(word) {
  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    return response.ok;
  } catch (err) {
    console.error('Error checking dictionary:', err);
    return false;
  }
}

/**
 * PHONETICALLY_SAME: compare Talisman Metaphone codes
 */
function PHONETICALLY_SAME(CLUES, mysteryWord) {
  const filteredClues = {};
  const removedClues = [];

  const mwMetaphone = metaphone(mysteryWord);

  for (const [playerId, clue] of Object.entries(CLUES)) {
    const clueMetaphone = metaphone(clue);
    if (clueMetaphone === mwMetaphone) {
      removedClues.push(clue); // Mark for removal
    } else {
      filteredClues[playerId] = clue;
    }
  }

  return { filteredClues, removedClues };
}

/**
 * MAIN VALIDATION
 */
async function validateClues(CLUES, mysteryWord) {
  let { filteredClues, removedClues } = EQUALS(CLUES);
  
  const mysteryWordCheck = MYSTERY_WORD(filteredClues, mysteryWord);
  filteredClues = mysteryWordCheck.filteredClues;
  removedClues = removedClues.concat(mysteryWordCheck.removedClues);

  const familyCheck = FAMILY(filteredClues, mysteryWord);
  filteredClues = familyCheck.filteredClues;
  removedClues = removedClues.concat(familyCheck.removedClues);

  const phoneticCheck = PHONETICALLY_SAME(filteredClues, mysteryWord);
  filteredClues = phoneticCheck.filteredClues;
  removedClues = removedClues.concat(phoneticCheck.removedClues);

  // If no valid clues remain, return failure
  if (Object.keys(filteredClues).length === 0) {
    return {
      validClues: null,
      invalidReason: "All clues were invalid. Round skipped!",
      removedClues
    };
  }

  return { validClues: Object.values(filteredClues), invalidReason: null, removedClues };
}

module.exports = { validateClues };


module.exports = {
  validateClues,
  isWordValid
};
