import wordlist from "./wordlist";
import { levelParams } from "./levels";

const filteredLists = {};

levelParams.forEach((lp) => {
  filteredLists[lp.name] = wordlist.filter(([w]) => w.length >= lp.minVowels && w.length <= lp.tiles);
});

export const bestWord = (letters, listName) => {
  const sortedRack = [...letters].sort();

  for (const [word, sortedWord] of filteredLists[listName]) {
    // if (word.length >= minLength && word.length <= letters.length) {
    let j = 0;

    for (let i = 0; i < sortedRack.length; i++) {
      if (sortedRack[i] === sortedWord[j]) {
        j++;
      } else if (sortedRack[i] > sortedWord[j]) {
        break;
      }

      if (j === sortedWord.length) {
        return word;
      }
    }
    // }
  }

  return null;
};

// export const bestWord = (letters, minLength) => {
//   const counts1 = letters.reduce(
//     (counts, l) => ({
//       ...counts,
//       [l]: (counts[l] ?? 0) + 1,
//     }),
//     {}
//   );
//
//   const filtered = wordlist.filter(([word, _]) => word.length >= minLength && word.length <= letters.length);
//
//   outer: for (let word of filtered) {
//     const counts2 = {};
//
//     for (let letter of word) {
//       counts2[letter] = (counts2[letter] ?? 0) + 1;
//
//       if (!counts1[letter] || counts2[letter] > counts1[letter]) {
//         continue outer;
//       }
//     }
//
//     return word;
//   }
//
//   return null;
// };
