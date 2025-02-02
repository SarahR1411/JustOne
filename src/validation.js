const fetch = require('node-fetch');
const porterStemmer = require('talisman/stemmers/porter');
const metaphone = require('talisman/phonetics/metaphone');

/**
 * EQUALS: no duplicate clues
 */
function EQUALS(CLUES) {
  const cluesArr = Object.values(CLUES);
  const unique = new Set(cluesArr);
  if (unique.size !== cluesArr.length) {
    return { status: false, problem: 'Duplicate clues detected!' };
  }
  return { status: true };
}

/**
 * MYSTERY_WORD: clue must not match the secret word exactly
 */
function MYSTERY_WORD(CLUES, mysteryWord) {
  for (const [playerId, clue] of Object.entries(CLUES)) {
    if (clue === mysteryWord) {
      return {
        status: false,
        problem: `Player ${playerId} gave the Mystery Word itself. Not allowed!`
      };
    }
  }
  return { status: true };
}

/**
 * FAMILY: same start/end substring or same Porter stem
 */
function FAMILY(CLUES, mysteryWord) {
  for (const [playerId, clue] of Object.entries(CLUES)) {
    const shortCheck =
      clue.length >= 3 &&
      mysteryWord.length >= 3 &&
      (clue.startsWith(mysteryWord.slice(0, 3)) ||
       clue.endsWith(mysteryWord.slice(-3)));

    const stemCheck = porterStemmer(clue) === porterStemmer(mysteryWord);

    if (shortCheck || stemCheck) {
      return {
        status: false,
        problem: `Player ${playerId}, your clue is in the same family as the Mystery Word!`
      };
    }
  }
  return { status: true };
}

/**
 * EXISTS: dictionary API check
 */
async function EXISTS(CLUES) {
  for (const [playerId, clue] of Object.entries(CLUES)) {
    const valid = await isWordValid(clue);
    if (!valid) {
      return {
        status: false,
        problem: `Player ${playerId}, "${clue}" doesn't appear to be a valid English word.`
      };
    }
  }
  return { status: true };
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
  const mwMetaphone = metaphone(mysteryWord);
  for (const [playerId, clue] of Object.entries(CLUES)) {
    const clueMetaphone = metaphone(clue);
    if (clueMetaphone === mwMetaphone) {
      return {
        status: false,
        problem: `Player ${playerId}, your clue is phonetically the same as the Mystery Word!`
      };
    }
  }
  return { status: true };
}

/**
 * MAIN VALIDATION
 */
async function validateClues(CLUES, mysteryWord) {
  // Synchronous checks
  const syncChecks = [
    EQUALS(CLUES),
    MYSTERY_WORD(CLUES, mysteryWord),
    FAMILY(CLUES, mysteryWord),
    PHONETICALLY_SAME(CLUES, mysteryWord)
  ];
  for (const check of syncChecks) {
    if (!check.status) {
      return { validClues: null, invalidReason: check.problem };
    }
  }

  // Async check: EXISTS
  const existsCheck = await EXISTS(CLUES);
  if (!existsCheck.status) {
    return { validClues: null, invalidReason: existsCheck.problem };
  }

  // All good
  return { validClues: Object.values(CLUES), invalidReason: null };
}

module.exports = {
  validateClues
};
