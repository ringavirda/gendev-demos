# ts7

The same small TypeScript source compiled by TypeScript 7 (the native compiler, `tsc`) and by
TypeScript 6 (`tsc6`, from `@typescript/typescript6`), side by side in one workspace. The rest of
the repo stays on TypeScript 6; this workspace is the record of how 7 diverges from it.

Build the repo first (`pnpm build` from the root); `compare` checks `packages/ts-examples`.

## Commands

From the repo root:

    pnpm --filter @gendev/ts7 build       compile src with tsc 7 into dist/
    pnpm --filter @gendev/ts7 build:6     compile the same src with tsc6 into dist6/
    pnpm --filter @gendev/ts7 start       run dist/app.js
    pnpm --filter @gendev/ts7 typecheck   tsc 7 --noEmit
    pnpm --filter @gendev/ts7 compare     time --noEmit checks of both compilers
    pnpm --filter @gendev/ts7 legacy:6    tsconfig.legacy.json under tsc6: accepted
    pnpm --filter @gendev/ts7 legacy:7    tsconfig.legacy.json under tsc 7: rejected

`pnpm -r build` runs only `build`, so the repo build uses TypeScript 7 here. `dist/` and `dist6/`
print the same output from `start`.

`compare` runs `scripts/compare.js`. It takes `--runs N` (default 5) and an optional project
path (default `../../packages/ts-examples`), does one warm-up check, then times N `--noEmit`
checks per compiler and prints the versions, each run, the medians and their ratio. Timings
depend on the machine, so none are recorded here.

## What changes for a project

TypeScript 7.0 does not ship the compiler API. Its main entry exports only the version, and the
API that exists is under `typescript/unstable/*`; it is not the API typescript-eslint 8 uses.
7.1 is expected to bring a new, different API. Until then tools that need the compiler API run on
6.0 through `@typescript/typescript6`, which provides `tsc6` and re-exports the 6.0 API, so `tsc`
7 and 6.0 can sit side by side (this workspace does that).
typescript-eslint 8.71 peers `typescript` `<6.1.0`, so 7 cannot be linted yet. That is why the
repo stays on 6 and this workspace is outside the root lint (`apps/ts7/` is in the ignores of
`eslint.config.js`).
Checked against https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/ and the
`typescript` 7.0.2 package.

Defaults that changed in 6.0 and that 7.0 adopts:

- `strict` is true.
- `module` is `esnext`.
- `target` is the current stable ECMAScript version before `esnext`.
- `noUncheckedSideEffectImports` is true.
- `libReplacement` is false.
- `stableTypeOrdering` is true and cannot be turned off.
- `rootDir` is the directory of the tsconfig, so a project with sources in `src` sets
  `"rootDir": "src"` or its output lands in `dist/src`.
- `types` is `[]`, so `@types/node` must be listed, as in `"types": ["node"]`; `["*"]` restores
  the old behavior.

Checked against https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/ and
https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/. `tsconfig.json` here
extends nothing and sets `rootDir` and `types` itself.

Options deprecated in 6.0 (silenced there with `"ignoreDeprecations": "6.0"`) and hard errors in
7.0:

- `target: es5`
- `downlevelIteration`
- `moduleResolution` `node` / `node10` and `classic`
- `module` `amd`, `umd`, `systemjs`, `none`
- `baseUrl`
- `esModuleInterop` and `allowSyntheticDefaultImports` set to false
- `alwaysStrict` set to false

Checked against https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/ and
https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/.

`tsconfig.legacy.json` extends `tsconfig.json` and sets three of them: `baseUrl`,
`downlevelIteration` and `esModuleInterop: false`. `pnpm --filter @gendev/ts7 legacy:6` exits 0.
`legacy:7` prints, and exits 1:

    tsconfig.legacy.json(5,5): error TS5102: Option 'baseUrl' has been removed. Please remove it from your configuration.
      Use '"paths": {"*": ["./*"]}' instead.
    tsconfig.legacy.json(6,5): error TS5102: Option 'downlevelIteration' has been removed. Please remove it from your configuration.
    tsconfig.legacy.json(7,24): error TS5108: Option 'esModuleInterop=false' has been removed. Please remove it from your configuration.
