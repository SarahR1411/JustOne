// Clue validation

// Collect clue from each player in the form of: {p1: "clue1", p2: "clue2", p3: "clue3", p4: "clue4"}

// Validated = True
// For each player from 1 to 4:
    // If clue[i]==clue[j] (i!=j) 
        // Validated = False
        // problem = "Player [i], re-enter clue that isn't the same as others."

    // If clue[i]==Mystery Word
        // Validated = False
        // problem = "Player [i], re-enter clue that isn't the same as the Mystery Word."

    // If clue[i] is of same family as Mystery Word 
        // Validated = False
        // problem = "Player [i], re-enter clue that isn't of the same family as the Mystery Word."

    // If clue[i] is a word that does not exist
        // Validated = False
        // problem = "Player [i], re-enter clue that is a word that exists."

    // If clue[i] is phonetically the same as Mystery Word
        // Validated = False
        // problem = "Player [i], re-enter clue that isn't phonetically the same as the Mystery Word."

// return Validated, problem



