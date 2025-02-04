# JustOne Game

JustOne is a multiplayer word-guessing game implemented in JavaScript. The game follows a structured set of rules where players take turns guessing a mystery word based on unique clues provided by other players. The project is organized into multiple modules to handle game logic, data management, logging, and validation.

## Project Structure

```
JustOne/
│-- data/
│   │-- cards.json
│   │-- game_logs.json
│   │-- words.txt
│-- node_modules/
│-- src/
│   │-- cards.js
│   │-- game.js
│   │-- logger.js
│   │-- player.js
│   │-- validation.js
│-- package-lock.json
│-- package.json
```

### **Pre-requisite**

Before `npm start` make sure to type the bash command `npm install` to make sure all dependencies and modules are correctly installed. This part is essential if you want the game to run properly. 

### **Folders and Files**

#### **data/**
- `cards.json`: Stores pre-generated game cards.
- `game_logs.json`: Stores logs of completed game sessions.
- `words.txt`: Contains a master list of words used in the game.

#### **src/**
- `cards.js`:
  - Loads words from `words.txt`, ensuring uniqueness.
  - Assigns five random words to each card.

- `game.js`:
  - Defines the number of players and rounds.
  - Sets up the game by creating players, loading words, and preparing logs (`initializeGame`).
  - Implements the game loop, rotating players and verifying round completion (`gameLoop`).
  - Handles the round logic: picking words, giving and validating clues, scoring (`playRound`).
  - Tracks scoring (win, lose, or pass) using `applyJustOneScoring`.
  - Selects a mystery word for other players (`SelectMysteryWordToOtherPlayers`).
  - Evaluates guesses (`evaluateGuess`).
  - Ends the game and handles cleanup.

- `logger.js`:
  - Appends records of game events to a log file with timestamps.

- `player.js`:
  - Creates an array of players with unique IDs and default names (`initializePlayers`).
  - Prompts passive players for clues (`collectClues`).

- `validation.js`:
  - Ensures clue validation by checking:
    - Duplicate clues (`EQUALS`).
    - Clues matching the mystery word (`MYSTERY_WORD`).
    - Same start/end or similar stem (`FAMILY`).
    - Nonexistent words (`EXIST`).
    - Phonetically identical words (`PHONETICALLY_SAME`).
  - The main validation function verifies whether any of these conditions are met, invalidating the clue if true.

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/SarahR1411/JustOne.git
   ```
2. Navigate to the project folder:
   ```sh
   cd JustOne
   ```
3. Install dependencies:
   ```sh
   npm install
   ```

## Usage

Run the game with:
```sh
node src/game.js
```

## Future Improvements
- Implement a front-end interface for better user interaction.
- Add additional validation for edge cases in clue processing.
- Support different difficulty levels.


