// Summon the princesses of a category one at a time, with an emitter and with a promise.
import { EventEmitter } from "node:events";
import { setTimeout as sleep } from "node:timers/promises";
import { PrincessDict } from "../princesses.js";

const unknown = (category) => new Error(`Unknown category: ${category}`);

// Emits "princess" (name) for each one, then "done" (names); "error" for an unknown category.
export class Summoning extends EventEmitter {
  start(category, delayMs) {
    const names = PrincessDict.get(category);
    if (names === undefined) {
      this.emit("error", unknown(category));
      return;
    }

    const summoned = [];
    const next = () => {
      if (summoned.length === names.length) {
        this.emit("done", summoned);
        return;
      }
      setTimeout(() => {
        const name = names[summoned.length];
        summoned.push(name);
        this.emit("princess", name);
        next();
      }, delayMs);
    };
    next();
  }
}

// Resolves with the names; rejects for an unknown category.
export const summon = async (category, delayMs) => {
  const names = PrincessDict.get(category);
  if (names === undefined) throw unknown(category);

  const summoned = [];
  for (const name of names) {
    await sleep(delayMs);
    summoned.push(name);
  }
  return summoned;
};

const echoDone = (names) => console.log(`Summoned ${names.length}.`);

export const runEmitterEvents = () => {
  const summoning = new Summoning();
  summoning.on("princess", (name) => console.log(name));
  summoning.on("done", echoDone);
  summoning.on("error", (error) => {
    throw error;
  });
  summoning.start("elder", 500);
};

export const runEmitterPromise = async () => {
  const names = await summon("elder", 500);
  names.forEach((name) => console.log(name));
  echoDone(names);
};
