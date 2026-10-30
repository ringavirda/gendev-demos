import { ExamplesBase, registerExamples } from "@gendev/example-runner";

@registerExamples()
export class ClassExamples extends ExamplesBase {
  exampleConstructor() {
    class Princess {
      name: string;
      surname: string;

      constructor(raw: string) {
        const [surname, name] = raw.trim().split(" ");
        this.name = name;
        this.surname = surname;
      }

      fullName() {
        return `${this.surname} ${this.name}`;
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
        readonly surname: string,
        public title: string,
      ) {}
    }

    const princess = new Princess("Sparkle", "Twilight", "Student");

    // @ts-expect-error: name is readonly
    princess.name = "Twily";
    princess.title = "Princess";
    this.log(princess.title);
    this.log(`name after the readonly assignment: ${princess.name}`);
  }

  exampleAccessors() {
    class Princess {
      #rank = 1;

      get rank() {
        return this.#rank;
      }

      set rank(value: number) {
        if (value < 0) {
          throw new RangeError(`Rank ${value} is negative`);
        }
        this.#rank = value;
      }
    }

    const princess = new Princess();
    princess.rank = 12;
    this.log(princess.rank);

    try {
      princess.rank = -1;
    } catch (error) {
      this.log(String(error));
    }
  }

  exampleStatic() {
    class Pony {
      static count = 0;

      static fromString(raw: string) {
        const [surname, name] = raw.split(" ");
        return new Pony(name, surname);
      }

      constructor(
        readonly name: string,
        readonly surname: string,
      ) {
        Pony.count++;
      }
    }

    new Pony("Pinkie", "Pie");
    const twilight = Pony.fromString("Twilight Sparkle");

    this.log(twilight);
    this.log(`created: ${Pony.count}`);
  }
}
