import { clamp } from "./math";

export const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

export const moveArrayElement = (array, from, to) => {
  const element = array[from];

  array.splice(from, 1);
  array.splice(clamp(to, 0, array.length), 0, element);

  return array;
};
