import { writeFile } from "fs/promises";
import { accessSync, constants, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { cli } from "./cli.js";
import { PrincessDict } from "../../princesses.js";

// Both of these function are needed for JSON serializer to work with
// information stored in Map data type.

function replacer(key, value) {
  if (value instanceof Map) {
    return {
      dataType: "Map",
      value: [...value],
    };
  }
  return value;
}

function reviver(key, value) {
  if (typeof value === "object" && value !== null) {
    if (value.dataType === "Map") {
      return new Map(value.value);
    }
  }
  return value;
}

/**
 * Provides an interface to store or read known princess data using JSON.
 */
class PrincessRepo {
  #repoDir = import.meta.dirname;
  #repoFile = "princesses.json";
  #repoPath = join(this.#repoDir, this.#repoFile);

  // Declare an internal state that initializes in constructor.
  #state;

  constructor() {
    try {
      // Cannot use async calls in constructors.
      // Read file if exists
      accessSync(this.repoPath, constants.F_OK);
      const data = readFileSync(this.repoPath);
      this.#state = JSON.parse(data.toString(), reviver);
    } catch {
      // Initialize database file if not
      cli.echoWarn(
        "Princess repo is uninitialized. Populating with default values...",
      );
      writeFileSync(this.repoPath, JSON.stringify(PrincessDict, replacer));
      this.#state = PrincessDict;
    }
  }

  get state() {
    return new Map(this.#state);
  }

  get repoPath() {
    return this.#repoPath;
  }

  /**
   * Write current state to the file.
   */
  async save() {
    await writeFile(this.repoPath, JSON.stringify(this.#state, replacer));
  }

  /**
   * Searches and returns the whole princess category. This one is utilized in
   * other methods of this class.
   *
   * @param {string} category to search.
   * @returns an array of strings which contains princesses' names.
   */
  getCategory(category) {
    if (this.#state.has(category)) return this.#state.get(category);
    else throw new Error(`Unknown category [${category}].`);
  }

  /**
   * Returns a specific princess name by given index.
   * @param {string} categoryName to search.
   * @param {string} id to display.
   * @returns princess's name.
   */
  get(categoryName, id) {
    const category = this.getCategory(categoryName);

    const index = parseInt(id);
    if (index < 0 || index >= category.length)
      throw new Error(`Id [${index}] is invalid for category [${category}].`);
    return category[index];
  }

  /**
   * Private method that ensures specific category includes specific princess.
   * @param {string} category to check.
   * @param {string} name to check.
   */
  #categoryHasPrincess(category, name) {
    if (!category.includes(name))
      throw new Error(`Unknown princess [${name}].`);
  }

  /**
   * Adds a new princes to the specified category.
   * @param {string} categoryName to modify.
   * @param {string} name of the princess to add.
   */
  add(categoryName, name) {
    const category = this.getCategory(categoryName);
    category.push(name);
    cli.echoSuccess(`Successfully added [${name}] to category [${category}]`);
  }

  /**
   * Removes specified princess from the category if one exists.
   * @param {string} categoryName to modify
   * @param {string} name of the princess to remove.
   */
  remove(categoryName, name) {
    const category = this.getCategory(categoryName);

    let index = parseInt(name);
    if (isNaN(index)) {
      this.#categoryHasPrincess(category, name);
      index = category.indexOf(name);
    }
    category.splice(index, 1);
    cli.echoWarn(`[${name}] is removed from category [${category}]`);
  }

  /**
   * Changes the princess to have a new name without changing her id.
   * @param {string} categoryName to modify.
   * @param {string} oldName of the princess.
   * @param {string} newName of the princess.
   */
  change(categoryName, oldName, newName) {
    const category = this.getCategory(categoryName);
    this.#categoryHasPrincess(category, oldName);
    category[category.indexOf(oldName)] = newName;
    cli.echoWarn(`[${oldName} is changed to ${newName}]`);
  }
}

// Export as semi-singleton.
export const princessRepo = new PrincessRepo();
