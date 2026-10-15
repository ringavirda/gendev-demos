# ts-tour

Runs the TypeScript examples from `@gendev/ts-examples` by topic.

Topics: `classes`, `typing`, `generics`, `decorators`, `linked-list` and `all`.

From the repository root, build first:

    pnpm build
    pnpm --filter @gendev/ts-tour start generics
    pnpm --filter @gendev/ts-tour start classes typing
    pnpm --filter @gendev/ts-tour start all

Several topics run in the order given. Without an argument the app prints the
topic list; an unknown topic is reported on stderr and exits with code 1.

`pnpm --filter @gendev/ts-tour dev` rebuilds and restarts on every change.
