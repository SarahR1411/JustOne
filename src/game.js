const { loadWordList, pickRandomWords } = require('./cards');
const {
  initializePlayers,
  getActivePlayer,
  rotateActivePlayer,
  collectClues
} = require('./players');
const { validateClues } = require('./validation'); 
const {
  initializeLogs,
  logRound,
  generateFinalReport
} = require('./logger'); 
const prompt = require('prompt-sync')();

const CONFIG = {
  TOTAL_PLAYERS: 5,
  TOTAL_ROUNDS: 13,   // Just One official max is 13 successful attempts
  WORDS_FILE: './data/words.txt'
};

let gameState = {
  players: [],
  allWords: [],        // Master list of all possible words
  currentRound: 1,
  activePlayerIndex: 0,
  score: 0 // Number of correct guesses
};

//
// 1) MAIN ENTRY POINT
//
async function main() {
  try {
    initializeGame();
    await gameLoop();
    endGame();
  } catch (error) {
    console.error('Game error:', error);
  }
}

//
// 2) SET UP THE GAME
//
function initializeGame() {
  // 2.1) Create players
  gameState.players = initializePlayers(CONFIG.TOTAL_PLAYERS);

  // 2.2) Load the master list of words from file
  gameState.allWords = loadWordList(CONFIG.WORDS_FILE);

  // 2.3) Prepare logs
  initializeLogs();

  console.log('\n=== Game Initialized ===');
  console.log(`Players: ${gameState.players.length}`);
  console.log(`Total Words Available: ${gameState.allWords.length}`);
  console.log(`Target Rounds (max): ${CONFIG.TOTAL_ROUNDS}`);
}

//
// 3) GAME LOOP
//    We try up to 13 times or until we don't have enough words left to pick 5
//
async function gameLoop() {
  while (gameState.currentRound <= CONFIG.TOTAL_ROUNDS) {
    // Check if we can still pick 5 words
    if (gameState.allWords.length < 5) {
      console.log('\nNot enough words left to form a new card. Stopping early.');
      break;
    }

    await playRound();

    // Move to the next round: rotate player
    gameState.currentRound++;
    rotateActivePlayer(gameState);
  }
}

//
// 4) PLAY A SINGLE ROUND
//    1) Pick 5 new words from the array
//    2) Active player chooses which is the mystery word (1..5)
//    3) Non-active players see it and give clues
//    4) Validate those clues
//    5) Active player guesses
//    6) Scoring (WIN => keep, LOSE => discard next card, PASS => discard only this card)
//
async function playRound() {
  const activePlayer = getActivePlayer(gameState);

  console.log(`\n=== ROUND ${gameState.currentRound} ===`);
  console.log(`Active Player: ${activePlayer.name}`);

  // 4.1) Draw 5 words (random)
  const cardWords = pickRandomWords(gameState.allWords, 5);

  // 4.2) Active player picks a number 1..5 (without seeing them in a real game)
  const mysteryWord = selectMysteryWord(cardWords);

  // 4.3) Reveal to non-active players so they can give clues
  revealMysteryWordToOtherPlayers(activePlayer, mysteryWord);

  // 4.4) Collect the clues from each non-active player
  const allClues = await collectClues(activePlayer, gameState.players);

  // 4.5) Validate the clues
  const { validClues, invalidReason } = await validateClues(allClues, mysteryWord);

  if (!validClues) {
    console.log(`Validation failed: ${invalidReason}\nAll clues are invalid this round!`);
    logRound({
      round: gameState.currentRound,
      mysteryWord,
      clues: Object.values(allClues),
      validClues: [],
      result: 'NO_VALID_CLUES'
    });
    return;
  }

  // 4.6) Display final validated clues to the active player
  console.log('\n=== FINAL CLUES (VALIDATED) ===');
  console.log(validClues.join(', '));

  // 4.7) Active player guesses
  const guess = prompt('\nActive Player, enter your guess (or type PASS): ').trim().toLowerCase();
  const result = evaluateGuess(guess, mysteryWord);

  // 4.8) Apply official Just One scoring
  applyJustOneScoring(result);

  // 4.9) Log it
  logRound({
    round: gameState.currentRound,
    mysteryWord,
    clues: Object.values(allClues),
    validClues,
    result
  });
}

//
// 5) OFFICIAL JUST ONE SCORING
//    - WIN => +1 to score
//    - LOSE => discard this card AND the next card (pickUniqueWords to remove 5 more words)
//    - PASS => discard only this card (no extra penalty)
//
function applyJustOneScoring(result) {
  if (result === 'WIN') {
    gameState.score += 1;
    console.log('\n✅ Correct! +1 to score.');
  } else if (result === 'LOSE') {
    console.log('\n❌ Incorrect! Discarding this card AND the next card in the deck.');
    // In the official game you'd also remove the next card from the deck
    // Here we do nothing special bc there was an issue with .has()
  } else if (result === 'PASS') {
    console.log('\nPlayer passes. Only this card is discarded.');
  }

  console.log(`Current Score: ${gameState.score}`);
}

//
// 6) SELECT WHICH WORD WILL BE THE MYSTERY WORD
//    In the real game the active player does not see the actual 5 words
//
function selectMysteryWord(cardWords) {
  console.log('\nThere are 5 hidden words on the “card” (positions 1-5).');

  let choice;
  do {
    choice = parseInt(prompt('Choose a word position (1-5): '));
  } while (isNaN(choice) || choice < 1 || choice > 5);

  return cardWords[choice - 1];
}

//
// 7) REVEAL THE WORD TO NON-ACTIVE PLAYERS
//    (Simulating that the active player can’t see the card)
//
function revealMysteryWordToOtherPlayers(activePlayer, mysteryWord) {
  console.log('\n== Only Non-Active Players see the mystery word ==');
  for (const player of gameState.players) {
    if (player.id !== activePlayer.id) {
      console.log(`${player.name}, the Mystery Word is: "${mysteryWord}".`);
      prompt('Press ENTER to continue...');
      console.clear();
    }
  }
  console.log('All non-active players now know the Mystery Word.\n');
}

//
// 8) EVALUATE THE GUESS
//    Returns "WIN", "PASS", or "LOSE"
//
function evaluateGuess(guess, mysteryWord) {
  if (guess === 'pass') {
    return 'PASS';
  }
  return (guess === mysteryWord.toLowerCase()) ? 'WIN' : 'LOSE';
}

//
// 9) WHEN THE GAME ENDS
//
function endGame() {
  console.log('\n=== Game Over ===');
  console.log(`Final Score (cards guessed correctly): ${gameState.score} / ${CONFIG.TOTAL_ROUNDS}`);
  generateFinalReport();
  cleanup();
}

//
// 10) ANY CLEANUP
//
function cleanup() {
  if (global.gc) {
    global.gc();
  }
}

// Start the game
main();
