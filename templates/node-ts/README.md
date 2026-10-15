# node-ts

A starter for a Node.js console app written in TypeScript. Make your own copy
and run it:

```
pnpm dlx tiged ringavirda/gendev-demos/templates/node-ts my-app
cd my-app
pnpm install
pnpm build
pnpm start
```

`pnpm start` prints `Hello, world!`. `pnpm start Ada` passes the name, and
`pnpm start -- Ada` passes `--` as the name.

## Scripts

- `pnpm dev` runs `src/app.ts` with tsx and restarts it on every change.
- `pnpm build` compiles `src` into `dist` with tsc.
- `pnpm start` runs `dist/app.js`, so build first.
- `pnpm typecheck` checks the types without writing files.
- `pnpm lint` runs ESLint over the project.
- `pnpm format` formats the project with Prettier.
- `pnpm test` runs the vitest tests once.

pnpm runs a dependency's install script only when pnpm-workspace.yaml allows
it; esbuild, which tsx uses, is allowed there.

## Files

- `package.json` holds the scripts and dependencies. `packageManager` pins the
  pnpm version this template was made with, so corepack uses it.
- `pnpm-workspace.yaml` allows the esbuild install script.
- `tsconfig.json` sets the compiler options and keeps test files out of
  `dist`.
- `eslint.config.js` sets the ESLint rules for JavaScript and TypeScript.
- `.editorconfig` and `.prettierignore` are read by Prettier: 80 columns, two
  spaces, and `dist` and `pnpm-lock.yaml` are skipped.
- `.gitignore` keeps `node_modules` and `dist` out of git.
- `src/greet.ts` exports `greet`, which returns the greeting.
- `src/app.ts` is the entry point; it prints the greeting for the name in the
  first argument.
- `src/greet.test.ts` holds the vitest tests for `greet`.
