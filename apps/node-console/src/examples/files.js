// Load every .txt in data/ into a Map from category to names, with callbacks and with promises.
import { readdir, readFile } from "node:fs";
import {
  readdir as readdirAsync,
  readFile as readFileAsync,
} from "node:fs/promises";
import { join, basename } from "node:path";

export const dataDir = join(import.meta.dirname, "../../data");

const parse = (text) => text.split(/\r?\n/).filter((line) => line !== "");
const isTxt = (file) => file.endsWith(".txt");
const category = (file) => basename(file, ".txt");

// done(error, map): error-first, called once.
export const loadWithCallbacks = (dir, done) => {
  readdir(dir, (error, files) => {
    if (error) return done(error);

    const txt = files.filter(isTxt);
    const loaded = new Map();
    let pending = txt.length;
    let failed = false;
    if (pending === 0) return done(null, loaded);

    for (const file of txt) {
      readFile(join(dir, file), "utf8", (error, text) => {
        if (failed) return;
        if (error) {
          failed = true;
          return done(error);
        }
        loaded.set(category(file), parse(text));
        pending -= 1;
        if (pending === 0) done(null, loaded);
      });
    }
  });
};

export const loadWithPromises = async (dir) => {
  const txt = (await readdirAsync(dir)).filter(isTxt);
  const texts = await Promise.all(
    txt.map((file) => readFileAsync(join(dir, file), "utf8")),
  );
  return new Map(txt.map((file, i) => [category(file), parse(texts[i])]));
};

const print = (loaded) => {
  const sorted = [...loaded].sort(([a], [b]) => a.localeCompare(b));
  for (const [name, princesses] of sorted) {
    console.log(`${name}: ${princesses.join(", ")}`);
  }
};

export const runFsCallbacks = () => {
  loadWithCallbacks(dataDir, (error, loaded) => {
    if (error) throw error;
    print(loaded);
  });
};

export const runFsPromises = async () => {
  print(await loadWithPromises(dataDir));
};
