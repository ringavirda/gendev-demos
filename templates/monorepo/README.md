# monorepo

A pnpm workspace starter with one library and one console app. Make your own copy and run it:

```
pnpm dlx tiged ringavirda/gendev-demos/templates/monorepo my-repo
cd my-repo
pnpm install
pnpm build
pnpm start
```

`pnpm start` prints `Hello, world!`. To pass a name, run the compiled file directly:
`node apps/cli/dist/app.js Ada`.

## Scripts

Run them from the repository root.

- `pnpm dev` runs `apps/cli/src/app.ts` with tsx and restarts it on every change. Build first, the
  app resolves `@repo/greeting` through its built types.
- `pnpm build` builds every workspace with tsc, `packages/greeting` before `apps/cli`.
- `pnpm start` runs `apps/cli/dist/app.js`, so build first.
- `pnpm typecheck` checks the types of every workspace without writing files. Build first.
- `pnpm lint` runs ESLint over the whole repository.
- `pnpm format` formats the repository with Prettier.
- `pnpm test` runs the vitest tests of every workspace once.

pnpm runs a dependency's install script only when pnpm-workspace.yaml allows it; esbuild, which
tsx uses, is allowed there.

## Files

- `package.json` holds the root scripts and the root tooling. `packageManager` pins the pnpm
  version this template was made with, so corepack uses it.
- `pnpm-workspace.yaml` lists the workspaces, the shared versions in `catalog`, and allows the
  esbuild install script.
- `tsconfig.base.json` holds the compiler options every workspace extends.
- `eslint.config.js`, `.editorconfig` and `.prettierignore` are the root lint and format setup.
  Prettier reads the editor settings and skips `dist` and `pnpm-lock.yaml`.
- `.gitignore` keeps `node_modules` and `dist` out of git.
- `packages/greeting` is a library. `src/index.ts` exports `greet`, `src/index.test.ts` holds its
  vitest tests, and its declarations go to `dist`.
- `apps/cli` is a console app that depends on `@repo/greeting` with `workspace:*`. `src/app.ts`
  prints the greeting for the name in the first argument.
