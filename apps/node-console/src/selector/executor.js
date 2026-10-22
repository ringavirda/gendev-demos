/**
 * @typedef {object} Command
 * @property {string[]} selectors words that run the command, the first one is
 * its main name.
 * @property {string[]} params parameter names, a trailing `?` marks an
 * optional one.
 * @property {string} description one line for the help.
 * @property {(...words: string[]) => void | Promise<void>} action called with
 * the words after the selector.
 */

const isOptional = (param) => param.endsWith("?");

const formatParams = (params) =>
  params
    .map((p) => (isOptional(p) ? `[${p.slice(0, -1)}]` : `<${p}>`))
    .join(" ");

const formatCommand = ({ selectors, params, description }) =>
  `  ${[selectors.join(", "), formatParams(params)].filter(Boolean).join(" ")} - ${description}`;

/**
 * Finds a command by the first word of a line, checks the word count and runs it.
 */
export class Executor {
  #cli;
  #commands = [];

  /**
   * Registers the `help` command.
   *
   * @param {{ echo: Function, echoError: Function }} cli where messages go.
   */
  constructor(cli) {
    this.#cli = cli;
    this.registerCommand({
      selectors: ["help", "h"],
      params: ["command?"],
      description: "Show the command list or one command.",
      action: (word) => this.#help(word),
    });
  }

  /**
   * Adds a command.
   *
   * @param {Command} command the command to add.
   * @throws {Error} when one of its selectors is already registered.
   */
  registerCommand(command) {
    for (const selector of command.selectors) {
      if (this.#find(selector))
        throw new Error(`Selector [${selector}] is already registered.`);
    }
    this.#commands.push(command);
  }

  /**
   * Runs one line of input. Problems are printed, never thrown.
   *
   * @param {string} line the raw line. A blank line does nothing.
   * @returns {Promise<void>} resolves when the command has finished.
   */
  async execute(line) {
    const [selector, ...words] = line.trim().split(/\s+/);
    if (!selector) return;

    const command = this.#find(selector);
    if (!command) {
      this.#cli.echoError(`Unknown command: ${selector}`);
      return;
    }

    const required = command.params.filter((p) => !isOptional(p)).length;
    if (words.length < required || words.length > command.params.length) {
      this.#cli.echoError(
        `Usage: ${[command.selectors[0], formatParams(command.params)].filter(Boolean).join(" ")}`,
      );
      return;
    }

    try {
      await command.action(...words);
    } catch (error) {
      this.#cli.echoError(error.message);
    }
  }

  #find(selector) {
    return this.#commands.find((c) => c.selectors.includes(selector));
  }

  #help(word) {
    if (!word) {
      for (const command of this.#commands)
        this.#cli.echo(formatCommand(command));
      return;
    }
    const command = this.#find(word);
    if (command) this.#cli.echo(formatCommand(command));
    else this.#cli.echoError(`Unknown command: ${word}`);
  }
}
