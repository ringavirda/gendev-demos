# cli-demo

A read-eval loop on top of cli-lib, built with `new` and no container. It runs the default `help`
command and stops at `quit`, `q` or the end of the input.

## Run

From the repository root, after `pnpm build`:

    pnpm --filter @gendev/cli-demo start

`pnpm --filter @gendev/cli-demo dev` rebuilds and restarts on change.
