import { vowelTable, consonantTable } from "./constants";
import { random, randomInt, randomIntNormalDist } from "./math";
import { shuffleArray } from "./arrays";
import { wordScore } from "./wordscore";
import { bestWord } from "./bestWord";
import { levelParams } from "./levels";
import wordlist from "./wordlist";

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
  const numVowels = randomIntNormalDist(`${seed} ${round} numVowels`, minVowels, maxVowels);

  for (let i = 0; i < numLetters; i++) {
    letters[i] = randomLetter(i < numVowels ? vowelTable : consonantTable, `${seed} ${round} ${i}`);

    if (letters[i] === "q" && !letters.includes("u")) {
      letters[0] = "u";
    }
  }

  shuffleArray(letters);

  return letters;
};

export const buildRacks = (mode, levelName, date) => {
  const seedRoot = mode === "Daily" ? date.toDateString() : Math.floor(date.getTime() / 1000);
  const seed = `${mode} : ${seedRoot} : ${levelName}`;
  const index = levelParams.findIndex((lp) => lp.name === levelName);
  const data = levelParams[index];
  const numRounds = data.slotFuncs.length;
  const racks = [];
  const bestScores = [];
  const bestWords = [];
  const bingoRound =
    mode === "Daily" && date.getDay() % levelParams.length === index
      ? randomInt(`${seed} bingo round`, 0, numRounds - 1)
      : -1;

  const slots = new Array(numRounds).fill(false);

  for (let r = 0; r < numRounds; r++) {
    let letters,
      best,
      done = false,
      attempt = 0;

    while (!done) {
      if (r === bingoRound) {
        const filtered = wordlist.filter(([w, _]) => w.length === data.tiles);

        best = filtered[randomInt(`${seed} bingo word`, 1, filtered.length - 1)][0];
        letters = best.split("");
        shuffleArray(letters);

        done = true;
      } else {
        letters = rollLetters(
          data.tiles,
          `${seed} attempt ${attempt}`,
          r,
          data.minVowels,
          Math.max(data.maxVowels - attempt, data.minVowels)
        );

        best = bestWord(letters, levelName);

        if (!best) {
          done = true;
        } else {
          for (let i = 0; i < numRounds; i++) {
            if (!slots[i] && data.slotFuncs.find((sf) => sf.fillOrder === i).f(best)) {
              slots[i] = true;
              done = true;
              break;
            }
          }
        }
      }

      if (!done && ++attempt === 12) {
        done = true;
      }
    }

    racks.push(letters);
    bestWords.push(best);
    bestScores.push(wordScore(best));
  }

  return { seed, racks, bestScores, bestWords, data };
};
