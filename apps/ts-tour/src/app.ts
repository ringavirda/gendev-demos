import { parseArgs } from "node:util";

import { runExamples } from "@gendev/example-runner";
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
};

const names = [...Object.keys(topics), "all"];

function usage(): string {
  return `Usage: pnpm start <topic>...\nTopics:\n${names
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
  const unknown = positionals.find((p) => !names.includes(p));
  if (unknown !== undefined) {
    console.error(`Unknown topic: ${unknown}\n${usage()}`);
    process.exit(1);
  }
  const chosen = positionals.includes("all")
    ? Object.values(topics)
    : positionals.map((p) => topics[p as keyof typeof topics]);
  runExamples(chosen);
}
