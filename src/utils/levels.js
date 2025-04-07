import { wordScore } from "./wordscore";
import Bingo1Icon from "../../assets/images/bingo1.svg";
import Bingo2Icon from "../../assets/images/bingo2.svg";
import Bingo3Icon from "../../assets/images/bingo3.svg";
import FireworksIcon from "../../assets/images/fireworks.svg";
import GraduateIcon from "../../assets/images/graduate.svg";
import UnicornIcon from "../../assets/images/unicorn.svg";

export const levelParams = [
  {
    name: "Beginner",
    tiles: 9,
    minimumLength: 4,
    minVowels: 1,
    maxVowels: 6,
    scoreToBeat: 240,
    slotFuncs: [
      { name: "Anything", f: (w) => w.length >= 4 },
      { name: "4 letters", f: (w) => w.length === 4 },
      { name: "5 letters", f: (w) => w.length === 5 },
      { name: "6+ letters", f: (w) => w.length >= 6 },
      { name: "20 pointer", f: (w) => wordScore(w) >= 20 },
      { name: "30 pointer", f: (w) => wordScore(w) >= 30 },
      { name: "40 pointer", f: (w) => wordScore(w) >= 40 },
    ],
    bingo: {
      icon: <Bingo1Icon />,
      bg: "#975",
      name: "Bingo (bronze)",
      desc: "Use all 9 letters in a rack on the beginner level",
      sortOrder: 2.1,
    },
    perfect: {
      icon: <FireworksIcon />,
      bg: "#113",
      name: "Seven stars",
      desc: "A perfect board on the beginner level",
      rarity: "ultra rare",
    },
  },
  {
    name: "Intermediate",
    tiles: 12,
    minimumLength: 5,
    minVowels: 2,
    maxVowels: 8,
    scoreToBeat: 380,
    slotFuncs: [
      { name: "Anything", f: (w) => w.length >= 5 },
      { name: "6 letters", f: (w) => w.length === 6 },
      { name: "7 letters", f: (w) => w.length === 7 },
      { name: "8+ letters", f: (w) => w.length >= 8 },
      { name: "35 pointer", f: (w) => wordScore(w) >= 35 },
      { name: "45 pointer", f: (w) => wordScore(w) >= 45 },
      { name: "55 pointer", f: (w) => wordScore(w) >= 55 },
    ],
    bingo: {
      icon: <Bingo2Icon />,
      name: "Bingo (silver)",
      bg: "#bbc",
      desc: "Use all 12 letters in a rack on the intermediate level",
      rarity: "very rare",
      sortOrder: 2.2,
    },
    perfect: {
      icon: <GraduateIcon />,
      bg: "#e81",
      name: "Mastery",
      desc: "A perfect board on the intermediate level",
      rarity: "ultra rare",
    },
  },
  {
    name: "Expert",
    tiles: 15,
    minimumLength: 6,
    minVowels: 3,
    maxVowels: 9,
    slotFuncs: [
      { name: "Anything", f: (w) => w.length >= 6 },
      { name: "7 letters", f: (w) => w.length === 7 },
      { name: "8 letters", f: (w) => w.length === 8 },
      { name: "9+ letters", f: (w) => w.length >= 9 },
      { name: "60 pointer", f: (w) => wordScore(w) >= 60 },
      { name: "75 pointer", f: (w) => wordScore(w) >= 75 },
      { name: "90 pointer", f: (w) => wordScore(w) >= 90 },
    ],
    bingo: {
      icon: <Bingo3Icon />,
      bg: "#ec5",
      name: "Bingo (gold)",
      desc: "Use all 15 letters in a rack on the expert level",
      rarity: "very rare",
      sortOrder: 2.3,
    },
    perfect: {
      icon: <UnicornIcon />,
      bg: "#f0c",
      name: "Perfection",
      desc: "Congratulations! This is the ultimate achievement. Thank you for playing qword.",
      rarity: "ultra rare",
    },
  },
];
