// Clue validation

// Collect clue from each player in the form of: 
//CLUES = {p1: "clue1", p2: "clue2", p3: "clue3", p4: "clue4"}
// Validated = True
// mysteryWord = "mysteryWord"

// function EQUALS(CLUES)
    // EQUAL_CLUES = FALSE
    // For each player from 1 to 4:
        // If CLUES[i]==CLUES[j] (i!=j) 
            // EQUAL_CLUES = TRUE
            // problem = "Player [i], re-enter clue that isn't the same as others."
    // return EQUAL_CLUES, problem

// function MYSTERY_WORD(CLUES, mysteryWord)
    // MYSTERY_WORD_CLUE = FALSE
    // For each player from 1 to 4:
        // If CLUES[i]==mysteryWord
            // MYSTERY_WORD_CLUE = TRUE
            // problem = "Player [i], re-enter clue that isn't the same as the Mystery Word."
            // MYSTERY_WORD_CLUE = TRUE
    // return MYSTERY_WORD_CLUE, problem
    
// function FAMILY(CLUES, mysteryWord)
    // FAMILY_CLUE = FALSE
    // For each player from 1 to 4:
        // if (CLUES[i].startsWith(mysteryWord.substring(0, 3))) {
            // FAMILY_CLUE = TRUE
            // problem = "Player [i], re-enter clue that isn't of the same family as the Mystery Word."
        //}
        //if (CLUES[i].endsWith(mysteryWord.slice(-3))) {
            // FAMILY_CLUE = TRUE
            // problem = "Player [i], re-enter clue that isn't of the same family as the Mystery Word."
        //}
        //const natural = require('natural');
        //const stemmer = natural.PorterStemmer;
        //if (stemmer.stem(CLUES[i]) === stemmer.stem(mysteryWord)) {
            // FAMILY_CLUE = TRUE
            // problem = "Player [i], re-enter clue that isn't of the same family as the Mystery Word."
        //}
    // return FAMILY_CLUE, problem

// function EXISTS(CLUES)
    // EXISTS_CLUE = FALSE
    // For each player from 1 to 4:
        // async function isWordValid(word) {
            // const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
            // return response.ok; // Returns true if word exists, false otherwise
        //}
        // isWordValid(CLUES[i]).then(EXISTS_CLUE = true); // true if word exists, false otherwise
        // if (EXISTS_CLUE == false) {
            // problem = "Player [i], re-enter clue that is a word that exists."
        //}
    // return EXISTS_CLUE, problem

// function PHONETICALLY_SAME(CLUES, mysteryWord)
    // PHONETICALLY_SAME_CLUE = FALSE
    // For each player from 1 to 4:
        // const natural = require('natural');
        // function isPhoneticallySame(word1, word2) {
            // return natural.Metaphone.compare(word1, word2);
        //}
        // if (isPhoneticallySame(CLUES[i], mysteryWord)) {
            // PHONETICALLY_SAME_CLUE = TRUE
            // problem = "Player [i], re-enter clue that isn't phonetically the same as the Mystery Word."
        //}
    // return PHONETICALLY_SAME_CLUE, problem


// function validate(CLUES, mysteryWord)
    // EQUALS(CLUES)
    // MYSTERY_WORD(CLUES, mysteryWord)
    // FAMILY(CLUES, mysteryWord)
    // EXISTS(CLUES)
    // PHONETICALLY_SAME(CLUES, mysteryWord)
    // if (EQUALS == TRUE || MYSTERY_WORD == TRUE || FAMILY == TRUE || EXISTS == TRUE || PHONETICALLY_SAME == TRUE) {
        // return FALSE, problem
    //}
    // return TRUE
// voilaaaa

import natural from 'natural'; // Import the 'natural' module
import fetch from 'node-fetch';
import {collectClues, getMysteryWord} from './players.js';  // Import the collectClues and getMysteryWord functions from players.js;

async function isWordValid(word) {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    return response.ok;
}

function EQUALS(CLUES) {
    const uniqueClues = new Set(Object.values(CLUES));
    if (uniqueClues.size !== Object.keys(CLUES).length) {
        return { status: false, problem: `Each player must enter a unique clue.` };
    }
    return { status: true };
}

function MYSTERY_WORD(CLUES, mysteryWord) {
    for (let i = 1; i <= 4; i++) {
        if (CLUES[`p${i}`] === mysteryWord) {
            return { status: false, problem: `Player ${i}, re-enter clue that isn't the same as the Mystery Word.` };
        }
    }
    return { status: true };
}

function FAMILY(CLUES, mysteryWord) {
    const stemmer = natural.PorterStemmer; 
    for (let i = 1; i <= 4; i++) {
        let clue = CLUES[`p${i}`];
        if (
            (clue.length > 3 && mysteryWord.length > 3 && 
                (clue.startsWith(mysteryWord.substring(0, 3)) || 
                 clue.endsWith(mysteryWord.slice(-3)))) || 
               stemmer.stem(clue) === stemmer.stem(mysteryWord) 
        ) {
            return { status: false, problem: `Player ${i}, re-enter clue that isn't of the same family as the Mystery Word.` };
        }
    }
    return { status: true };
}


async function EXISTS(CLUES) {
    for (let i = 1; i <= 4; i++) {
        let exists = await isWordValid(CLUES[`p${i}`]);
        if (!exists) {
            return { status: false, problem: `Player ${i}, re-enter clue that is a word that exists.` };
        }
    }
    return { status: true };
}

// ✅ FIXED: Correctly use Metaphone processing
function PHONETICALLY_SAME(CLUES, mysteryWord) {
    for (let i = 1; i <= 4; i++) {
        const clueProcessed = natural.Metaphone.process(CLUES[`p${i}`]); 
        const mysteryWordProcessed = natural.Metaphone.process(mysteryWord);

        if (clueProcessed === mysteryWordProcessed) {
            return { status: false, problem: `Player ${i}, re-enter clue that isn't phonetically the same as the Mystery Word.` };
        }
    }
    return { status: true };
}

async function validate(CLUES, mysteryWord) {
    let checks = await Promise.all([
        EXISTS(CLUES), // ✅ Ensure async function is awaited here
        Promise.resolve(EQUALS(CLUES)), 
        Promise.resolve(MYSTERY_WORD(CLUES, mysteryWord)), 
        Promise.resolve(FAMILY(CLUES, mysteryWord)), 
        Promise.resolve(PHONETICALLY_SAME(CLUES, mysteryWord))
    ]);

    for (let check of checks) {
        if (!check.status) {
            return { valid: false, problem: check.problem };
        }
    }
    return { valid: true };
}

// Example usage
const CLUES = collectClues(); // Get clues from players
const mysteryWord = getMysteryWord(); // Get the mystery word

validate(CLUES, mysteryWord).then(result => console.log(result));
