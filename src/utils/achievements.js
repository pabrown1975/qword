import { levelParams } from "./levels";
import DonutIcon from "../../assets/images/donut.svg";
import CupcakeIcon from "../../assets/images/cupcacke.svg";
import MountainIcon from "../../assets/images/mountain.svg";
import Bill100Icon from "../../assets/images/100bill.svg";
import Bill200Icon from "../../assets/images/200bill.svg";
import SkullIcon from "../../assets/images/skull.svg";
import ChecklistIcon from "../../assets/images/checklist.svg";
import ClimberIcon from "../../assets/images/climber.svg";
import TrainIcon from "../../assets/images/train.svg";
import RobotIcon from "../../assets/images/robot.svg";
import WizardIcon from "../../assets/images/wizard.svg";
import KingIcon from "../../assets/images/king.svg";
import PirateIcon from "../../assets/images/pirate.svg";
import StarIcon from "../../assets/images/star.svg";
import SmileyIcon from "../../assets/images/smiley.svg";
import ThreeStarsIcon from "../../assets/images/3stars.svg";
import GeneralIcon from "../../assets/images/general.svg";
import ReviewIcon from "../../assets/images/review.svg";
import NightSkyIcon from "../../assets/images/nightsky.svg";


// Function f({word, rack, best, level}) returns number of rounds that match
export const roundAchievements = [
  {
    icon: <DonutIcon />,
    bg: "#fe1",
    name: "12-letter word",
    desc: "A dozen... mmm dozen... arhrhrh...",
    f: ({ word }) => word?.word?.length === 12,
    sortOrder: 9,
  },
  {
    icon: <CupcakeIcon />,
    bg: "#f8d",
    name: "13-letter word",
    desc: "A baker's dozen",
    rarity: "rare",
    f: ({ word }) => word?.word?.length === 13,
    sortOrder: 10,
  },
  {
    icon: <MountainIcon />,
    bg: "#704d39",
    name: "14-letter word",
    desc: "Climb a mighty 14'er",
    rarity: "very rare",
    f: ({ word }) => word?.word?.length === 14,
    sortOrder: 11,
  },
  {
    icon: <Bill100Icon />,
    bg: "#b20000",
    name: "100 point word",
    desc: "Welcome to the century club",
    f: ({ word }) => word?.score >= 100,
    sortOrder: 12,
  },
  {
    icon: <Bill200Icon />,
    bg: "#00b",
    name: "200 point word",
    desc: "Now that's a really big word",
    rarity: "very rare",
    f: ({ word }) => word?.score >= 200,
    sortOrder: 13,
  },
  {
    icon: <SkullIcon />,
    bg: "#302",
    name: "Impossible rack",
    desc: "Get a rack that doesn't make any words",
    rarity: "ultra rare",
    f: ({ best }) => !best,
    sortOrder: 21,
  },
  ...levelParams.map((lp) => ({
    ...lp.bingo,
    f: ({ word, rack, level }) => word?.word?.length === rack.length && level === lp.name,
    bonus: 50,
  })),
];

// Function f({words, racks, bests, level, score}) returns true/false
export const gameAchievements = [
  {
    icon: <ChecklistIcon />,
    bg: "#6dbc3f",
    name: "Full board",
    desc: "No rounds skipped",
    f: ({ words }) => !words.filter((w) => !w).length,
    bonus: 100,
    sortOrder: 1,
  },
  {
    icon: <ClimberIcon />,
    bg: "#61bdd2",
    name: "400 points",
    desc: "Getting the hang of it",
    f: ({ score }) => score >= 400,
    sortOrder: 14,
  },
  {
    icon: <TrainIcon />,
    bg: "#955",
    name: "500 points",
    desc: "Clearly on the right track now",
    f: ({ score }) => score >= 500,
    sortOrder: 15,
  },
  {
    icon: <RobotIcon />,
    bg: "#fff",
    name: "600 points",
    desc: "You are a scoring machine",
    f: ({ score }) => score >= 600,
    sortOrder: 16,
  },
  {
    icon: <WizardIcon />,
    bg: "#b5b5b5",
    name: "700 points",
    desc: 'Word wizard! You sure cast a lot of "spells" ha ha.',
    f: ({ score }) => score >= 700,
    rarity: "rare",
    sortOrder: 17,
  },
  {
    icon: <KingIcon />,
    bg: "#b20000",
    name: "800 points",
    desc: "King of qword! Long live the king (or queen)!",
    rarity: "very rare",
    f: ({ score }) => score >= 800,
    sortOrder: 18,
  },
  {
    icon: <PirateIcon />,
    bg: "#00967a",
    name: "1000 points",
    desc: "Inconceivable! I do not think that word means what you think it means.",
    rarity: "ultra rare",
    f: ({ score }) => score >= 1000,
    sortOrder: 19,
  },
  {
    icon: <StarIcon />,
    bg: "#fff",
    name: "Best word",
    desc: "Play the best word in a round",
    f: ({ words }) => words.filter((w) => w?.isBest).length >= 1,
    sortOrder: 3,
  },
  {
    icon: <SmileyIcon />,
    bg: "#fff",
    name: "Two stars",
    desc: "Nailed it, twice",
    f: ({ words }) => words.filter((w) => w?.isBest).length === 2,
    sortOrder: 4,
  },
  {
    icon: <ThreeStarsIcon />,
    bg: "#fbb",
    name: "Three stars",
    desc: "Nailed it, thrice",
    f: ({ words }) => words.filter((w) => w?.isBest).length === 3,
    sortOrder: 5,
  },
  {
    icon: <GeneralIcon />,
    bg: "#564",
    name: "Four stars",
    desc: "You're like a 4-star general, but with words",
    rarity: "rare",
    f: ({ words }) => words.filter((w) => w?.isBest).length === 4,
    sortOrder: 6,
  },
  {
    icon: <ReviewIcon />,
    name: "Five stars",
    bg: "#fff",
    desc: "This game rates YOU five stars",
    rarity: "rare",
    f: ({ words }) => words.filter((w) => w?.isBest).length === 5,
    sortOrder: 7,
  },
  {
    icon: <NightSkyIcon />,
    bg: "#113",
    name: "Six stars",
    desc: "Your spelling prowess lights up the night sky with stars",
    rarity: "very rare",
    f: ({ words }) => words.filter((w) => w?.isBest).length === 6,
    sortOrder: 8,
  },
  ...levelParams.map((lp, i) => ({
    ...lp.perfect,
    f: ({ words, racks, level }) => level === lp.name && words.filter((w) => w?.isBest).length === racks.length,
    sortOrder: 20 + i / 10,
  })),
];
