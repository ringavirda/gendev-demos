# node-console

Small console programs that show how Node.js does input and output. Pick one by name:

    pnpm --filter @gendev/node-console start <example>

Without a name the list of examples is printed.

| Name               | File                 | What it shows                                           |
| ------------------ | -------------------- | ------------------------------------------------------- |
| stdin-events       | examples/eventIO.js  | A prompt over raw stdin `data` events                   |
| readline-question  | examples/readline.js | The same prompt over `readline/promises` question()     |
| readline-events    | examples/lines.js    | The same prompt over readline `line` and `close` events |
| readline-for-await | examples/lines.js    | The same prompt over `for await` on the interface       |
| emitter-events     | examples/emitter.js  | Summoning princesses with an `EventEmitter`             |
| emitter-promise    | examples/emitter.js  | Summoning princesses with a promise                     |
| fs-callbacks       | examples/files.js    | Loading `data/*.txt` with error-first callbacks         |
| fs-promises        | examples/files.js    | Loading `data/*.txt` with `node:fs/promises`            |
| selector           | selector/main.js     | A princess selector CLI split into classes              |

## Selector

    pnpm --filter @gendev/node-console start selector

A prompt that runs commands on the princess categories. The files, in dependency order:

- `selector/repository.js`: `PrincessRepository`, the categories in memory and in a JSON file
- `selector/cli.js`: `CLI`, reading lines and printing colored messages
- `selector/executor.js`: `Executor`, finds a command by its first word and checks the word count
- `selector/commands.js`: `createCommands`, the commands over a repository and a CLI
- `selector/main.js`: `runSelector`, creates the objects and passes them to each other by hand

Commands:

- `list`, `ls` `[category]`: show the categories, or the princesses of one
- `get`, `g` `<category> <princess>`: select a princess
- `getrnd`, `gr` `<category>`: select a random princess
- `add`, `a` `<category> <name>`: add a princess
- `remove`, `rm` `<category> <princess>`: remove a princess
- `change`, `ch` `<category> <princess> <newName>`: rename a princess
- `help`, `h` `[command]`: show the command list or one command
- `exit`, `quit`, `q`: leave; Ctrl+D and Ctrl+C leave as well

A princess is given by index or by name; a word of digits only is an index.

The state is saved after every change in `data/selector.json` of this app, created on the first
change and left out of git. Set `SELECTOR_DATA` to use another file; a relative path is taken
from the folder the command runs in, which is this app under `pnpm --filter`. A file that
cannot be read stops the selector with exit code 1 and is left as it was.

## Events and async

Most Node.js packages offer both interfaces: callbacks and events on one side, promises and
async iteration on the other. Each pair above does the same job, so the two styles can be
read side by side. The readline, emitter and fs pairs each share a file; the first pair,
stdin-events and readline-question, is two files.

Prefer the async half. It reads top to bottom, errors travel through `try` and `catch` or a
rejection instead of an `error` event nobody may be listening to, and loops are loops. Events
fit what happens many times or at unknown moments, such as input lines; callbacks need a
pending counter to wait for several things, where `Promise.all` needs one line.
