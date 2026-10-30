# gendev-demos

Small examples for the GenDev course, one topic each, in one pnpm workspace.
The two web projects are in their own repositories:

- webdev-retro: https://github.com/ringavirda/webdev-retro
- waifu-picker: https://github.com/ringavirda/request-response

## Requirements

- Node.js 24. The `.nvmrc` file names the version.
- pnpm. On Node 24, run `corepack enable` once and the pinned version is
  used. Or run `npm install -g pnpm`. Node 25 and later no longer ship
  corepack, so use `npm install -g pnpm` there.

## Quick start

    pnpm install
    pnpm build
    pnpm --filter @gendev/ts-tour start generics

Some apps run the compiled output in `dist`, so run `pnpm build` before
starting them.

## Layout

- `apps/` holds the programs you run.
- `packages/` holds code that the apps share.
- `templates/` holds starter projects that you copy.

Run one workspace with `pnpm --filter @gendev/<name> <script>`. The name is
the folder name with the `@gendev` scope in front. Each folder has a README
with its own commands.

## Topics

### Projects, package managers, monorepo and TypeScript setup

Root workspace and `packages/ts-examples` (typing examples).

    pnpm --filter @gendev/ts-tour start typing

### TypeScript 7

`apps/ts7` compiles the same source with TypeScript 7 and TypeScript 6.

    pnpm --filter @gendev/ts7 start
    pnpm --filter @gendev/ts7 compare

`compare` times the two compilers on `packages/ts-examples`.

### Node packages, CLI and events vs async

`apps/node-console` holds nine examples, each started by name; the readline,
emitter and fs pairs share a file. Without a name it prints the list.

    pnpm --filter @gendev/node-console start
    pnpm --filter @gendev/node-console start readline-question
    pnpm --filter @gendev/cli-demo start

These examples do the same job in two styles:

- stdin-events and readline-question
- readline-events and readline-for-await
- emitter-events and emitter-promise
- fs-callbacks and fs-promises

`packages/cli-lib` holds the command line code that `apps/cli-demo` and
`apps/princess` use.

### TypeScript, OOP and metaprogramming

`packages/ts-examples` has the examples, one class per topic, and
`packages/std-decorators` has the standard decorators. `ts-tour` runs them:
`typing`, `narrowing`, `generics`, `paradigms`, `classes`, `inheritance`,
`polymorphism`, `linked-list`, `decorators`, `std-decorators` and `type-level`.
`packages/example-runner` registers and runs the example classes.

    pnpm --filter @gendev/ts-tour start narrowing
    pnpm --filter @gendev/ts-tour start classes inheritance
    pnpm --filter @gendev/ts-tour start std-decorators

`ts-tour` takes one or more topics and runs them in the order given. `all`
runs every topic.

### App structure, patterns and DI

`apps/princess` is a selector CLI with layers and dependency injection.

    pnpm --filter @gendev/princess start

## Templates

The starter projects in `templates/` are copied with tiged:

    pnpm dlx tiged ringavirda/gendev-demos/templates/node-ts my-app
    pnpm dlx tiged ringavirda/gendev-demos/templates/monorepo my-repo

`node-ts` is one Node.js console app in TypeScript. `monorepo` is a pnpm
workspace with a library and a console app.

[templates/README.md](templates/README.md) says what you need installed, how
to get a copy and what to try in each one.

## Root scripts

- `pnpm build` builds every TypeScript workspace with tsc.
- `pnpm typecheck` checks the types of every TypeScript workspace.
- `pnpm lint` runs ESLint over the repository.
- `pnpm test` runs the vitest tests of every workspace.
- `pnpm format` formats the repository with Prettier.
- `pnpm dev` runs the dev script of every package in `packages/`.
- `pnpm clean` removes the `dist` folders.

## Tooling

ESLint with typescript-eslint, Prettier, TypeScript and vitest. The CI
workflow in `.github/workflows/ci.yml` runs lint, build, typecheck and test,
and builds and checks both templates.

`.vscode/launch.json` has a debug configuration for every app (Run and Debug,
F5), and `.vscode/tasks.json` builds, starts and tests them from Terminal >
Run Task. The node-console and ts-tour entries ask which example or topic to
run.
