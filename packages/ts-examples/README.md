# ts-examples

TypeScript examples, one class per topic. Every method whose name starts with
`example` is one example; `@gendev/ts-tour` runs them.

- `classes.ts` (`ClassExamples`): constructors, inheritance, polymorphism,
  interfaces against the diamond problem, abstract classes.
- `typing.ts` (`TypingExamples`): interfaces, types, `as const`, `typeof` and
  `keyof`, meta types.
- `generics.ts` (`GenericExamples`): generic classes with overloaded constructors, constraints.
- `decorators.ts` (`DecoratorsExamples`): class, method, field and parameter
  decorators.
- `linkedList.ts` (`LinkedListExamples`): a generic linked list and its nodes.

The package turns on `experimentalDecorators` and `emitDecoratorMetadata`
because the examples use the legacy decorators, parameter decorators included,
and reflect metadata. The standard decorators have no parameter decorators.
