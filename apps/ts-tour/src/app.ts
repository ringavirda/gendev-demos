import { parseArgs } from "node:util";

import { runExamples, type ExampleClass } from "@gendev/example-runner";
import {
  ClassExamples,
  DecoratorsExamples,
  GenericExamples,
  LinkedListExamples,
  TypingExamples,
} from "@gendev/ts-examples";

const topics = {
  classes: ClassExamples,
  typing: TypingExamples,
  generics: GenericExamples,
  decorators: DecoratorsExamples,
  "linked-list": LinkedListExamples,
} satisfies Record<string, ExampleClass>;

type Topic = keyof typeof topics;

const names = [...Object.keys(topics), "all"];

function isTopic(name: string): name is Topic {
  return Object.hasOwn(topics, name);
}

function usage(): string {
  return `Usage: pnpm --filter @gendev/ts-tour start <topic>...\nTopics:\n${names
    .map((n) => `  ${n}`)
    .join("\n")}`;
}

let positionals: string[] = [];
try {
  ({ positionals } = parseArgs({ allowPositionals: true }));
} catch (err) {
  console.error(`${(err as Error).message}\n${usage()}`);
  process.exit(1);
}

if (positionals.length === 0) {
  console.log(usage());
} else {
  const unknown = positionals.find((p) => p !== "all" && !isTopic(p));
  if (unknown !== undefined) {
    console.error(`Unknown topic: ${unknown}\n${usage()}`);
    process.exit(1);
  }
  const chosen = positionals.flatMap((p) =>
    p === "all" ? Object.values(topics) : isTopic(p) ? [topics[p]] : [],
  );
  if (!runExamples(chosen)) process.exitCode = 1;
}
