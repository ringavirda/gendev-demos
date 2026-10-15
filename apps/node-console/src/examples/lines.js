// Read y/e/q lines from stdin and draw a princess, by events and for await.
import { createInterface } from "node:readline";
import { createInterface as createPromiseInterface } from "node:readline/promises";
import process from "node:process";
import { getRandomPrincess } from "../princesses.js";

const echo = (message) => process.stdout.write(`${message}\n`);
const echoDraw = (princess) => echo(`${princess} has selected you!`);

const prompt = `
Commands:
  <y> - rnd young one
  <e> - rnd old one
  <q> - exit
> `;

// Returns true when the line asks to quit.
const interpret = (line) => {
  const command = line.toLowerCase().trim();
  echo("");
  if (command === "y") echoDraw(getRandomPrincess("young"));
  else if (command === "e") echoDraw(getRandomPrincess("elder"));
  else if (command === "q") return true;
  else echo("Unknown command - try again.");
  return false;
};

// Callbacks on the "line" and "close" events; the end of input is "close".
export const runLineEvents = () => {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  rl.setPrompt(prompt);

  const onLine = (line) => {
    if (interpret(line)) {
      rl.off("line", onLine);
      rl.close();
    } else rl.prompt();
  };
  rl.on("line", onLine);
  rl.on("close", () => echo("Bye!"));

  rl.prompt();
};

// The interface is an async iterable of lines; the loop ends with the input.
export const runForAwait = async () => {
  const rl = createPromiseInterface({ input: process.stdin });

  process.stdout.write(prompt);
  for await (const line of rl) {
    if (interpret(line)) {
      rl.close();
      break;
    }
    process.stdout.write(prompt);
  }
  echo("Bye!");
};
