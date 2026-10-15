import chalk from "chalk";

import { greet } from "./greet.js";

const name = process.argv[2] ?? "world";

console.log(chalk.green(greet(name)));
