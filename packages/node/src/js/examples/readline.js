import * as readline from "readline/promises";
import process from "process";
import { getRandomPrincess } from "../princesses.js";

// Asynchronous object interface over standard process stdin and stdout.
const cli = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// No inline echo this time.
const echo = (message) =>
  cli.write(message !== undefined ? `${message}\n` : "\n");
const echoDraw = (princess) => echo(`${princess} has selected you!`);

// This is a multiline string.
const prompt = `
Commands:
  <y> - rnd young one
  <e> - rnd old one
  <q> - exit
> `;

// Since we use async interface, it is possible to utilize a cycle this time.
// More readable than the message pump approach.
export const runReadline = async () => {
  while (true) {
    // Read the command
    const command = await cli.question(prompt);
    echo();

    // Interpret the command
    if (command === "e") echoDraw(getRandomPrincess("elder"));
    else if (command === "y") echoDraw(getRandomPrincess("young"));
    else if (command === "q") {
      cli.close();
      // Since we are not in a callback, we can simply return out of here.
      return;
    } else echo("Unknown command - try again.");
  }
};
