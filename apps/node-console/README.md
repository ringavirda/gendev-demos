# node-console

Small console programs that show how Node.js does input and output. Pick one by name:

    pnpm --filter @gendev/node-console start <example>

Without a name the list of examples is printed.

| Name               | File                     | What it shows                                           |
| ------------------ | ------------------------ | ------------------------------------------------------- |
| stdin-events       | examples/eventIO.js      | A prompt over raw stdin `data` events                   |
| readline-question  | examples/readline.js     | The same prompt over `readline/promises` question()     |
| readline-events    | examples/lines.js        | The same prompt over readline `line` and `close` events |
| readline-for-await | examples/lines.js        | The same prompt over `for await` on the interface       |
| emitter-events     | examples/emitter.js      | Summoning princesses with an `EventEmitter`             |
| emitter-promise    | examples/emitter.js      | Summoning princesses with a promise                     |
| fs-callbacks       | examples/files.js        | Loading `data/*.txt` with error-first callbacks         |
| fs-promises        | examples/files.js        | Loading `data/*.txt` with `node:fs/promises`            |
| commands           | examples/commands/cli.js | A princess selector CLI with a command list             |

## Events and async

Most Node.js packages offer both interfaces: callbacks and events on one side, promises and
async iteration on the other. Each pair above does the same job, so the two styles can be
read side by side. The readline, emitter and fs pairs each share a file; the first pair,
stdin-events and readline-question, is two files.

Prefer the async half. It reads top to bottom, errors travel through `try` and `catch` or a
rejection instead of an `error` event nobody may be listening to, and loops are loops. Events
fit what happens many times or at unknown moments, such as input lines; callbacks need a
pending counter to wait for several things, where `Promise.all` needs one line.
