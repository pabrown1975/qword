import { letterPoints } from "./constants";
import wordlist from "./wordlist";

export const lengthBonus = (word) => 1.2 ** word.length;

export const letterSum = (word) => word.split("").reduce((sum, letter) => sum + letterPoints[letter], 0);

export const wordScore = (word) => (word ? Math.round(lengthBonus(word) * letterSum(word)) : 0);

export const evaluateWord = (word, minLength) => {
  if (!word) {
    return { valid: false, msg: "Make a word!" };
  }

  if (word.length < minLength) {
    return { valid: false, msg: `minimum word length is ${minLength}` };
  }

  if (wordlist.findIndex((row) => row[0] === word) < 0) {
    return { valid: false, msg: `${word} is not in the word list` };
  }

  return { valid: true, msg: `${word} = ${wordScore(word)} points` };
};
