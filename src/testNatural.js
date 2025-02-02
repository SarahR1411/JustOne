import natural from 'natural';

// Test if the package works
const tokenizer = new natural.WordTokenizer();
console.log(tokenizer.tokenize("Hello, how are you today?"));
