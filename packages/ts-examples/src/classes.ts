import { ExamplesBase, registerExamples } from "@gendev/example-runner";

@registerExamples()
export class ClassExamples extends ExamplesBase {
  exampleConstructor() {
    class Princess {
      name: string;
      surname: string;

      constructor(raw: string) {
        const [name, surname] = raw.trim().split(" ");
        this.name = name;
        this.surname = surname;
      }

      fullName() {
        return `${this.name} ${this.surname}`;
      }
    }

    const princess = new Princess("Twilight Sparkle");

    this.log(princess);
    this.log(princess.fullName());
  }

  exampleAccessModifiers() {
    class Princess {
      private rank = 12;
      protected element = "magic";
      #secret = "friendship";

      reveal() {
        return `${this.rank} ${this.element} ${this.#secret}`;
      }
    }

    const princess = new Princess();

    this.log(princess.reveal());
    // @ts-expect-error: rank is private to the class
    this.log(princess.rank);
    this.log(JSON.stringify(princess));
  }

  exampleReadonlyAndParameterProperties() {
    class Princess {
      constructor(
        readonly name: string,
        public surname: string,
      ) {}
    }

    const princess = new Princess("Twilight", "Sparkle");

    // @ts-expect-error: name is readonly
    princess.name = "Cadance";
    princess.surname = "Velvet";
    this.log(princess.surname);
    this.log(`name after the readonly assignment: ${princess.name}`);
  }

  exampleAccessors() {
    class Princess {
      #rank = 1;

      get rank() {
        return this.#rank;
      }

      set rank(value: number) {
        if (value < 1 || value > 12) {
          throw new RangeError(`Rank ${value} is outside 1..12`);
        }
        this.#rank = value;
      }
    }

    const princess = new Princess();
    princess.rank = 12;
    this.log(princess.rank);

    try {
      princess.rank = 13;
    } catch (error) {
      this.log(String(error));
    }
  }

  exampleStatic() {
    class Princess {
      static count = 0;

      static fromString(raw: string) {
        const [name, surname] = raw.split(" ");
        return new Princess(name, surname);
      }

      constructor(
        readonly name: string,
        readonly surname: string,
      ) {
        Princess.count++;
      }
    }

    new Princess("Celestia", "Solaris");
    const twilight = Princess.fromString("Twilight Sparkle");

    this.log(twilight);
    this.log(`created: ${Princess.count}`);
  }
}
