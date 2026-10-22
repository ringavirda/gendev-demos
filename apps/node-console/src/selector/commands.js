import { randomInt } from "node:crypto";

/**
 * Builds the selector's commands over a repository.
 *
 * @param {import("./repository.js").PrincessRepository} repository where the categories live.
 * @param {import("./cli.js").CLI} cli where results are printed.
 * @returns {import("./executor.js").Command[]} the commands to register.
 */
export const createCommands = (repository, cli) => [
  {
    selectors: ["list", "ls"],
    params: ["category?"],
    description: "Show the categories, or the princesses of one.",
    action: (category) => {
      if (category === undefined) {
        for (const name of repository.getCategoryNames()) cli.echo(`  ${name}`);
        return;
      }
      repository
        .getCategory(category)
        .forEach((name, i) => cli.echo(`  ${i} - ${name}`));
    },
  },
  {
    selectors: ["get", "g"],
    params: ["category", "princess"],
    description: "Select a princess by index or name.",
    action: (category, princess) => {
      const name = repository.getPrincess(category, princess);
      cli.echoSuccess(`You've selected: ${name}`);
    },
  },
  {
    selectors: ["getrnd", "gr"],
    params: ["category"],
    description: "Select a random princess of a category.",
    action: (category) => {
      const list = repository.getCategory(category);
      if (list.length === 0) {
        cli.echoWarn(`Category [${category}] is empty.`);
        return;
      }
      cli.echoSuccess(
        `You've been selected by: ${list[randomInt(list.length)]}`,
      );
    },
  },
  {
    selectors: ["add", "a"],
    params: ["category", "name"],
    description: "Add a princess to a category.",
    action: async (category, name) => {
      await repository.addPrincess(category, name);
      cli.echoSuccess(`Added [${name}] to [${category}].`);
    },
  },
  {
    selectors: ["remove", "rm"],
    params: ["category", "princess"],
    description: "Remove a princess by index or name.",
    action: async (category, princess) => {
      const name = await repository.removePrincess(category, princess);
      cli.echoSuccess(`Removed [${name}] from [${category}].`);
    },
  },
  {
    selectors: ["change", "ch"],
    params: ["category", "princess", "newName"],
    description: "Rename a princess.",
    action: async (category, princess, newName) => {
      const name = await repository.changePrincess(category, princess, newName);
      cli.echoSuccess(`Changed [${name}] to [${newName}] in [${category}].`);
    },
  },
];
