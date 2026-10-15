import { randomInt } from "crypto";

import { cli } from "./cli.js";
import { princessRepo } from "./repository.js";

/**
 * Command processing function, that parses user provided args and invokes
 * specified commands. Uses `CLI` to print necessary outputs and `PrincessRepo`
 * for data persistence and reading.
 *
 * @param {string} selector string that identifies which command to run.
 * @param {Array} args a list of given command arguments in string format.
 * @param {Array} list a list of available commands to process through.
 */
export const commandPump = (selector, args, list) => {
  const command = list.find((c) => c.selectors.includes(selector));

  if (command === undefined) {
    cli.echoError(`Unknown command: ${selector}`);
    return;
  } else if (!command.allowNoArg && command.action.length !== args.length) {
    cli.echoError(
      `Incorrect amount of args for (${selector}), should be ${command.action.length}.`,
    );
    return;
  }

  try {
    command.action(...args);
  } catch (error) {
    cli.echoError(error.message);
  }
};

/**
 * List of known commands, that can be easily adjusted.
 * Each of the commands should have these fields:
 *   selectors - letter sequences, that user can specify to invoke this command.
 *   action - callback function, that runs when the command is invoked.
 *   allowNoArg? - boolean that allows no arg invocation.
 */
export const DefaultCommandList = [
  {
    selectors: ["list", "ls"],
    action: (category) => {
      try {
        const list = princessRepo.getCategory(category);
        cli.echoSuccess(`Displaying category [${category}]:`);
        list.forEach((pr, i) => cli.echo(`  ${i} - ${pr}`));
      } catch {
        cli.echoWarn(
          "No category was provided or found, displaying all categories:",
        );
        princessRepo.state.forEach((_, key) => cli.echo(`  - ${key}`));
      }
    },
    allowNoArg: true,
  },
  {
    selectors: ["get", "g"],
    action: (category, prIndex) => {
      const pr = princessRepo.get(category, prIndex);
      if (pr !== null) {
        cli.echoInline(`Yay! You've selected: `);
        cli.echoSuccess(pr);
      }
    },
  },
  {
    selectors: ["getrnd", "gr"],
    action: (category) => {
      const list = princessRepo.getCategory(category);
      if (list !== null) {
        cli.echoWarn("You prey to the RNG powers...");
        cli.echoInline(`Yay! You've been selected by: `);
        cli.echoSuccess(list[randomInt(list.length)]);
      }
    },
  },
  {
    selectors: ["add", "a"],
    action: (category, newName) => {
      princessRepo.add(category, newName);
    },
  },
  {
    selectors: ["remove", "rm"],
    action: (category, name) => {
      princessRepo.remove(category, name);
    },
  },
  {
    selectors: ["change", "ch"],
    action: (category, name, newName) => {
      princessRepo.change(category, name, newName);
    },
  },
  {
    selectors: ["help", "h"],
    action: () => {
      cli.echoSuccess("Supported command signatures:");
      cli.echo("  - ls, g, gr, a, rm, ch, h");
    },
  },
];
