# example-runner

Registers and runs example classes.

- `ExamplesBase`: base class for an example class. `log(message)` prints a
  string with a vertical bar prefix on every line (non-strings get it on the
  first line only), `separator()` prints a rule.
- `registerExamples()`: class decorator that collects every method whose name
  starts with `example`.
- `exampleRun(display)`: method decorator; `exampleRun(false)` keeps an example
  in the list but skips it.
- `runExamples(classes)`: runs every example of each class in order and prints
  the class name and the example names.
