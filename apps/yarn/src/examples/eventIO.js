import process from "process";
import { getRandomPrincess } from "../princesses.js";

// Generic echos
const echoInline = (message) => process.stdout.write(message);
const echo = (message) =>
  echoInline(message !== undefined ? `${message}\n` : "\n");
// Non generic echos
const echoDraw = (princess) => echo(`${princess} has selected you!`);

// A user guide of sorts and a prompt to input something.
const prompt = () =>
  echoInline(`
Commands:  
  <y> - rnd young one 
  <e> - rnd old one 
  <q> - exit
> `);

// Message pump, that triggers on every prompt input.
export const runEventIO = () => {
  // This is basically a callback function that registers on the specific event.
  process.stdin.on("data", (chunk) => {
    const command = chunk.toString().toLowerCase().trim();
    echo();

    // Command selector
    if (command === "y") echoDraw(getRandomPrincess("young"));
    else if (command === "e") echoDraw(getRandomPrincess("elder"));
    else if (command === "q") process.exit(0);
    else echo("Unknown command - try again.");

    prompt();
  });

  // Start the pump!
  prompt();
};
