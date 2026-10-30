# std-decorators

Standard (TC39) decorators in TypeScript, as a small library built on its own:
this package has neither `experimentalDecorators` nor `emitDecoratorMetadata`.
The rest of the workspace uses the legacy form; compare the two.

- `package.json`: `exports` points `types` and `default` at `dist/`, `files`
  publishes only `dist`, and `@gendev/example-runner` is a `workspace:*`
  dependency.
- `tsconfig.json`: extends the base config, emits `declaration` and
  `declarationMap` files, and adds `esnext.decorators` to `lib`; without it
  `context.metadata` does not type-check.
- `dist/`: what `tsc` writes from `src/`: `.js`, `.d.ts` and `.d.ts.map` files.
  It is not committed.
- `src/metadata.ts`: defines `Symbol.metadata` when Node lacks it. Decorator
  metadata is stored under that symbol.
- `src/examples.ts`: `StdDecoratorExamples`, five examples: a method decorator
  that replaces the method, a field decorator that returns an initializer, an
  `accessor` decorator that returns `get` and `set`, `addInitializer` binding a
  method so a detached call works, and decorators writing `context.metadata`
  that the example reads back from `Class[Symbol.metadata]`.
- `src/index.ts`: imports `metadata.ts` first, then exports
  `StdDecoratorExamples`.

Standard decorators have no parameter decorators. A decorator receives
`(value, context)`, so the runner's `@example` (a legacy
`(target, key, descriptor)` decorator) cannot be used here; the examples are
found by their `example` name prefix.

Build the package before using it, since `exports` points into `dist/`:
`pnpm --filter <app>... build`.

Use from another workspace package: add `"@gendev/std-decorators":
"workspace:*"`, then `import { StdDecoratorExamples } from
"@gendev/std-decorators"` and pass it to `runExamples`.
