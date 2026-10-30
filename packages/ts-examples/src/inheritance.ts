import { ExamplesBase, registerExamples } from "@gendev/example-runner";

@registerExamples()
export class InheritanceExamples extends ExamplesBase {
  exampleExtends() {
    class Pony {
      constructor(protected name: string) {}

      greet() {
        return `${this.name} says hello`;
      }
    }

    class Pegasus extends Pony {
      constructor(
        name: string,
        private wingspan: number,
      ) {
        super(name);
      }

      override greet() {
        return `${super.greet()} and spreads ${this.wingspan} m of wings`;
      }
    }

    this.log(new Pony("Applejack").greet());
    this.log(new Pegasus("Rainbow", 2).greet());
  }

  exampleSingleParent() {
    class Pegasus {
      fly() {
        return "flies";
      }
    }

    class Unicorn {
      cast() {
        return "casts";
      }
    }

    // class Alicorn extends Pegasus, Unicorn {}
    class Alicorn extends Pegasus {}

    const alicorn = new Alicorn();

    this.log(`alicorn.fly: ${alicorn.fly()}`);
    // @ts-expect-error: Alicorn has one parent and cast lives on Unicorn
    this.log(`alicorn.cast at runtime: ${alicorn.cast}`);
    this.log(`unicorn.cast: ${new Unicorn().cast()}`);
  }

  exampleInterfaces() {
    class Pony {
      constructor(readonly name: string) {}
    }

    interface Flier {
      fly(): string;
    }

    interface Caster {
      cast(): string;
    }

    class Alicorn extends Pony implements Flier, Caster {
      fly() {
        return `${this.name} flies`;
      }

      cast() {
        return `${this.name} casts`;
      }
    }

    const alicorn = new Alicorn("Twilight");
    const flier: Flier = alicorn;
    const caster: Caster = alicorn;

    this.log(flier.fly());
    this.log(caster.cast());
  }

  exampleAbstract() {
    abstract class Pony {
      constructor(protected name: string) {}

      abstract speak(): string;

      introduce() {
        return `${this.name}: ${this.speak()}`;
      }
    }

    class EarthPony extends Pony {
      speak() {
        return "Let us party!";
      }
    }

    // @ts-expect-error: an abstract class cannot be instantiated
    new Pony("Nobody");

    this.log(new EarthPony("Pinkie").introduce());
  }

  exampleComposition() {
    class Wings {
      flap() {
        return "flaps her wings";
      }
    }

    class Horn {
      glow() {
        return "glows";
      }
    }

    class Alicorn {
      private wings = new Wings();
      private horn = new Horn();

      constructor(private name: string) {}

      fly() {
        return `${this.name} ${this.wings.flap()}`;
      }

      cast() {
        return `${this.name}'s horn ${this.horn.glow()}`;
      }
    }

    const alicorn = new Alicorn("Twilight");

    this.log(alicorn.fly());
    this.log(alicorn.cast());
  }
}
