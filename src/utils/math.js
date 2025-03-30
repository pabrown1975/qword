import { murmur3 } from "murmurhash-js";

export const random = str => murmur3(str, 171717) / 0x100000000;

export const randomInt = (str, min, max) => min + Math.floor(random(str) * (1 + max - min));

export const clamp = (x, min, max) => Math.min(Math.max(x, min), max);
