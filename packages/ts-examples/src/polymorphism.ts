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
      new Pegasus("Rainbow Dash"),
      new Alicorn("Twilight Sparkle"),
      new Dragon("Spike"),
      new Flier("Fluttershy"),
    ];

    for (const flier of fliers) this.log(flier.fly());
  }

  exampleOverloads() {
    function describe(name: string): string;
    function describe(name: string, surname: string): string;
    function describe(name: string, surname?: string) {
      return surname ? `${surname} ${name}` : name;
    }

    this.log(describe("Celestia"));
    this.log(describe("Sparkle", "Twilight"));
    // @ts-expect-error: no signature takes three strings
    this.log(describe("Sparkle", "Twilight", "Princess"));
  }

  exampleGenerics() {
    interface Pegasus {
      weather: string;
    }

    interface Unicorn {
      spell: string;
    }

    const last = <T>(items: readonly T[]) => items[items.length - 1];

    const pegasus: Pegasus = last([{ weather: "rain" }, { weather: "snow" }]);
    const unicorn: Unicorn = last([{ spell: "levitation" }, { spell: "teleport" }]);

    this.log(pegasus.weather);
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
