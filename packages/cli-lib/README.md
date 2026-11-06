# cli-lib

Shared pieces for the command line apps in this repo. It has no container and no global state: an
app builds a `CLI` and an `Executor` with `new` and passes them where they are needed.

## Exports

- `CLI` wraps a readline interface over an input and two output streams (stdin, stdout and
  stderr by default). `read(prompt)` resolves the next line, or `null` at the end of input, after
  `close()` and after Ctrl+C. `echo`, `echoSuccess`, `echoWarn` and `echoTitle` print to the output;
  `echoError` prints to the error stream. `close()` is safe to call twice.
- `Executor` keeps the command list and runs a line of input through its middleware into a command.
- `checkArguments` and `UsageError`: the middleware that compares the word count with the params.
- Types `Command`, `Output`, `CommandContext`, `Middleware`, `CommandStatus`, `EchoColors` and
  `EchoOptions`.

## Commands

A command has `selectors`, `params`, a `description` and an `action`. A trailing `?` on a param
marks it optional; the help shows params as `<a> [b]`. `help` or `h` lists every command, or one
command with its `help` lines: `help add`. There is no quit command: quitting is the loop of the
app, which stops when `read` gives `null` or a quit word.

## Execute

`execute(line)` returns a status and never throws:

- `empty`: the line was blank, nothing is printed.
- `unknown`: no command holds the first word; it is printed and no middleware runs.
- `usage`: a `UsageError` left the pipeline.
- `failed`: any other error left the pipeline.
- `ok`: the pipeline finished; a middleware that handles an error itself sets
  `context.status` to `usage` or `failed` instead.

The middleware run in the order of `use`, the first one outermost, and the action innermost.

## Override rule

`registerCommand(command, override)` throws when any selector of the new command is already
registered. With `override` set to `true`, the new command replaces the registered one in place.

## Without a container

`apps/cli-demo` is the smallest use: `new CLI()`, `new Executor(cli)`, `use(checkArguments)` and a
loop of `read`.

## Scripts

- `pnpm --filter @gendev/cli-lib build` compiles `src` to `dist`.
- `pnpm --filter @gendev/cli-lib test` runs the vitest suite in `test`.

Run them from the repository root.
