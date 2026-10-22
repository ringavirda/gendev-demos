import { parseArgs } from "node:util";

// Every example is loaded on demand: some of them open stdin when imported.
const examples = {
  "stdin-events": {
    description: "Prompt over raw stdin data events.",
    run: async () => {
      const { runEventIO } = await import("./examples/eventIO.js");
      runEventIO();
    },
  },
  "readline-question": {
    description: "Same prompt over readline/promises question().",
    run: async () => {
      const { runReadline } = await import("./examples/readline.js");
      await runReadline();
    },
  },
  "readline-events": {
    description: "Same prompt over readline line and close events.",
    run: async () => {
      const { runLineEvents } = await import("./examples/lines.js");
      runLineEvents();
    },
  },
  "readline-for-await": {
    description: "Same prompt over readline/promises and for await.",
    run: async () => {
      const { runForAwait } = await import("./examples/lines.js");
      await runForAwait();
    },
  },
  "emitter-events": {
    description: "Summon princesses with an EventEmitter.",
    run: async () => {
      const { runEmitterEvents } = await import("./examples/emitter.js");
      runEmitterEvents();
    },
  },
  "emitter-promise": {
    description: "Summon princesses with a promise.",
    run: async () => {
      const { runEmitterPromise } = await import("./examples/emitter.js");
      await runEmitterPromise();
    },
  },
  "fs-callbacks": {
    description: "Load the princess files with callbacks.",
    run: async () => {
      const { runFsCallbacks } = await import("./examples/files.js");
      runFsCallbacks();
    },
  },
  "fs-promises": {
    description: "Load the princess files with promises.",
    run: async () => {
      const { runFsPromises } = await import("./examples/files.js");
      await runFsPromises();
    },
  },
  selector: {
    description: "Princess selector CLI with layered classes.",
    run: async () => {
      const { runSelector } = await import("./selector/main.js");
      await runSelector();
    },
  },
};

const usage = () => {
  const width = Math.max(...Object.keys(examples).map((n) => n.length));
  const lines = Object.entries(examples).map(
    ([name, { description }]) => `  ${name.padEnd(width)}  ${description}`,
  );
  return `Usage: pnpm --filter @gendev/node-console start <example>\n\nExamples:\n${lines.join("\n")}`;
};

let positionals;
let values;
try {
  ({ positionals, values } = parseArgs({
    allowPositionals: true,
    options: { help: { type: "boolean", short: "h" } },
  }));
} catch (error) {
  console.error(`${error.message}\n\n${usage()}`);
  process.exit(1);
}
const [name] = positionals;

if (values.help || name === undefined) {
  console.log(usage());
} else if (!Object.hasOwn(examples, name)) {
  console.error(`Unknown example: ${name}\n\n${usage()}`);
  process.exitCode = 1;
} else {
  // Ctrl+D rejects the pending question() with AbortError.
  examples[name].run().catch((error) => {
    if (error.code !== "ABORT_ERR") throw error;
  });
}
