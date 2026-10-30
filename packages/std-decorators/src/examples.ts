import { ExamplesBase, registerExamples } from "@gendev/example-runner";

function shout<This, Args extends unknown[]>(
  value: (this: This, ...args: Args) => string,
) {
  return function (this: This, ...args: Args) {
    return value.call(this, ...args).toUpperCase();
  };
}

function labelled(
  _value: undefined,
  context: ClassFieldDecoratorContext<unknown, string>,
) {
  return (initial: string) => `${String(context.name)}: ${initial}`;
}

function positive(
  { get, set }: ClassAccessorDecoratorTarget<unknown, number>,
  context: ClassAccessorDecoratorContext<unknown, number>,
) {
  return {
    get,
    set(value: number) {
      if (value <= 0) {
        throw new RangeError(`${String(context.name)} must be positive`);
      }
      set.call(this, value);
    },
  };
}

function bound<This extends object, Args extends unknown[], Return>(
  value: (this: This, ...args: Args) => Return,
  context: ClassMethodDecoratorContext<
    This,
    (this: This, ...args: Args) => Return
  >,
) {
  context.addInitializer(function () {
    Object.defineProperty(this, context.name, { value: value.bind(this) });
  });
}

function tag(label: string) {
  return (_value: unknown, context: ClassMethodDecoratorContext) => {
    const tags = (context.metadata.tags ??= []) as string[];
    tags.push(`${String(context.name)}: ${label}`);
  };
}

/**
 * Examples of standard (TC39) decorators: no compiler flag, decorators receive
 * `(value, context)`. Run through `runExamples` from `@gendev/example-runner`.
 */
@registerExamples()
export class StdDecoratorExamples extends ExamplesBase {
  exampleMethod() {
    class Pony {
      @shout
      greet(name: string) {
        return `hello, ${name}`;
      }
    }

    this.log(new Pony().greet("Twilight"));
  }

  exampleField() {
    class Pony {
      @labelled
      name = "Twilight";
    }

    this.log(new Pony().name);
  }

  exampleAccessor() {
    class Pony {
      @positive
      accessor age = 1;
    }

    const pony = new Pony();
    pony.age = 5;
    this.log(`age: ${pony.age}`);
    try {
      pony.age = -1;
    } catch (error) {
      this.log(String(error));
    }
  }

  exampleAddInitializer() {
    class Greeter {
      name = "Twilight";

      @bound
      greet() {
        return `Hello, ${this.name}`;
      }
    }

    const { greet } = new Greeter();
    this.log(greet());
  }

  exampleMetadata() {
    class Tagged {
      @tag("read-only")
      read() {}

      @tag("admin")
      write() {}
    }

    this.log(Tagged[Symbol.metadata]?.tags);
  }
}
