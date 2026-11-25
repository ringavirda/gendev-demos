# web-page

A starter for a web page that asks a public API for data and shows it. Make your
own copy and run it:

```
pnpm dlx tiged ringavirda/gendev-demos/templates/web-page my-page
cd my-page
pnpm install
pnpm dev
```

`pnpm dev` serves the page at http://localhost:5174/ and reloads the browser
when you save a file. The page asks https://ponyapi.net for six ponies and
draws a card for each.

Without a terminal: open the folder in VS Code, right-click `index.html` and
choose Open with Live Server.

## Scripts

- `pnpm dev` serves the page with Vite on port 5174 and reloads it on every
  change. If the port is taken it stops instead of using another one.
- `pnpm start` serves the folder as it is with http-server on port 8090, with
  caching off, so a reload shows `200` in the Network tab.
- `pnpm typecheck` checks `main.js` with tsc without writing files.
- `pnpm lint` runs ESLint over the project.
- `pnpm format` formats the project with Prettier.

pnpm runs a dependency's install script only when pnpm-workspace.yaml allows
it; none of the dependencies here has one.

## Files

- `package.json` holds the scripts and dependencies. `packageManager` pins the
  pnpm version this template was made with, so corepack uses it.
- `pnpm-workspace.yaml` keeps pnpm inside this folder, so it does not look for
  a workspace in a folder above.
- `tsconfig.json` makes tsc read `main.js` as JavaScript and check it against
  the browser's types.
- `eslint.config.js` sets the ESLint rules for JavaScript with the browser's
  globals.
- `.editorconfig` and `.prettierignore` are read by Prettier: 80 columns, two
  spaces, and `pnpm-lock.yaml` is skipped.
- `.gitignore` keeps `node_modules` out of git.
- `index.html` is the page: a loading line and an empty list.
- `style.css` styles the cards and the loading line.
- `main.js` asks the API for the ponies and builds a card for each. The
  address is the `API_URL` line at the top.

## Things to try

- Change `API_URL` to another API from the list below and show its data
  instead of ponies.
- Show another field on the card: open the API URL in a tab, pick a field the
  card does not show, such as `occupation`, and add it in `main.js`.
- Break the URL (`ponyapi.net/v2/...`), reload, and read the error in the
  Console and the Network tab.
- Misspell `document` in a read, for example `const x = documnet.title;`, and
  run `pnpm typecheck`.

## Public APIs

Checked on 2026-11-25: no key, answers 200 with `access-control-allow-origin:
*`, so a page on any address may read it.

- PonyAPI: https://ponyapi.net/v1/character/all?limit=6 lists characters of
  the show.
- PokeAPI: https://pokeapi.co/api/v2/pokemon?limit=6 lists Pokemon.
- Rick and Morty API: https://rickandmortyapi.com/api/character lists
  characters of the show.
- Cat Facts: https://catfact.ninja/facts?limit=5 lists facts about cats.
- Dog CEO: https://dog.ceo/api/breeds/image/random gives one picture of a dog.
- Open-Meteo: https://api.open-meteo.com/v1/forecast?latitude=50.45&longitude=30.52&current_weather=true
  gives the current weather at a place.
