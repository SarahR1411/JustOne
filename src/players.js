const prompt = require('prompt-sync')({ sigint: true });
const { isWordValid } = require('./validation');

/**
 * Creates an array of player objects, each with a unique ID and a default name
 *
 * @param {number} count - Number of players to initialize
 * @returns {{id: number, name: string}[]} - Array of player objects
 */
function initializePlayers(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Player ${i + 1}`
  }));
}

/**
 * Returns the current active player object from gameState
 *
 * @param {object} gameState - The global game state
 * @returns {object} - Active player object
 */
function getActivePlayer(gameState) {
  return gameState.players[gameState.activePlayerIndex];
}

/**
 * Moves the "active player" index to the next player wrapping around if needed
 *
 * @param {object} gameState - The global game state
 */
function rotateActivePlayer(gameState) {
  gameState.activePlayerIndex =
    (gameState.activePlayerIndex + 1) % gameState.players.length;
}

/**
 * Prompts each non-active player to enter a clue + clears console after each input
 * to hide the clues from other players
 *
 * @param {object} activePlayer - The current active player object
 * @param {object[]} allPlayers - Array of all players
 * @returns {object} - A map of { [playerId]: clueString }
 */
async function collectClues(activePlayer, allPlayers, mysteryWord) {
  const clues = {};

  for (const player of allPlayers) {
    if (player.id !== activePlayer.id) {
      let clue;
      let valid = false;

      do {
        clue = prompt(`${player.name}, enter your clue: `).trim().toLowerCase();

        if (clue.length === 0) {
          console.log("❌ Clue cannot be empty. Try again.");
          continue;
        }

        if (!(await isWordValid(clue))) {
          console.log(`📖 "${clue}" is not a recognized English word. Try again.`);
          continue;
        }

        valid = true; // Clue passed all checks

      } while (!valid);

      clues[player.id] = clue;
      console.clear(); // Clear screen for the next player's input
    }
  }

  return clues;
}

module.exports = {
  initializePlayers,
  getActivePlayer,
  rotateActivePlayer,
  collectClues
};
