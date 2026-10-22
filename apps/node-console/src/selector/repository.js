import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { PrincessDict } from "../princesses.js";

const isIndex = (word) => /^\d+$/.test(word);

const stateError = (path, reason, cause) =>
  new Error(`Cannot read state file ${path}: ${reason}`, { cause });

const isStateShape = (value) =>
  typeof value === "object" &&
  value !== null &&
  !Array.isArray(value) &&
  Object.values(value).every(
    (list) => Array.isArray(list) && list.every((n) => typeof n === "string"),
  );

/**
 * Keeps the princess categories in memory and in a JSON file.
 */
export class PrincessRepository {
  #path;
  #categories = new Map();

  /**
   * @param {string} path absolute path of the JSON state file. No I/O happens here.
   */
  constructor(path) {
    this.#path = path;
  }

  /**
   * Reads the state file. A missing file starts from a copy of the defaults and
   * writes nothing.
   * @returns {Promise<void>}
   * @throws {Error} `Cannot read state file <path>: <reason>` when the file
   * cannot be read, is not JSON, or is not an object of string arrays.
   */
  async load() {
    let text;
    try {
      text = await readFile(this.#path, "utf8");
    } catch (error) {
      if (error.code === "ENOENT") {
        this.#categories = new Map(
          [...PrincessDict].map(([name, list]) => [name, [...list]]),
        );
        return;
      }
      throw stateError(this.#path, error.message, error);
    }
    let data;
    try {
      data = JSON.parse(text);
    } catch (error) {
      throw stateError(this.#path, error.message, error);
    }
    if (!isStateShape(data)) {
      throw stateError(this.#path, "expected an object of name lists.");
    }
    this.#categories = new Map(Object.entries(data));
  }

  /**
   * @returns {string[]} category names in stored order.
   */
  getCategoryNames() {
    return [...this.#categories.keys()];
  }

  /**
   * @param {string} category
   * @returns {string[]} a copy of the category's princess names.
   * @throws {Error} when the category is unknown.
   */
  getCategory(category) {
    return [...this.#list(category)];
  }

  /**
   * @param {string} category
   * @param {string} word an index (digits only) or an exact, case-sensitive name.
   * @returns {string} the princess name.
   * @throws {Error} when the category or princess is unknown or the index is out of range.
   */
  getPrincess(category, word) {
    const list = this.#list(category);
    return list[this.#indexOf(list, category, word)];
  }

  /**
   * @param {string} category
   * @param {string} name must not be in the category or consist of digits only.
   * @returns {Promise<void>} resolves once the state is saved.
   * @throws {Error} when the category is unknown or the name is a duplicate or digits only.
   */
  async addPrincess(category, name) {
    const list = this.#list(category);
    this.#checkName(list, category, name);
    list.push(name);
    await this.#save();
  }

  /**
   * @param {string} category
   * @param {string} word an index (digits only) or an exact, case-sensitive name.
   * @returns {Promise<string>} the removed name, once the state is saved.
   * @throws {Error} when the category or princess is unknown or the index is out of range.
   */
  async removePrincess(category, word) {
    const list = this.#list(category);
    const [removed] = list.splice(this.#indexOf(list, category, word), 1);
    await this.#save();
    return removed;
  }

  /**
   * @param {string} category
   * @param {string} word an index (digits only) or an exact, case-sensitive name.
   * @param {string} newName must not be in the category or consist of digits only.
   * @returns {Promise<string>} the old name, once the state is saved.
   * @throws {Error} when the category or princess is unknown, the index is out of
   * range, or the new name is a duplicate or digits only.
   */
  async changePrincess(category, word, newName) {
    const list = this.#list(category);
    const index = this.#indexOf(list, category, word);
    this.#checkName(list, category, newName);
    const oldName = list[index];
    list[index] = newName;
    await this.#save();
    return oldName;
  }

  #list(category) {
    const list = this.#categories.get(category);
    if (!list) throw new Error(`Unknown category [${category}].`);
    return list;
  }

  #indexOf(list, category, word) {
    if (isIndex(word)) {
      const index = Number(word);
      if (index >= list.length) {
        throw new Error(`Id [${word}] is out of range for [${category}].`);
      }
      return index;
    }
    const index = list.indexOf(word);
    if (index < 0) {
      throw new Error(`Unknown princess [${word}] in [${category}].`);
    }
    return index;
  }

  #checkName(list, category, name) {
    if (isIndex(name)) {
      throw new Error(`A name cannot be only digits: [${name}].`);
    }
    if (list.includes(name)) {
      throw new Error(`[${name}] is already in [${category}].`);
    }
  }

  async #save() {
    await mkdir(dirname(this.#path), { recursive: true });
    const text = JSON.stringify(Object.fromEntries(this.#categories), null, 2);
    await writeFile(this.#path, `${text}\n`);
  }
}
