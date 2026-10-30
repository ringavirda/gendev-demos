# ts-examples

TypeScript examples, one class per topic. Every method whose name starts with
`example` is one example; `@gendev/ts-tour` runs them.

- `typing.ts` (`TypingExamples`): inference, interfaces and types,
  declaration merging, literal unions, `as const`, `typeof` and `keyof`.
- `narrowing.ts` (`NarrowingExamples`): `typeof`, `in` and `instanceof`,
  discriminated unions, `unknown` and `any`, type guards, `satisfies`.
- `generics.ts` (`GenericExamples`): generic functions, constraints, a generic
  container, utility types.
- `paradigms.ts` (`ParadigmsExamples`): the same task written procedurally,
  object-oriented and functionally.
- `classes.ts` (`ClassExamples`): constructors, access modifiers, readonly and
  parameter properties, accessors, static members.
- `inheritance.ts` (`InheritanceExamples`): `extends`, a single parent,
  interfaces, abstract classes, composition.
- `polymorphism.ts` (`PolymorphismExamples`): overriding, overloads, generics,
  structural typing.
- `linkedList.ts` (`LinkedList`) and `linkedListExamples.ts`
  (`LinkedListExamples`): a generic linked list and its examples.
- `decorators.ts` (`DecoratorsExamples`): class, method, field and parameter
  decorators, evaluation order, design metadata.
- `typeLevel.ts` (`TypeLevelExamples`): mapped types, key remapping,
  conditional types, `infer`, template literal types, indexed lookup.

The standard decorators example, `StdDecoratorExamples`, lives in
`packages/std-decorators`.

The package turns on `experimentalDecorators` because the examples use the
legacy decorators: the legacy method signature and parameter decorators, which
the standard decorators lack. The `reflect-metadata` calls work without
`emitDecoratorMetadata`.
