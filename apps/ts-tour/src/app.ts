import { parseArgs } from "node:util";

import { runExamples, type ExampleClass } from "@gendev/example-runner";
import { StdDecoratorExamples } from "@gendev/std-decorators";
import {
  ClassExamples,
  DecoratorsExamples,
  GenericExamples,
  InheritanceExamples,
  LinkedListExamples,
  NarrowingExamples,
  ParadigmsExamples,
  PolymorphismExamples,
  TypeLevelExamples,
  TypingExamples,
} from "@gendev/ts-examples";

const topics = {
  typing: TypingExamples,
  narrowing: NarrowingExamples,
  generics: GenericExamples,
  paradigms: ParadigmsExamples,
  classes: ClassExamples,
  inheritance: InheritanceExamples,
  polymorphism: PolymorphismExamples,
  "linked-list": LinkedListExamples,
  decorators: DecoratorsExamples,
  "std-decorators": StdDecoratorExamples,
  "type-level": TypeLevelExamples,
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
  const chosen: ExampleClass[] = [];
  for (const p of positionals) {
    if (p === "all") chosen.push(...Object.values(topics));
    else if (isTopic(p)) chosen.push(topics[p]);
  }
  if (!runExamples(chosen)) process.exitCode = 1;
}
