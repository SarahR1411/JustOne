// Player management
// import cards from './cards.js';
// import readlineSync from 'readline-sync'; // Import readline-sync as an ES module
// import { validate } from './validate.js'; // Assuming validate.js is in the same directory

// ACTIVE PLAYER
// STEP 1:
    // choose one card out of 13 form cards.js (user input from 1 to 13)
    // choose a number between 1 and 5 (user input)
// STEP 2:
    // Collect the four clues
    // Try to guess mystery word (user input)



// OTHER PLAYERS
// Players : p1, p2, p3, p4
// Display the Mystery Word (the one chosen by active player in the beginning, without him knowing)
// empty clue dicitonnary
// for players form 1 to 4:
    // Prompt for user input so that player can input clue
    // Erase the clue entered from previous player in terminal, so each player doesn't know what the other player wrote!!!
    // add the clue to the clue dictionary
//send mystery word and clue dictionnary to Validation.js, has a form of {p1: "clue1", p2: "clue2", p3: "clue3", p4: "clue4"} for dictionnary and const mysteryWord = "mystery"; for mystery word


// while validation == False (rules NOT followed): ==> Validation.js should display problem explicitly with player name that fucked up!!
    // prompted user input again for player that fucked up, for new clue



// ACTIVE PLAYER
// Display all the clues together to the active player
// STEP 3:
    // If the guess is correct, the player wins => return WIN
    // If the guess is incorrect, the player loses => return LOSE
    // If the player wishes to pass => return PASS

    

// END OF ROUND
// Switch Active Player: 
    // The player that is on their left, becomes the Active Player
//voilaaaaa
import cards from './cards.js';
import readlineSync from 'readline-sync';
import { validate } from './validate.js'; // Assuming validate.js is in the same directory
const activePlayer = 'p1'; // Start with player 1 as active player

// A function to collect clues from the other players
async function collectClues(activePlayer) {
    const clues = {}; // Empty clue dictionary
    const players = ['p1', 'p2', 'p3', 'p4'];

    // Display the mystery word to everyone except the active player
    console.log("Mystery Word has been chosen. The other players will now provide clues.\n");

    // Iterate through players
    for (let i = 0; i < players.length; i++) {
        const player = players[i];

        // Skip the active player from giving a clue
        if (player === activePlayer) {
            continue;
        }

        // Prompt for clue input
        let clue = readlineSync.question(`Player ${player}, enter your clue: `);
        
        // Erase the clue from the terminal (don't let others see)
        readlineSync.keyInPause('Clue received! Press any key to continue...\n');

        // Add the clue to the dictionary
        clues[player] = clue;
    }

    return clues;
}

// Function to get the mystery word based on the chosen card and number
function getMysteryWord(cardIndex, chosenNumber) {
    // Ensure the index is valid and the chosen number is between 1 and 5
    if (chosenNumber < 1 || chosenNumber > 5 || cardIndex < 0 || cardIndex >= cards.length) {
        console.log("Invalid card or number!");
        return null;
    }

    const card = cards[cardIndex];
    mysteryWord = card.words[chosenNumber - 1];
    return  // Adjust chosen number to 0-based index
}

// Example of how to use this function in the game loop
async function activePlayerTurn() {
    // STEP 1: Active player chooses a card and a number
    const cardIndex = readlineSync.keyInSelect(cards.map(card => `Card ${card.cardNumber}`), 'Choose a card from 1 to 5: ');
    const cardNumber = readlineSync.questionInt('Choose a number between 1 and 5: ');

    const mysteryWord = getMysteryWord(cardIndex, cardNumber);

    if (mysteryWord) {
        console.log(`Active Player chose card ${cards[cardIndex].cardNumber} with mystery word: ${mysteryWord}`);
    } else {
        console.log("Mystery word could not be retrieved.");
    }
}

// Function to handle the round's validation and guessing
async function round(mysteryWord) {
    let isValid = false;

    // Collect clues and validate them
    while (!isValid) {
        // Collect clues and get the guess
        const { guess, clues } = await activePlayerTurn();

        // Validate the clues
        const result = await validate(clues, mysteryWord);

        if (!result.valid) {
            console.log(result.problem); // Display what went wrong (from validate.js)
            continue; // Re-prompt the active player to provide new clues
        } else {
            isValid = true;
        }
    }

    // STEP 3: Display all clues to the active player
    console.log("\nClues provided by other players: ${collectClues(activePlayer)}");


    // Active player guesses the mystery word
    const guess = readlineSync.question('Guess the mystery word: ');

    if (guess === mysteryWord) {
        console.log("You WIN!");
        return 'WIN';
    } else if (guess === '') {
        console.log("You PASS!");
        return 'PASS';
    } else {
        console.log("You LOSE!");
        return 'LOSE';
    }
}

// Function to switch to the next player
function switchActivePlayer(currentPlayer) {
    const players = ['p1', 'p2', 'p3', 'p4'];
    let currentIndex = players.indexOf(currentPlayer);

    // Switch to the player on the left
    let nextIndex = (currentIndex + 1) % players.length;
    return players[nextIndex];
}


/*Game loop for multiple rounds
async function gameLoop(activePlayer) {
    while (true) {
        console.log(`\n--- Round for Active Player: ${activePlayer} ---`);
        const roundResult = await round(activePlayer);

        // Show round result
        if (roundResult === 'WIN' || roundResult === 'LOSE') {
            console.log(`Round result: ${roundResult}`);
        } else if (roundResult === 'PASS') {
            console.log('You passed this round.');
        }

        // Switch to the next active player
        activePlayer = switchActivePlayer(activePlayer);
    }
}

// Start the game
gameLoop();
*/