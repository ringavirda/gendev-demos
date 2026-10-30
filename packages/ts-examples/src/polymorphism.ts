import { ExamplesBase, registerExamples } from "@gendev/example-runner";

@registerExamples()
export class PolymorphismExamples extends ExamplesBase {
  exampleOverriding() {
    class Flier {
      constructor(protected name: string) {}

      fly() {
        return `${this.name} flaps`;
      }
    }

    class Pegasus extends Flier {
      override fly() {
        return `${this.name} flaps her wings`;
      }
    }

    class Alicorn extends Flier {
      override fly() {
        return `${this.name} glides on magic`;
      }
    }

    class Dragon extends Flier {
      override fly() {
        return `${this.name} soars on hot air`;
      }
    }

    const fliers: Flier[] = [
      new Pegasus("Rainbow"),
      new Alicorn("Twilight"),
      new Dragon("Spike"),
      new Flier("Pinkie"),
    ];

    for (const flier of fliers) this.log(flier.fly());
  }

  exampleOverloads() {
    function describe(value: string): string;
    function describe(value: number, unit: string): string;
    function describe(value: string | number, unit?: string) {
      return typeof value === "string" ? value : `${value} ${unit}`;
    }

    this.log(describe("Twilight"));
    this.log(describe(12, "points"));
    // @ts-expect-error: no signature takes two strings
    this.log(describe("Twilight", "Sparkle"));
  }

  exampleGenerics() {
    interface Pegasus {
      wingspan: number;
    }

    interface Unicorn {
      spell: string;
    }

    const last = <T>(items: readonly T[]) => items[items.length - 1];

    const pegasus: Pegasus = last([{ wingspan: 2 }, { wingspan: 3 }]);
    const unicorn: Unicorn = last([{ spell: "light" }, { spell: "teleport" }]);

    this.log(pegasus.wingspan);
    this.log(unicorn.spell);
  }

  exampleStructuralTyping() {
    class Pony {
      constructor(public name: string) {}
    }

    class Guarded {
      private secret = "key";
      constructor(public name: string) {}
    }

    const greet = (pony: Pony) => `Hello, ${pony.name}`;
    const greetGuarded = (pony: Guarded) => `Hello, ${pony.name}`;

    this.log(greet({ name: "Spike" }));
    // @ts-expect-error: a private member makes the class nominal
    this.log(greetGuarded({ name: "Spike", secret: "key" }));
    this.log(greetGuarded(new Guarded("Luna")));
  }
}
