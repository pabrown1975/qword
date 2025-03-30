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

  if (wordlist.indexOf(word) < 0) {
    return { valid: false, msg: `${word} is not in the word list` };
  }

  return { valid: true, msg: `${word} = ${wordScore(word)} points` };
};

export const bestWord = (letters, minLength) => {
  const counts1 = letters.reduce(
    (counts, l) => ({
      ...counts,
      [l]: (counts[l] ?? 0) + 1,
    }),
    {}
  );

  const filtered = wordlist.filter((w) => w.length >= minLength && w.length <= letters.length);

  outer: for (let word of filtered) {
    const counts2 = {};

    for (let letter of word) {
      counts2[letter] = (counts2[letter] ?? 0) + 1;

      if (!counts1[letter] || counts2[letter] > counts1[letter]) {
        continue outer;
      }
    }

    return word;
  }

  return null;
};
