import "reflect-metadata";
import { ExamplesBase, registerExamples } from "@gendev/example-runner";

@registerExamples()
export class DecoratorsExamples extends ExamplesBase {
  exampleClassDecorator(): void {
    const sealed = (target: new () => object): void => {
      this.log(`decorator ran for ${target.name}`);
      Object.seal(target);
      Object.seal(target.prototype);
    };

    @sealed
    class Alicorn {
      greet(): string {
        return "an Alicorn greets you";
      }
    }

    this.log("the class is defined, no instance yet");
    this.log(new Alicorn().greet());
    this.log(`sealed: ${Object.isSealed(Alicorn)}`);
  }

  exampleWrappingMethod(): void {
    const logged = (log: (line: string) => void) => {
      return (
        _target: object,
        key: string,
        descriptor: PropertyDescriptor,
      ): void => {
        const original = descriptor.value;

        descriptor.value = function (this: unknown, ...args: unknown[]) {
          log(`calling ${key}(${args.join(", ")})`);
          return original.apply(this, args);
        };
      };
    };

    class Herald {
      @logged((line) => this.log(line))
      announce(princess: string, title: string): string {
        return `${title} ${princess} has arrived`;
      }
    }

    this.log(new Herald().announce("Twilight Sparkle", "Princess"));
  }

  exampleEvaluationOrder(): void {
    const trace = (label: string) => {
      this.log(`factory ${label}`);
      return (_target: object, key: string): void => {
        this.log(`decorator ${label} on ${key}`);
      };
    };

    class Spell {
      @trace("first")
      @trace("second")
      cast(): string {
        return "cast";
      }
    }

    this.log(new Spell().cast());
  }

  exampleMarkingProperty(): void {
    const formatKey = Symbol("format");

    const format = (template: string) => Reflect.metadata(formatKey, template);

    class Pony {
      @format("Element of {}")
      element = "Magic";

      describe(): string {
        const template: string = Reflect.getMetadata(
          formatKey,
          this,
          "element",
        );
        return template.replace("{}", this.element);
      }
    }

    this.log(new Pony().describe());
  }

  exampleDesignMetadata(): void {
    class Pony {
      constructor(public name: string) {}
    }

    const names = (types: readonly { name: string }[]): string =>
      types.map((type) => type.name).join(", ");

    const inspect = (target: object, key: string): void => {
      const type = Reflect.getMetadata("design:type", target, key);
      const params = Reflect.getMetadata("design:paramtypes", target, key);
      const returns = Reflect.getMetadata("design:returntype", target, key);
      this.log(`${key}: ${type.name}(${names(params)}) -> ${returns.name}`);
    };

    const inspectClass = (target: new (...args: never[]) => object): void => {
      const params = Reflect.getMetadata("design:paramtypes", target);
      this.log(`${target.name} constructor: (${names(params)})`);
    };

    @inspectClass
    class Stable {
      constructor(
        public keeper: Pony,
        public stalls: number,
      ) {}

      @inspect
      feed(pony: Pony, hay: number): string {
        return `${pony.name} ate ${hay} bales`;
      }
    }

    this.log(new Stable(new Pony("Applejack"), 4).feed(new Pony("Rarity"), 2));
  }

  exampleMarkAndWrap(): void {
    const requiredKey = Symbol("required");

    interface RequiredMark {
      index: number;
      label: string;
    }

    const required = (label: string) => {
      return (target: object, key: string | symbol, index: number): void => {
        const marks: RequiredMark[] =
          Reflect.getOwnMetadata(requiredKey, target, key) ?? [];
        marks.push({ index, label });
        Reflect.defineMetadata(requiredKey, marks, target, key);
      };
    };

    const validate = (
      target: object,
      key: string,
      descriptor: PropertyDescriptor,
    ): void => {
      const original = descriptor.value;

      descriptor.value = function (this: unknown, ...args: unknown[]) {
        const marks: RequiredMark[] =
          Reflect.getOwnMetadata(requiredKey, target, key) ?? [];
        for (const { index, label } of marks) {
          if (args[index] === undefined) {
            throw new Error(`Missing required argument: ${label}`);
          }
        }
        return original.apply(this, args);
      };
    };

    class Registry {
      @validate
      register(
        @required("name") name?: string,
        element?: string,
        @required("home") home?: string,
      ): string {
        return `${name} (${element}) of ${home}`;
      }
    }

    const registry = new Registry();
    this.log(
      registry.register("Twilight Sparkle", "Magic", "Golden Oak Library"),
    );
    try {
      registry.register("Rarity", "Generosity");
    } catch (error) {
      this.log(String(error));
    }
  }
}
