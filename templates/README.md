# Templates

Starters for your own projects. Each folder is a complete project on its own:

- [node-ts](node-ts) - one Node.js console app in TypeScript.
- [monorepo](monorepo) - a pnpm workspace with a library and an app that
  uses it.

## What you need

- Node.js 24 (LTS) from https://nodejs.org. Check with `node -v`.
- pnpm. Install it once with `npm install -g pnpm`, then check with
  `pnpm -v`. On Node 24 `corepack enable pnpm` works too (on Windows, in a
  terminal run as administrator).
- git, to keep your copy under version control.

On Windows, PowerShell may refuse to run `npm` or `pnpm` with "running
scripts is disabled on this system". Allow it once for your user:

```
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

or use Command Prompt or Git Bash instead.

## Get a copy

You do not need the whole gendev-demos repository. tiged downloads one folder
of a GitHub repository, without its git history:

```
pnpm dlx tiged ringavirda/gendev-demos/templates/node-ts my-app
pnpm dlx tiged ringavirda/gendev-demos/templates/monorepo my-repo
```

The last argument is the folder to create. `npx tiged ...` does the same
without pnpm.

If you cloned the whole repository for the other examples, copy the template
folder out of it before you start working in it.

Then follow the README inside your copy: `pnpm install`, `pnpm build`,
`pnpm start`, and the other scripts it lists.

## Things to try

In node-ts:

- Read `package.json`: which scripts exist, what is a dependency and what is
  a dev dependency, and why.
- After `pnpm install`, open `pnpm-lock.yaml` and find the exact version of
  chalk that was installed. Compare it with the range in `package.json`.
- Compare `ls node_modules` with `ls node_modules/.pnpm`. Only your direct
  dependencies sit at the top; `pnpm why esbuild` shows where the rest came
  from.
- Run `pnpm build` and compare `src/greet.ts` with `dist/greet.js`.
- In `src/app.ts`, change `greet(name)` to `greet(42)`. `pnpm typecheck`
  fails, but `pnpm dev` still runs it: tsx removes the types without
  checking them.
- Add a test to `src/greet.test.ts` and run `pnpm test`.
- `git init`, then commit. Check what `.gitignore` keeps out, and commit the
  lockfile.

In monorepo:

- Find where `apps/cli` gets `@repo/greeting` from: look at
  `apps/cli/package.json` and `apps/cli/node_modules/@repo`.
- Find where the TypeScript version is written once for every workspace
  (`catalog` in `pnpm-workspace.yaml`).
- Change the greeting in `packages/greeting/src/index.ts`, then
  `pnpm build` and `pnpm start`.
- After `pnpm build`, open `packages/greeting/dist/index.d.ts`.
- Add a second package next to `packages/greeting` and use it from the app.
