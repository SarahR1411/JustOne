// Player management

// ACTIVE PLAYER
// STEP 1:
    // choose one card out of 13
    // choose a number between 1 and 5 (user input)
// STEP 2:
    // Collect the four clues
    // Try to guess mystery word (user input)



// OTHER PLAYERS
// Players : p1, p2, p3, p4
// Display the Mystery Word (the one chosen by active player in the beginning, without him knowing)
// for players form 1 to 4:
    // Prompt for user input so that player can input clue
    // Erase the clue entered from previous player in terminal, so each player doesn't know what the other player wrote!!!

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



{
const readline = require("readline-sync");
const { validate } = require("./validate"); // Assuming validate.js contains the validation functions

let players = ["p1", "p2", "p3", "p4"];
let activeIndex = 0; // Tracks active player index

function switchActivePlayer() {
    activeIndex = (activeIndex + 1) % players.length;
}

function getPlayerInput(promptText) {
    return readline.question(promptText);
}

async function playRound() {
    let activePlayer = players[activeIndex];
    console.log(`\n${activePlayer} is the Active Player!`);

    // STEP 1: Active player chooses a card and a number
    console.log("Choose one card out of 13 (just for context, not implemented here)");
    let chosenNumber = getPlayerInput("Choose a number between 1 and 5: ");

    // STEP 2: Other players input clues
    let mysteryWord = getPlayerInput("Active player, enter the Mystery Word (hidden from you): ");
    console.clear();

    let clues = {};
    for (let i = 0; i < players.length; i++) {
        if (i !== activeIndex) {
            console.log(`\n${players[i]}, enter your clue:`);
            clues[players[i]] = getPlayerInput("");
            console.clear(); // Clears the previous clue so next player can't see it
        }
    }

    // Validate clues
    let validationResult = await validate(clues, mysteryWord);
    while (!validationResult.valid) {
        console.log(validationResult.problem);
        let problemPlayer = validationResult.problem.match(/Player (\d+)/)[1];
        clues[`p${problemPlayer}`] = getPlayerInput(`Player ${problemPlayer}, enter a new clue: `);
        validationResult = await validate(clues, mysteryWord);
    }

    // Display all valid clues to the active player
    console.log("\nAll Clues:", Object.values(clues).join(", "));

    // STEP 3: Active player guesses
    let guess = getPlayerInput("Active player, guess the Mystery Word (or type PASS): ");
    if (guess.toLowerCase() === mysteryWord.toLowerCase()) {
        console.log("\nYou guessed correctly! You WIN!");
        return "WIN";
    } else if (guess.toLowerCase() === "pass") {
        console.log("\nYou chose to pass.");
        return "PASS";
    } else {
        console.log("\nIncorrect guess! You LOSE!");
        return "LOSE";
    }
}

// Game loop (Example: 5 rounds)
for (let round = 1; round <= 5; round++) {
    console.log(`\n--- ROUND ${round} ---`);
    let result = await playRound();
    if (result !== "PASS") break; // Ends if a player wins or loses
    switchActivePlayer();
}

console.log("\nGame Over!");
}

