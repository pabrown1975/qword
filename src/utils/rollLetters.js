import { vowelTable, consonantTable } from "./constants";
import { random, randomInt } from "./math";
import { shuffleArray } from "./arrays";
import { bestWord, wordScore } from './wordscore';
import { levelParams } from './levels';
import wordlist from './wordlist';

const randomLetter = (fromTable, seed) => {
  const r = random(seed);

  for (const i in fromTable) {
    if (r <= fromTable[i].threshold) {
      return fromTable[i].letter;
    }
  }

  return fromTable[0].letter;
};

export const rollLetters = (numLetters, seed, round, minVowels, maxVowels) => {
  const letters = [];
  const numVowels = randomInt(`${seed} ${round} numVowels`, minVowels, maxVowels);

  for (let i = 0; i < numLetters; i++) {
    letters[i] = randomLetter(i < numVowels ? vowelTable : consonantTable, `${seed} ${round} ${i}`);

    if (letters[i] === "q" && !letters.includes("u")) {
      letters[0] = "u";
    }
  }

  shuffleArray(letters);

  return letters;
};

export const buildRacks = (mode, level, date) => {
  const seedRoot = mode === "Daily" ? date.toDateString() : Math.floor(date.getTime() / 1000);
  const seed = `${mode} : ${seedRoot} : ${level}`;
  const index = levelParams.findIndex((lp) => lp.name === level)
  const data = levelParams[index];
  const numRounds = data.slotFuncs.length;
  const racks = [];
  const bestScores = [];
  const bestWords = [];
  const bingoRound = (mode === "Daily" && (date.getDay() % levelParams.length === index))
    ? randomInt(`${seed} bingo round`, 0, numRounds - 1)
    : -1;

  for (let r = 0; r < numRounds; r++) {
    let letters, best;

    if (r === bingoRound) {
      const filtered = wordlist.filter((w) => w.length === data.tiles);

      best = filtered[randomInt(`${seed} bingo word`, 1, filtered.length - 1)];
      letters = best.split("");
      shuffleArray(letters);
    } else {
      letters = rollLetters(data.tiles, seed, r, data.minVowels, data.maxVowels);
      best = bestWord(letters, data.minimumLength);
    }

    racks.push(letters);
    bestWords.push(best);
    bestScores.push(wordScore(best));
  }

  return { seed, racks, bestScores, bestWords, data };
};
