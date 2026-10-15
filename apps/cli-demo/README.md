# cli-demo

A read-eval loop on top of cli-lib. It runs the default `help` command and its own `quit` and
`q` command, which replace the default exit command.

## Run

From the repository root, after `pnpm build`:

    pnpm --filter @gendev/cli-demo start

`pnpm --filter @gendev/cli-demo dev` rebuilds and restarts on change.
