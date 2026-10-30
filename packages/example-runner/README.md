# example-runner

Registers and runs example classes.

- `ExamplesBase`: base class for an example class. `log(message)` prints a
  string with a vertical bar prefix on every line (anything else goes through
  `util.inspect` first), `separator()` prints a rule.
- `@example(title)`: optional mark on a method. A marked method is an example
  whatever its name, and `title` is what gets printed before it.
- `registerExamples()`: class decorator that turns a class into a list of
  examples: every own method whose name starts with `example`, or that carries
  the mark, in declaration order. Without a mark the title is the name without
  the prefix as a sentence: `exampleAsConst` becomes `As const`.
- `getExamples(cls)`: the list `registerExamples` stored, `[]` for a class that
  was never registered.
- `runExamples(classes)`: creates one instance per class and runs its examples
  in order. Returns `false` when an example threw; the throw is printed and the
  next example still runs.

Output of `runExamples`:

    Demo: 2 examples

    First
     | one

    Second
     | { a: 1 }

A class without examples prints `<name>: no examples`. Classes are separated by
an empty line.
