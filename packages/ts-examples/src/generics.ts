import { ExamplesBase, registerExamples } from "@gendev/example-runner";

@registerExamples()
export class GenericExamples extends ExamplesBase {
  exampleFunctions() {
    const first = <T>(items: readonly T[]): T | undefined => items[0];

    this.log(first([3, 1, 2]));
    this.log(first(["Twilight", "Spike"]));
    this.log(first<string | number>([]));
  }

  exampleConstraints() {
    const longest = <T extends { length: number }>(a: T, b: T): T =>
      a.length >= b.length ? a : b;

    this.log(longest("Luna", "Celestia"));
    this.log(longest([1, 2, 3], [4]));

    const pluck = <T, K extends keyof T>(object: T, key: K): T[K] =>
      object[key];

    const twilight = { name: "Twilight", powerRank: 12 };
    this.log(pluck(twilight, "powerRank"));
    // @ts-expect-error: "age" is not a key of twilight
    this.log(pluck(twilight, "age"));

    interface Box<T = string> {
      value: T;
    }

    const name: Box = { value: "Twilight" };
    const rank: Box<number> = { value: 12 };
    this.log([name, rank]);
  }

  exampleContainer() {
    class Container<T> {
      private readonly items: T[];

      constructor(...items: T[]) {
        this.items = items;
      }

      get(index: number): T | undefined {
        return this.items[index];
      }

      add(item: T): void;
      add(index: number, item: T): void;
      add(...args: [T] | [number, T]): void {
        if (args.length === 2) this.items.splice(args[0], 0, args[1]);
        else this.items.push(args[0]);
      }

      removeAt(index: number): boolean {
        if (index < 0 || index >= this.items.length) return false;
        this.items.splice(index, 1);
        return true;
      }

      remove(item: T): boolean {
        const index = this.items.indexOf(item);
        return this.removeAt(index);
      }

      toString(): string {
        return `[ ${this.items.join(", ")} ]`;
      }
    }

    const ponies = new Container("Twilight", "Rarity");
    ponies.add("Spike");
    ponies.add(0, "Celestia");
    this.log(`${ponies}`);
    ponies.remove("Rarity");
    ponies.removeAt(0);
    this.log(`${ponies}`);

    this.separator();

    const numbers = new Container(...Array(5).keys());
    this.log(`get(2): ${numbers.get(2)}`);
    this.log(`${numbers}`);
  }

  exampleUtilityTypes() {
    interface Princess {
      name: string;
      surname: string;
      powerRank: number;
    }

    const twilight: Princess = {
      name: "Twilight",
      surname: "Sparkle",
      powerRank: 12,
    };

    const update = (princess: Princess, changes: Partial<Princess>) => ({
      ...princess,
      ...changes,
    });

    this.log(update(twilight, { powerRank: 13 }));

    const label: Pick<Princess, "name" | "surname"> = twilight;
    const anonymous: Omit<Princess, "name"> = twilight;
    this.log([label.name, anonymous.powerRank]);

    const aspects: Record<"day" | "night", Princess> = {
      day: { name: "Celestia", surname: "Sol", powerRank: 15 },
      night: { name: "Luna", surname: "Selene", powerRank: 14 },
    };
    this.log(aspects.night);

    const locked: Readonly<Princess> = twilight;
    // @ts-expect-error: locked is readonly
    locked.powerRank = 0;
  }
}
