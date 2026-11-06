# princess

A selector CLI for princesses, grouped into categories. It is one application in five layers,
on cli-lib for the command line, inversify for dependency injection, and a JSON file or a
SQLite database for storage.

## Layers

Inside out, in `src/`. An import points inward only; ESLint enforces it per folder.

- `model/` is the domain and imports nothing outside itself: "The model imports nothing outside
  src/model."
  - `princess.ts`, `princessName.ts`, `titles.ts` and `category.ts` are the entities and
    their rules.
  - `events.ts` is the `PrincessEvent` union and `describeEvent`.
  - `errors.ts` holds `DomainError` and its subclasses.
  - `defaults.ts` is the starting set of categories.
- `services/` holds the use cases: "Services import only the model."
  - `ports.ts` declares the interfaces the layers outside depend on (`PrincessRepository`,
    `Logger`, `Random`) and the tokens that name them.
  - `princessService.ts` is the use cases, `history.ts` the events seen so far,
    `eventBus.ts` the channel they travel on, `listeners.ts` the logging subscriber and
    `logged.ts` the method decorator that logs timings.
- `storage/` implements the repository port: "Storage imports only services and the model."
  - `jsonRepository.ts` and `jsonFile.ts` keep one JSON file, checked with zod.
  - `sqliteRepository.ts`, `sqliteTables.ts` and `sqliteMapping.ts` keep two SQLite tables
    through drizzle.
  - `storageError.ts` is the one error for a store that cannot be read.
- `cli/` is the front ends: "The CLI imports only services and the model."
  - `commands.ts` lists the commands, `dialogue.ts` asks the questions, `format.ts` prints a
    princess.
  - `middleware.ts` maps errors to messages and times each command, `executor.ts` builds the
    executor from them.
  - `interactive.ts` and `oneShot.ts` are the two ways to run it.
- `app/` is the composition root and may import everything.
  - `config.ts` reads the environment, `logger.ts` writes to stderr.
  - `container.ts` binds everything; it holds the only `container.get`.
  - `app.ts` loads the store and runs a front end, `main.ts` is the entry point.

## Commands

- `list` or `ls` `[category]` lists categories, or the princesses of one.
- `get` or `g` `<category> <princess>` selects a princess for you.
- `getrnd` or `gr` `[category]` selects a random princess.
- `add` or `a` `<category> <name>` appends a princess and asks for her old name and titles.
- `remove` or `rm` `<category> <princess>` removes a princess after you confirm.
- `change` or `ch` `<category> <princess>` changes her old name and titles after you confirm.
- `history` or `hi` shows what changed in this session.

A category or princess is a name or a prefix of one; a number picks by position. `help` or `h`
comes from cli-lib, and `exit`, `quit` or `q` leave the interactive loop.

## Run

From the repository root, after `pnpm build`:

    pnpm --filter @gendev/princess start

With no arguments it opens the interactive loop. With arguments it runs that one command and
exits:

    pnpm --filter @gendev/princess start get young sunset

`pnpm --filter @gendev/princess dev` rebuilds and restarts on change.

The exit code is 0 when the command is done, 1 when it failed (an unknown princess, an aborted
confirmation, a store that cannot be read, a bad setting) and 2 when it was used wrongly (an
unknown command or the wrong number of words). A filtered `pnpm --filter` run turns 2 into 1
and adds `ELIFECYCLE` lines on stderr. To see the real code run it from the folder, quietly:

    pnpm -s -C apps/princess start get young

At the end of input a prompt reads as an empty answer: `add` goes on without the optional
fields, `remove` and `change` abort with exit code 1.

## Settings

| Variable           | Values                  | Default                         |
| ------------------ | ----------------------- | ------------------------------- |
| `PRINCESS_STORAGE` | `json`, `sqlite`        | `json`                          |
| `PRINCESS_DATA`    | a file path             | `data/princesses.json` or `.db` |
| `LOG_LEVEL`        | `debug`, `info`, `warn` | `warn`                          |

An empty value counts as unset. A bad value stops the app with one line naming the variable and
exit code 1. The default data path is in this package folder; a relative `PRINCESS_DATA`
resolves against the current directory, which is this folder under pnpm. Logs go to stderr.

    PRINCESS_STORAGE=sqlite pnpm --filter @gendev/princess start

## Storage

The folder of the data file is created on the first start, and the file is filled with the
default categories. A category with no princesses stays in the file. A file that is damaged
stops the app with one line naming it.

SQLite runs on better-sqlite3, which ships prebuilt binaries for darwin-arm64, darwin-x64,
linux-arm64, linux-x64, linuxmusl-arm64, linuxmusl-x64, win32-arm64 and win32-x64. On another
platform use `PRINCESS_STORAGE=json`.

## Tests

    pnpm --filter @gendev/princess test

The unit tests use a memory repository and a recording logger in `test/fakes`, and a mock of
the repository for the service. The end-to-end tests in `test/e2e` start `dist/app/main.js`
on both storages, so run `pnpm build` first.
