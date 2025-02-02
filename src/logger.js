const fs = require('fs');
const path = require('path');

/**
 * Path to the JSON file where game logs are stored
 */
const LOG_FILE = path.join(__dirname, '../data/game_logs.json');

/**
 * Ensures the game log folder/file exist and re-initializes logs as an empty array
 */
function initializeLogs() {
  try {
    // Ensure the directory exists
    if (!fs.existsSync(path.dirname(LOG_FILE))) {
      fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
    }

    // Overwrite/initialize with an empty JSON array
    fs.writeFileSync(LOG_FILE, '[]', { encoding: 'utf8' });
  } catch (err) {
    console.error('Error initializing logs:', err);
  }
}

/**
 * Reads the current log file and returns it as an array of objects
 */
function readLogs() {
  try {
    if (!fs.existsSync(LOG_FILE)) {
      // If file doesn't exist, we can return an empty array or create it
      return [];
    }
    const logsData = fs.readFileSync(LOG_FILE, 'utf8');
    return JSON.parse(logsData);
  } catch (err) {
    console.error('Error reading logs:', err);
    return [];
  }
}

/**
 * Appends a single round record to the log file with a timestamp
 * 
 * @param {Object} roundData - The round's information (player guess, result, ...)
 */
function logRound(roundData) {
  try {
    const logs = readLogs();
    logs.push({
      timestamp: new Date().toISOString(),
      ...roundData
    });

    fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2), { encoding: 'utf8' });
  } catch (err) {
    console.error('Error logging round:', err);
  }
}

/**
 * Generates a final console report from the stored logs
 * 
 * `roundData.result` can be 'WIN' or something else
 */
function generateFinalReport() {
  const logs = readLogs();

  if (logs.length === 0) {
    console.log('\n=== FINAL REPORT ===');
    console.log('No rounds played yet!');
    return;
  }

  const wins = logs.filter(round => round.result === 'WIN').length;

  console.log('\n=== FINAL REPORT ===');
  console.log(`Total Rounds Played: ${logs.length}`);
  console.log(`Correct Guesses (WIN): ${wins}`);
  console.log(`Success Rate: ${((wins / logs.length) * 100).toFixed(1)}%`);
}

module.exports = {
  initializeLogs,
  readLogs,         
  logRound,
  generateFinalReport
};
