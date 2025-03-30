import { levelParams } from "./levels";

// Function f({word, rack, best, level}) returns number of rounds that match
export const roundAchievements = [
  { icon: "🍩", name: "12-letter word", desc: "A dirty dozen", f: ({ word }) => word?.word?.length === 12 },
  {
    icon: "🧁",
    name: "13-letter word",
    desc: "A baker's dozen",
    rarity: "rare",
    f: ({ word }) => word?.word?.length === 13,
  },
  {
    icon: "🏔",
    name: "14-letter word",
    desc: "Climb a mighty 14'er",
    rarity: "very rare",
    f: ({ word }) => word?.word?.length === 14,
  },
  { icon: "💯", name: "100 pointer", desc: "Welcome to the century club", f: ({ word }) => word?.score >= 100 },
  {
    icon: "✌️",
    name: "200 pointer",
    desc: "Now that's a really big word",
    rarity: "very rare",
    f: ({ word }) => word?.score >= 200,
  },
  {
    icon: "☠️",
    name: "Impossible rack",
    desc: "Get a rack that doesn't make any words",
    rarity: "ultra rare",
    f: ({ best }) => !best,
  },
  ...levelParams.map((lp) => ({
    icon: "🤯",
    name: `Bingo-${lp.tiles}!`,
    desc: `Use all ${lp.tiles} letters in a rack on the ${lp.name} level`,
    rarity: lp.tiles > 12 ? "ultra rare" : lp.tiles > 9 ? "rare" : null,
    f: ({ word, rack, level }) => word?.word?.length === rack.length && level === lp.name,
    bonus: 50,
  })),
];

// Function f({words, racks, bests, level, score}) returns true/false
export const gameAchievements = [
  {
    icon: "✅",
    name: "Full board",
    desc: "No rounds skipped",
    f: ({ words }) => !words.filter((w) => !w).length,
    bonus: 100,
  },
  { icon: "🧗", name: "400 points", desc: "Getting the hang of it", f: ({ score }) => score >= 400 },
  { icon: "🚂", name: "500 points", desc: "Clearly on the right track now", f: ({ score }) => score >= 500 },
  { icon: "🤖", name: "600 points", desc: "You are a scoring machine", f: ({ score }) => score >= 600 },
  {
    icon: "🧙",
    name: "700 points",
    desc: 'Word wizard (you sure cast a lot of "spells" ha ha)',
    f: ({ score }) => score >= 700,
    rarity: "rare",
  },
  {
    icon: "👑",
    name: "800 points",
    desc: "If there was an orthography hall of fame, you would be in it",
    rarity: "very rare",
    f: ({ score }) => score >= 800,
  },
  {
    icon: "🏴‍☠️",
    name: "900 points",
    desc: "Inconceivable! I do not think that word means what you think it means",
    rarity: "ultra rare",
    f: ({ score }) => score >= 900,
  },
  {
    icon: "⭐️",
    name: "Best word",
    desc: "Play the best word in a round",
    f: ({ words }) => words.filter((w) => w?.isBest).length >= 1,
  },
  {
    icon: "🤩",
    name: "Two stars",
    desc: "Nailed it, twice",
    f: ({ words }) => words.filter((w) => w?.isBest).length === 2,
  },
  {
    icon: "✨",
    name: "Three stars",
    desc: "Nailed it, thrice",
    f: ({ words }) => words.filter((w) => w?.isBest).length === 3,
  },
  {
    icon: "🎖️",
    name: "Four stars",
    desc: "You're like a 4-star general, but with words",
    rarity: "rare",
    f: ({ words }) => words.filter((w) => w?.isBest).length === 4,
  },
  {
    icon: "🌃",
    name: "Five stars",
    desc: "This game rates YOU five stars",
    rarity: "rare",
    f: ({ words }) => words.filter((w) => w?.isBest).length === 5,
  },
  {
    icon: "🌌",
    name: "Six stars",
    desc: "Your spelling prowess lights up the night sky with stars",
    rarity: "very rare",
    f: ({ words }) => words.filter((w) => w?.isBest).length === 6,
  },
  ...levelParams.map((lp) => ({
    ...lp.perfect,
    f: ({ words, racks, level }) => level === lp.name && words.filter((w) => w?.isBest).length === racks.length,
  })),
];
