# princess

A selector CLI for princesses, grouped into categories. It runs on cli-lib, with tsyringe for
dependency injection.

## Layers

- `src/models/princess.ts` holds the `Princess` type and the default categories.
- `src/services/repository.ts` reads and changes the categories and saves them through `JsonLoader`.
- `src/services/commands.ts` builds the command list that `app.ts` registers.
- `src/utils.ts` prints a princess and asks for the fields of a new or changed one.
- `src/app.ts` overrides `exit`, loads the state and runs the loop.

## Commands

- `list` or `ls` lists categories and princesses.
- `get` or `g` selects a princess for you.
- `getrnd` or `gr` selects a random princess.
- `add` or `a` appends a princess to a category.
- `remove` or `rm` removes a princess from a category.
- `change` or `ch` changes the names of a princess.

`help` or `h` comes from cli-lib. `exit`, `quit` or `q` replaces cli-lib's default in `app.ts` and prints a goodbye line before it exits.

## Run

From the repository root, after `pnpm build`:

    pnpm --filter @gendev/princess start

`pnpm --filter @gendev/princess dev` rebuilds and restarts on change.

The state lives in `packages/cli-lib/dist/data/data/db.json`, created on the first start.
`pnpm clean` removes it along with the other build output.
