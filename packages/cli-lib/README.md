# cli-lib

Shared pieces for the command line apps in this repo.

## Exports

- `CLI` wraps a readline interface on stdin and stdout. It exits the process
  with status 0 when its input closes: Ctrl+D, the end of a pipe, or a call to
  `close()`.
- `Executor` keeps the command list and runs a command by its selector.
- `JsonLoader` keeps a state object in a JSON file under `dist`.
- Types `Command`, `CommandArgs`, `EchoColors` and `EchoOptions`.

## Default commands

- `help` or `h` lists every command, or shows the help of one: `help exit`.
- `exit`, `quit` or `q` exits the process with status 0.

## Override rule

`registerCommand(command, override)` throws when any selector of the new
command is already registered. With `override` set to `true`, the new command
replaces the registered one.

## Scripts

- `pnpm --filter @gendev/cli-lib build` compiles `src` to `dist`.
- `pnpm --filter @gendev/cli-lib test` runs the vitest suite in `test`.

Run them from the repository root.
