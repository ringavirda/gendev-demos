# browser-basics

One page in four stages, from markup to a list fetched from a public API. Every stage is a
folder that works on its own; each adds one idea to the one before.

    pnpm --filter @gendev/browser-basics start

serves the folder at http://localhost:8080/ with caching off, so a reload shows `200` in the
Network tab. The page reloads by hand.

    pnpm --filter @gendev/browser-basics dev

serves it with Vite at http://localhost:5173/ and reloads the browser when a file is saved.

Open a stage by its folder with a trailing slash, for example http://localhost:8080/2-css/.

| Stage   | What it adds                                                     |
| ------- | ---------------------------------------------------------------- |
| 1-html  | Six cards written by hand, no style                              |
| 2-css   | `style.css`: custom properties, the card as a box, a grid        |
| 3-dom   | An empty list in the markup, the cards built by `main.js`        |
| 4-fetch | The ponies from `fetch`, a loading line, errors, a "More" button |

## Recorded mode

`4-fetch/main.js` has one line that names the data:

    const API_URL = "https://ponyapi.net/v1/character/all?limit=6";

Change it to

    const API_URL = "./ponies.json";

and the page reads the response recorded in `4-fetch/ponies.json` instead of the network. The
file holds the first six ponies, and a static file ignores the query, so "More" shows the same
six again.

## Live Server

Instead of a command, open the repository folder in VS Code, right-click a stage's
`index.html` and choose Open with Live Server. The page reloads on save.

## A taken port

The servers use fixed ports and do not move to another one. If a port is taken, the error
names it (`EADDRINUSE` for `start`, `Port 5173 is already in use` for `dev`). Stop the other
server, or the other copy of this one, and start again.
