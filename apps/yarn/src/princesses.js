import { randomInt } from "crypto";

// Dictionary of seven princesses, separated into two categories.
export const PrincessDict = new Map([
  ["elder", ["Celestia", "Luna", "Cadance"]],
  ["young", ["Twilight", "Sunset", "Fallenstar", "Moonlight"]],
]);

// Simply returns a random young or elder princess.
// Note: don't use `crypto` in browser scenarios!
export const getRandomPrincess = (category) => {
  if (PrincessDict.has(category)) {
    const list = PrincessDict.get(category);
    return list[randomInt(list.length)];
  }
};
