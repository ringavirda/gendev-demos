import { createInterface } from "node:readline/promises";
import chalk, { chalkStderr } from "chalk";

/**
 * Terminal input and output for the selector: a prompt that reads one line at
 * a time and colored message helpers.
 */
export class CLI {
  #rl = createInterface({ input: process.stdin, output: process.stdout });
  #lines = this.#rl[Symbol.asyncIterator]();

  /**
   * Shows the prompt and waits for the next line.
   *
   * @param {string} prompt text shown before the cursor.
   * @returns {Promise<string | null>} the line, or `null` when the input has
   * ended (Ctrl+D, end of a pipe, Ctrl+C).
   */
  async read(prompt) {
    if (this.#rl.closed) process.stdout.write(`${prompt} `);
    else {
      this.#rl.setPrompt(`${prompt} `);
      this.#rl.prompt();
    }
    const { value, done } = await this.#lines.next();
    return done ? null : value;
  }

  /**
   * Prints a line to stdout.
   *
   * @param {string} [message] text to print, an empty line when omitted.
   */
  echo(message = "") {
    process.stdout.write(`${message}\n`);
  }

  /**
   * Prints a line to stdout in green.
   *
   * @param {string} message text to print.
   */
  echoSuccess(message) {
    this.echo(chalk.green(message));
  }

  /**
   * Prints a line to stdout in yellow, after an underlined `Warn:`.
   *
   * @param {string} message text to print.
   */
  echoWarn(message) {
    this.echo(chalk.yellow(`${chalk.underline("Warn:")} ${message}`));
  }

  /**
   * Prints a line to stderr in red, after an underlined `Err:`.
   *
   * @param {string} message text to print.
   */
  echoError(message) {
    process.stderr.write(
      `${chalkStderr.red(`${chalkStderr.underline("Err:")} ${message}`)}\n`,
    );
  }

  /**
   * Closes the input. Safe to call more than once.
   */
  close() {
    this.#rl.close();
  }
}
