# ts-tour

Runs the TypeScript examples from `@gendev/ts-examples` by topic.

Topics, in the order `all` runs them: `typing`, `narrowing`, `generics`,
`paradigms`, `classes`, `inheritance`, `polymorphism`, `linked-list`,
`decorators`, `std-decorators` (from `@gendev/std-decorators`), `type-level`
and `all`.

From the repository root, build first:

    pnpm build
    pnpm --filter @gendev/ts-tour start generics
    pnpm --filter @gendev/ts-tour start classes typing
    pnpm --filter @gendev/ts-tour start all

Several topics run in the order given. Without an argument the app prints the
topic list; an unknown topic is reported on stderr and exits with code 1, and so
does a run in which an example threw.

`pnpm --filter @gendev/ts-tour dev` rebuilds and restarts on every change, running all topics.
