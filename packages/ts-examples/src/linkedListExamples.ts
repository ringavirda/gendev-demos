import { ExamplesBase, registerExamples } from "@gendev/example-runner";

import { LinkedList } from "./linkedList.js";

@registerExamples()
export class LinkedListExamples extends ExamplesBase {
  exampleBuild(): void {
    const list = new LinkedList<string>();

    list.addLast("Twilight");
    list.addLast("Rarity");
    list.addFirst("Celestia");
    this.log(`after adding: ${[...list].join(", ")}`);

    list.insert(1, "Luna", "Cadance");
    this.log(`after insert: ${[...list].join(", ")}`);

    list.set(0, "Princess Celestia");
    this.log(
      `first: ${list.first()}, last: ${list.last()}, size: ${list.size}`,
    );
    this.log(`at(2): ${list.at(2)}, at(9): ${list.at(9)}`);

    this.log(`removeAt(1): ${list.removeAt(1)}`);
    this.log(`remove("Rarity"): ${list.remove("Rarity")}`);
    this.log(`remove("Applejack"): ${list.remove("Applejack")}`);
    this.log(`left: ${[...list].join(", ")}`);

    try {
      list.insert(10, "Starlight");
    } catch (error) {
      this.log(String(error));
    }

    list.clear();
    this.log(`after clear: size ${list.size}, first ${list.first()}`);
  }

  exampleIteration(): void {
    const list = new LinkedList(["Twilight", "Rarity", "Fluttershy"]);

    for (const name of list) {
      this.log(`for...of: ${name}`);
    }

    this.log(`spread: ${[...list].join(", ")}`);
    this.log(
      `Array.from: ${Array.from(list, (name) => name.length).join(", ")}`,
    );

    const [first, second] = list;
    this.log(`destructuring: ${first}, ${second}`);
  }

  exampleClone(): void {
    const original = new LinkedList(new Set(["Applejack", "Rainbow Dash"]));
    const copy = original.clone();

    copy.addLast("Pinkie Pie");
    original.set(0, "Applejack Apple");

    this.log(`original: ${[...original].join(", ")}`);
    this.log(`copy: ${[...copy].join(", ")}`);
    this.log(`found: ${copy.find((name) => name.startsWith("Pinkie"))}`);
  }
}
